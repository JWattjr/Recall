"""Additional release invariants. Web and model I/O are mocked, including validators."""
import json
import pytest
from test_registry import deploy, register, llm, URL_A, URL_B, URL_C

def seed(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source('study', URL_A, 'Research Institute')
    c.register_source('other', URL_C, 'Independent source')
    c.register_decision(*register('parent', ['study'], []))
    c.register_decision(*register('child', [], ['parent']))
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'Published correction of the registered study.'})
    return c

@pytest.mark.parametrize('finding', ['NO_MATERIAL_CHANGE', 'UNCERTAIN'])
def test_nonmaterial_notices_preserve_source_and_decision_state(direct_vm, direct_deploy, direct_owner, finding):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r'.*', llm({'finding': finding, 'citations': [URL_B]}))
    n = c.submit_notice('study', 1, json.dumps([URL_B]))
    assert n['affected_decisions'] == []
    assert c.get_source('study')['version'] == 1
    assert c.get_decision('child')['authorization_enabled']
    assert direct_vm.run_validator()

@pytest.mark.parametrize('validity', ['SUPPORTED', 'UNSUPPORTED', 'UNCERTAIN'])
def test_reassessment_outcomes_preserve_children_and_reject_stale_version(direct_vm, direct_deploy, direct_owner, validity):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r'.*', llm({'finding': 'MATERIAL_CORRECTION', 'citations': [URL_B]}))
    c.submit_notice('study', 1, json.dumps([URL_B]))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'Independent source supports the review purpose.'})
    direct_vm.mock_llm(r'.*', llm({'validity': validity, 'citations': [URL_C], 'supporting_decision_ids': []}))
    d = c.reassess_decision('parent', 1, '["other"]', '[]')
    assert d['version'] == 2
    assert d['authorization_enabled'] == (validity == 'SUPPORTED')
    assert c.get_decision('child')['authorization_enabled'] is False
    assert c.get_dependents('SOURCE', 'study')['decision_ids'] == []
    assert c.get_dependents('SOURCE', 'other')['decision_ids'] == ['parent']
    assert direct_vm.run_validator()
    if validity != 'SUPPORTED':
        with direct_vm.expect_revert('version is stale'):
            c.reassess_decision('parent', 1, '["other"]', '[]')

def test_sources_decisions_and_parent_bounds(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    for i in range(12): c.register_source(f's{i}', URL_A, 'Bounded fixture')
    with direct_vm.expect_revert('source registry is full'): c.register_source('overflow', URL_A, 'Fixture')
    with direct_vm.expect_revert('at most four IDs'): c.register_decision(*register('too-many', [f's{i}' for i in range(5)], []))
    for i in range(24): c.register_decision(*register(f'd{i}', ['s0'], []))
    with direct_vm.expect_revert('decision registry is full'): c.register_decision(*register('overflow', ['s0'], []))

def test_notice_and_source_version_bounds(direct_vm, direct_deploy, direct_owner):
    c = deploy(direct_vm, direct_deploy, direct_owner)
    c.register_source('study', URL_A, 'Fixture')
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'A published material correction.'})
    direct_vm.mock_llm(r'.*', llm({'finding': 'MATERIAL_CORRECTION', 'citations': [URL_B]}))
    for version in range(1, 8): c.submit_notice('study', version, json.dumps([URL_B]))
    with direct_vm.expect_revert('source version history is full'): c.submit_notice('study', 8, json.dumps([URL_B]))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'No material change.'})
    direct_vm.mock_llm(r'.*', llm({'finding': 'NO_MATERIAL_CHANGE', 'citations': [URL_B]}))
    for _ in range(9): c.submit_notice('study', 8, json.dumps([URL_B]))
    with direct_vm.expect_revert('notice registry is full'): c.submit_notice('study', 8, json.dumps([URL_B]))

def test_decision_version_bounds_and_malformed_reassessment(direct_vm, direct_deploy, direct_owner):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r'.*', llm({'finding': 'RETRACTION', 'citations': [URL_B]}))
    c.submit_notice('study', 1, json.dumps([URL_B]))
    direct_vm.clear_mocks()
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'Current evidence.'})
    direct_vm.mock_llm(r'.*', llm({'validity': 'SUPPORTED', 'citations': ['https://invented.example.com'], 'supporting_decision_ids': []}))
    with direct_vm.expect_revert('citation binding'): c.reassess_decision('parent', 1, '["other"]', '[]')
    assert c.get_decision('parent')['version'] == 1
    direct_vm.clear_mocks()
    direct_vm.mock_web(r'.*', {'status': 200, 'body': 'Current evidence.'})
    direct_vm.mock_llm(r'.*', llm({'validity': 'UNSUPPORTED', 'citations': [URL_C], 'supporting_decision_ids': []}))
    for version in range(1, 8): c.reassess_decision('parent', version, '["other"]', '[]')
    with direct_vm.expect_revert('decision version history is full'): c.reassess_decision('parent', 8, '["other"]', '[]')

@pytest.mark.parametrize('bad', [
    {'finding':'RETRACTION','citations':['https://invented.example.com']},
    {'finding':'RETRACTION','citations':[]},
    {'finding':'RETRACTION','citations':[URL_B,URL_B]},
    {'finding':'INVENTED','citations':[URL_B]},
])
def test_notice_schema_rejects_invented_or_missing_citations_and_findings(direct_vm, direct_deploy, direct_owner, bad):
    c = seed(direct_vm, direct_deploy, direct_owner)
    direct_vm.mock_llm(r'.*', llm(bad))
    with direct_vm.expect_revert('LLM_ERROR'): c.submit_notice('study', 1, json.dumps([URL_B]))
    assert c.get_source('study')['version'] == 1
    assert c.get_decision('parent')['authorization_enabled']
