"""Mocked publication semantics and independently rerun citation agreement."""
import json

from test_registry import deploy, register, llm, URL_A, URL_B, URL_C
from test_shipping import seed


def test_presentation_only_erratum_stores_notice_without_blocking(direct_vm, direct_deploy, direct_owner):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"report-v1$", {"status": 200, "body": "Registered study: response rate was 34%. DOI: 10.1234/fixture"})
    direct_vm.mock_web(r"correction$", {"status": 200, "body": "Erratum to the registered study: the author affiliation was misspelled. All reported results are unchanged. DOI: 10.1234/fixture"})
    direct_vm.mock_llm(r"EVIDENCE RETRACTION NOTICE REVIEW", llm({"finding": "NO_MATERIAL_CHANGE", "citations": [URL_B]}))
    notice = c.submit_notice("study", 1, json.dumps([URL_B]))
    assert notice["finding"] == "NO_MATERIAL_CHANGE"
    assert c.get_notice(notice["notice_id"]) == notice
    assert notice["affected_decisions"] == []
    assert c.get_source("study")["version"] == 1
    assert c.get_decision("parent")["authorization_enabled"]
    assert c.get_decision("child")["authorization_enabled"]
    assert direct_vm.run_validator()


def test_result_changing_erratum_blocks_reachable_but_not_independent(direct_vm, direct_deploy, direct_owner):
    c = seed(direct_vm, direct_deploy, direct_owner)
    c.register_decision(*register("independent", ["other"], []))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"report-v1$", {"status": 200, "body": "Registered study: response rate was 43%. DOI: 10.1234/fixture"})
    direct_vm.mock_web(r"correction$", {"status": 200, "body": "Erratum to the registered study: the response rate should read 34%, not 43%. DOI: 10.1234/fixture"})
    direct_vm.mock_llm(r"EVIDENCE RETRACTION NOTICE REVIEW", llm({"finding": "MATERIAL_CORRECTION", "citations": [URL_A, URL_B]}))
    notice = c.submit_notice("study", 1, json.dumps([URL_B]))
    assert notice["finding"] == "MATERIAL_CORRECTION"
    assert c.get_source("study")["version"] == 2
    assert c.get_source("study")["status"] == "CORRECTED"
    assert set(notice["affected_decisions"]) == {"parent", "child"}
    assert not c.get_decision("parent")["authorization_enabled"]
    assert not c.get_decision("child")["authorization_enabled"]
    assert c.get_decision("independent")["authorization_enabled"]
    assert direct_vm.run_validator()


def test_notice_validator_agrees_on_citation_order_only(direct_vm, direct_deploy, direct_owner):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r".*", llm({"finding": "MATERIAL_CORRECTION", "citations": [URL_A, URL_B]}))
    notice = c.submit_notice("study", 1, json.dumps([URL_B]))
    keys = ("input_snapshot_digest", "snapshot_digest", "evidence_digest", "source_id", "base_version", "finding", "citations")
    leader = {key: notice[key] for key in keys}
    leader["citations"] = [URL_B, URL_A]
    assert direct_vm.run_validator(leader_result=leader)
    leader["finding"] = "NO_MATERIAL_CHANGE"
    assert not direct_vm.run_validator(leader_result=leader)


def test_reassessment_validator_agrees_on_citation_order_only(direct_vm, direct_deploy, direct_owner):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r".*", llm({"finding": "MATERIAL_CORRECTION", "citations": [URL_B]}))
    c.submit_notice("study", 1, json.dumps([URL_B]))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r".*", {"status": 200, "body": "Current evidence supports the frozen review purpose. DOI: 10.1234/fixture"})
    direct_vm.mock_llm(r".*", llm({"validity": "SUPPORTED", "citations": [URL_B, URL_C], "supporting_decision_ids": []}))
    result = c.reassess_decision("parent", 1, '["study","other"]', "[]")
    leader = {"input_snapshot_digest": result["last_input_snapshot_digest"], "snapshot_digest": result["last_snapshot_digest"], "evidence_digest": result["last_evidence_digest"], "validity": "SUPPORTED", "citations": [URL_C, URL_B], "supporting_decision_ids": []}
    assert direct_vm.run_validator(leader_result=leader)
    leader["validity"] = "UNSUPPORTED"
    assert not direct_vm.run_validator(leader_result=leader)
