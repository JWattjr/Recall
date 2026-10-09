"""Authentic Europe PMC fixtures and strict validator evidence stability."""
import json
import re
from pathlib import Path
from types import SimpleNamespace
import pytest
from test_registry import deploy, llm, URL_A
from scripts.evidence_preflight import contract_helpers

FIXTURES = Path(__file__).parent / "fixtures/europe-pmc"


def url(pmid):
    return f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:{pmid}%20AND%20SRC:MED&resultType=core&format=json"


@pytest.mark.parametrize("pmid,identifier,finding", [("29940049", "10.11607/prd.476", "RETRACTION"), ("29294252", "10.1007/s12687-017-0310-z", "MATERIAL_CORRECTION")])
def test_real_europe_pmc_fixtures_match_original_identifier(direct_vm, direct_deploy, direct_owner, pmid, identifier, finding):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source("study", URL_A, "Authentic fixture", identifier, "[]")
    direct_vm.mock_web(r".*", {"status": 200, "body": (FIXTURES / (pmid + ".json")).read_text(encoding="utf-8")})
    direct_vm.mock_llm(r".*", llm({"finding": finding, "citations": [url(pmid)]}))
    notice = c.submit_notice("study", 1, json.dumps([url(pmid)]))
    assert notice["finding"] == finding and notice["identifier_match"]
    assert "www.ebi.ac.uk" in notice["authorized_hosts"]
    assert direct_vm.run_validator()


def test_europe_pmc_byte_layout_and_volatile_metadata_do_not_change_digest(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source("study", url("29641633"), "Authentic fixture", "10.11607/prd.476", "[]")
    first = (FIXTURES / "29940049.json").read_text(encoding="utf-8")
    row = json.loads(first)
    row["request"] = {"queryString": "different transport metadata"}
    row["resultList"]["result"][0]["citedByCount"] = 99999
    row["resultList"]["result"][0]["title"] = "  Notice   of\nRetraction. "
    second = json.dumps(row, indent=4, ensure_ascii=True)
    assert first != second
    helpers = contract_helpers()
    assert helpers["_digest"](helpers["_publication_text"](url("29940049"), first)) == helpers["_digest"](helpers["_publication_text"](url("29940049"), second))
    original = (FIXTURES / "29641633.json").read_text(encoding="utf-8")
    direct_vm.mock_web(re.escape(url("29641633")), {"status": 200, "body": original})
    direct_vm.mock_web(re.escape(url("29940049")), {"status": 200, "body": first})
    direct_vm.mock_llm(r".*", llm({"finding": "RETRACTION", "citations": [url("29940049")]}))
    assert c.submit_notice("study", 1, json.dumps([url("29940049")]))["finding"] == "RETRACTION"
    direct_vm.clear_mocks()
    direct_vm.mock_web(re.escape(url("29641633")), {"status": 200, "body": original})
    direct_vm.mock_web(re.escape(url("29940049")), {"status": 200, "body": second})
    direct_vm.mock_llm(r".*", llm({"finding": "RETRACTION", "citations": [url("29940049")]}))
    assert direct_vm.run_validator()


def test_europe_pmc_substantive_change_still_rejects_validator(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source("study", URL_A, "Authentic fixture", "10.11607/prd.476", "[]")
    first = (FIXTURES / "29940049.json").read_text(encoding="utf-8")
    direct_vm.mock_web(r".*", {"status": 200, "body": first})
    direct_vm.mock_llm(r".*", llm({"finding": "RETRACTION", "citations": [url("29940049")]}))
    c.submit_notice("study", 1, json.dumps([url("29940049")]))
    changed = json.loads(first)
    changed["resultList"]["result"][0]["abstractText"] += " Substantive changed evidence."
    direct_vm.clear_mocks()
    direct_vm.mock_web(r".*", {"status": 200, "body": json.dumps(changed)})
    direct_vm.mock_llm(r".*", llm({"finding": "RETRACTION", "citations": [url("29940049")]}))
    assert not direct_vm.run_validator()


def test_europe_pmc_structured_pmid_is_exact():
    helpers = contract_helpers()
    record = helpers["_publication_text"](url("29294252"), (FIXTURES / "29294252.json").read_text(encoding="utf-8"))
    assert helpers["_identifier_matches"]("PMID:28664264", record)
    assert not helpers["_identifier_matches"]("PMID:2866426", record)
    assert not helpers["_identifier_matches"]("PMID:28664264", "bare number 28664264")


@pytest.mark.parametrize("status", [429, 503])
def test_transient_fetch_retries_once_and_then_succeeds(direct_vm, direct_deploy, direct_owner, monkeypatch, status):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source("study", url("29641633"), "Authentic fixture", "10.11607/prd.476", "[]")
    import genlayer.gl as legacy
    calls = []
    def get(requested):
        calls.append(requested)
        code = status if calls.count(requested) == 1 else 200
        pmid = "29641633" if requested == url("29641633") else "29940049"
        return SimpleNamespace(status=code, body=(FIXTURES / (pmid + ".json")).read_bytes())
    monkeypatch.setattr(legacy.nondet.web, "get", get)
    direct_vm.mock_llm(r".*", llm({"finding": "RETRACTION", "citations": [url("29940049")]}))
    notice = c.submit_notice("study", 1, json.dumps([url("29940049")]))
    assert notice["finding"] == "RETRACTION"
    assert calls.count(url("29641633")) == 2 and calls.count(url("29940049")) == 2
    assert direct_vm.run_validator()


def test_europe_pmc_wrong_record_binding_is_unavailable(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source("study", URL_A, "Authentic fixture", "10.11607/prd.476", "[]")
    direct_vm.mock_web(r".*", {"status": 200, "body": (FIXTURES / "29294252.json").read_text(encoding="utf-8")})
    assert c.submit_notice("study", 1, json.dumps([url("29940049")]))["finding"] == "UNCERTAIN"
