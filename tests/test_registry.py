import hashlib
import json

import pytest


SDK = "v0.6.0-rc5"
URL_A = "https://publisher.example.org/report-v1"
URL_B = "https://publisher.example.org/correction"
URL_C = "https://other-publisher.example.org/report"
URL_REPLACEMENT = "https://replacement.example.org/report"


def llm(value) -> str:
    """The direct mock decodes once; the v0.6 SDK then parses JSON text."""
    return json.dumps(json.dumps(value))


def deploy(direct_vm, direct_deploy, direct_owner):
    direct_vm.sender = direct_owner
    direct_vm.warp("2030-01-01T12:00:00Z")
    return direct_deploy("contracts/evidence_retraction_registry.py", sdk_version=SDK)


def register(decision_id, source_ids, decision_ids):
    return decision_id, "Authorization record for " + decision_id + " under the frozen review scope.", json.dumps(source_ids), json.dumps(decision_ids)


def address_key(address):
    if isinstance(address, bytes):
        return "0x" + address.hex()
    return str(address).lower()


def test_retraction_blocks_only_transitive_dependents_and_reassessment_versions_do_not_restore_children(
    direct_vm, direct_deploy, direct_owner, direct_alice, direct_bob
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    contract.register_source("report-a", URL_A, "Regional Water Board")
    contract.register_source("report-unrelated", URL_C, "Independent University")
    with direct_vm.prank(direct_alice):
        contract.register_decision(*register("decision-a", ["report-a"], []))
    with direct_vm.prank(direct_bob):
        contract.register_decision(*register("decision-b", [], ["decision-a"]))
    contract.register_decision(*register("decision-c", ["report-unrelated"], []))

    direct_vm.mock_web(r".*", {"status": 200, "body": "Publisher page with a dated notice that the report was withdrawn."})
    direct_vm.mock_llm(r"report-a", llm({"finding": "RETRACTION", "citations": [URL_B]}))
    notice = contract.submit_notice("report-a", 1, json.dumps([URL_B]))
    assert notice["finding"] == "RETRACTION"
    assert notice["affected_decisions"] == ["decision-a", "decision-b"]
    assert direct_vm.run_validator()
    assert contract.get_source("report-a")["version"] == 2
    assert contract.get_source("report-a")["status"] == "RETRACTED"
    assert contract.get_decision("decision-a")["authorization_enabled"] is False
    assert contract.get_decision("decision-b")["status"] == "BLOCKED_REASSESSMENT"
    assert contract.get_decision("decision-c")["authorization_enabled"] is True
    assert contract.get_dependents("SOURCE", "report-a")["decision_ids"] == ["decision-a"]

    with direct_vm.prank(direct_bob):
        with direct_vm.expect_revert("only the decision owner"):
            contract.reassess_decision("decision-a", 1, json.dumps(["report-unrelated"]), "[]")
    contract.register_source("replacement", URL_REPLACEMENT, "Replacement Observatory")
    direct_vm.clear_mocks()
    direct_vm.mock_web(r".*", {"status": 200, "body": "Replacement source with current measurements and methods."})
    direct_vm.mock_llm(r"decision-a", llm({
        "validity": "SUPPORTED", "citations": [URL_REPLACEMENT], "supporting_decision_ids": [],
    }))
    with direct_vm.prank(direct_alice):
        updated = contract.reassess_decision("decision-a", 1, json.dumps(["replacement"]), "[]")
    assert updated["version"] == 2
    assert updated["status"] == "ACTIVE"
    assert updated["authorization_enabled"] is True
    assert contract.get_decision("decision-b")["authorization_enabled"] is False
    assert direct_vm.run_validator()


def test_material_correction_versions_source_and_stale_notice_cannot_invalidate_again(
    direct_vm, direct_deploy, direct_owner, direct_alice
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    contract.register_source("study", URL_A, "Research Institute")
    contract.register_decision(*register("authorization", ["study"], []))
    direct_vm.mock_web(r".*", {"status": 200, "body": "A correction notice changes the published data table."})
    direct_vm.mock_llm(r"study", llm({"finding": "MATERIAL_CORRECTION", "citations": [URL_B]}))
    result = contract.submit_notice("study", 1, json.dumps([URL_B]))
    assert result["finding"] == "MATERIAL_CORRECTION"
    assert contract.get_source("study")["version"] == 2
    assert contract.get_source("study")["status"] == "CORRECTED"
    assert contract.get_source("study")["current_refs"] == [URL_B]
    assert contract.get_decision("authorization")["status"] == "BLOCKED_REASSESSMENT"
    with direct_vm.expect_revert("version is stale"):
        contract.submit_notice("study", 1, json.dumps([URL_A]))


@pytest.mark.parametrize("web_response", [
    pytest.param({"status": 503, "body": b"service unavailable"}, id="non-200"),
    pytest.param({"status": 200, "body": b""}, id="empty"),
    pytest.param({"status": 200, "body": b"x" * 5001}, id="oversized"),
    pytest.param({"status": 200, "body": b"\xff"}, id="invalid-utf8"),
])
def test_unavailable_notice_evidence_stays_uncertain_and_does_not_block(
    direct_vm, direct_deploy, direct_owner, web_response
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    contract.register_source("study", URL_A, "Research Institute")
    contract.register_decision(*register("decision", ["study"], []))
    direct_vm.mock_web(r".*", web_response)
    result = contract.submit_notice("study", 1, json.dumps([URL_B]))
    assert result["finding"] == "UNCERTAIN"
    assert result["affected_decisions"] == []
    assert contract.get_source("study")["version"] == 1
    assert contract.get_decision("decision")["authorization_enabled"] is True


def test_validator_rejects_changed_notice_finding_stale_snapshot_and_extra_fields(
    direct_vm, direct_deploy, direct_owner
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    contract.register_source("study", URL_A, "Research Institute")
    direct_vm.mock_web(r".*", {"status": 200, "body": "The publisher says there is no change to the paper."})
    direct_vm.mock_llm(r"study", llm({"finding": "NO_MATERIAL_CHANGE", "citations": [URL_A]}))
    result = contract.submit_notice("study", 1, json.dumps([URL_B]))
    assert direct_vm.run_validator()
    honest = {
        "input_snapshot_digest": result["input_snapshot_digest"],
        "snapshot_digest": result["snapshot_digest"],
        "evidence_digest": result["evidence_digest"],
        "source_id": "study",
        "base_version": 1,
        "finding": "NO_MATERIAL_CHANGE",
        "citations": [URL_A],
    }
    disagreement = json.loads(json.dumps(honest))
    disagreement["finding"] = "RETRACTION"
    assert direct_vm.run_validator(leader_result=disagreement) is False
    stale = json.loads(json.dumps(honest))
    stale["snapshot_digest"] = "sha256:" + "0" * 64
    assert direct_vm.run_validator(leader_result=stale) is False
    extra = json.loads(json.dumps(honest))
    extra["leader_reason"] = "untrusted metadata"
    assert direct_vm.run_validator(leader_result=extra) is False
    forged_evidence = json.loads(json.dumps(honest))
    forged_evidence["evidence_digest"] = "sha256:" + "0" * 64
    digest_input = {
        "input_snapshot_digest": forged_evidence["input_snapshot_digest"],
        "evidence_digest": forged_evidence["evidence_digest"],
    }
    canonical = json.dumps(digest_input, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    forged_evidence["snapshot_digest"] = "sha256:" + hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    assert direct_vm.run_validator(leader_result=forged_evidence) is False


def test_malformed_notice_output_fails_closed_without_source_version_change(
    direct_vm, direct_deploy, direct_owner
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    contract.register_source("study", URL_A, "Research Institute")
    direct_vm.mock_web(r".*", {"status": 200, "body": "The publisher page and notice are both available."})
    direct_vm.mock_llm(r"study", llm({"finding": "RETRACTION", "citations": [URL_B], "extra": True}))
    with direct_vm.expect_revert("model output has unknown or missing fields"):
        contract.submit_notice("study", 1, json.dumps([URL_B]))
    assert contract.get_source("study")["version"] == 1
    assert contract.get_source("study")["status"] == "ACTIVE"


def test_forward_and_cyclic_decision_dependencies_are_rejected(
    direct_vm, direct_deploy, direct_owner
):
    contract = deploy(direct_vm, direct_deploy, direct_owner)
    with direct_vm.expect_revert("decision is not registered"):
        contract.register_decision(*register("decision-a", [], ["decision-b"]))
    contract.register_source("source-a", URL_A, "Board")
    contract.register_source("source-b", URL_C, "Other Board")
    contract.register_decision(*register("decision-a", ["source-a"], []))
    contract.register_decision(*register("decision-b", ["source-b"], []))
    direct_vm.mock_web(r".*", {"status": 200, "body": "The publisher confirms withdrawal of the registered report."})
    direct_vm.mock_llm(r"source-a", llm({"finding": "RETRACTION", "citations": [URL_B]}))
    contract.submit_notice("source-a", 1, json.dumps([URL_B]))
    contract.register_source("replacement", URL_REPLACEMENT, "Replacement Publisher")
    with direct_vm.expect_revert("must precede"):
        contract.reassess_decision("decision-a", 1, json.dumps(["replacement"]), json.dumps(["decision-b"]))
