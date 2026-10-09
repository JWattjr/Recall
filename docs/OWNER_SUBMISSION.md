# Recall - submission-ready owner handoff

Existing Portal contribution **bd6c877a…**. The application and evidence are published; the owner pastes the fields and reply and clicks Resubmit manually. No replacement contribution or automated resubmission was created.

[Live application](https://recall-genlayer.vercel.app) | [Repository](https://github.com/JWattjr/Recall) | [Exact Portal fields](submission/portal-fields.json) | [Verification](RELEASE_VERIFICATION.md)

## Contract and live transactions

Contract `0x790b3faD72076e1A5A3eA3C1FE84FfA09435aB05`, StudioNet 61999. Source SHA-256 `fd2d74310d6b59fe58b0a05c8139b143c54436e7dbe98772636855d38590676c`. All 14 receipts are FINALIZED / MAJORITY_AGREE: 12 successful writes, including deployment, and 2 expected host/caller ERROR/rollback rejections. Both authentic notices advanced source v2 and blocked direct/transitive decisions; the independent branch remained active. Owner reassessment restored parent ACTIVE v2 / SUPPORTED while its child stayed blocked.

| Operation | Hash | Execution |
| --- | --- | --- |
| deploy | `0x5a72d4db3d800c1ec16fecf562e0b1be72c3b5b74373262391082b4ac20abc4f` | SUCCESS |
| register_source:report-a | `0x14ce1d2a176d176bf7cfe70a2533fc90f528b6f29f04537bad8467f66f3aac9f` | SUCCESS |
| register_source:report-unrelated | `0x5f15a32b7de7e5561824ce68a246f599a72e0dd9c5f49ef2f84a4299b8363b30` | SUCCESS |
| register_decision:decision-a | `0x24ecdc5247161e2e26554be997ef3416806c3164c24db3c466106cb570c621cb` | SUCCESS |
| register_decision:decision-b | `0x0d87d0350d367d46a44243662c63374d116300cd7fbf746a6adde38b43c2380c` | SUCCESS |
| register_decision:decision-c | `0x710b6a4d88d483176996f90da36758a09d54ffdc05a3a84c59a855a1076f6e1b` | SUCCESS |
| reject_host | `0xa30f80d2c4762f6e516360cfd334cdbcedd1f189dffa1373666edc531bf00e3b` | ERROR (expected) |
| reject_caller | `0x30befba27a70ff5e5e712eb22d86a62566b5c29ebe8be346bf7d0a2cc0bbd09f` | ERROR (expected) |
| submit_notice:report-a | `0xd1bf89c7f34a0e4585cea46d0ab7578ed1d74109d294a257940c5b979a558caf` | SUCCESS |
| reassess_decision:decision-a | `0x8d2bbca3096b2f76cf09c8a5651d53b1db9b77c6191916079c8dc35400d17648` | SUCCESS |
| register_source:correction-study-doi | `0xdeb4b48847a38d069a79c730d831cd7d199d2a40ce03506a60ecf70b78664a02` | SUCCESS |
| register_decision:correction-parent-doi | `0x8db2ea49df34d126c059ded1103225d03df430ac675d6977d9065a63051fcd2c` | SUCCESS |
| register_decision:correction-child-doi | `0x5bbe4eb89455f50ebcb74109432e79dab7f917cec62ed985a4d0592ea1d12194` | SUCCESS |
| submit_notice:correction-study-doi | `0xe3b1a9410728e859e8c1844727f2a178bfdcf68bd62bceee6ff2d01420757313` | SUCCESS |

[Every current and archived v3 hash (54 distinct)](PROOF_MANIFEST.md). Earlier v1/v2 manifests remain archived and linked there. Failed receipts were preserved, not resubmitted.

## New tests and pass counts

70 contract cases pass: 26 earlier cases and the following 44 new parameter-expanded cases. 21 frontend tests, strict TypeScript, production build, all three GenVM lint checks, ABI extraction and all 28 network checks pass. Browser/API and 8 Portal links pass.

| New direct test | Cases passed |
| --- | --- |
| `test_quota_isolation` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_third_uncertain_preconsensus_and_registrant_reset` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_reporter_access` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_management_uses_canonical_source_key` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_host_gate` ([file](../tests/test_steward_protections.py)) | 3 |
| `test_invalid_identifier_rejected` ([file](../tests/test_steward_protections.py)) | 6 |
| `test_invalid_notice_host_list_rejected` ([file](../tests/test_steward_protections.py)) | 4 |
| `test_identifier_gate` ([file](../tests/test_steward_protections.py)) | 4 |
| `test_contest_restore` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_overturn_does_not_undo_separate_owner_reassessment` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_second_notice_remains_blocker_and_older_overturn_preserves_new_evidence` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_contest_guards` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_confirmed_retraction_only_publisher_reversal_path` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_recovery_children` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_doi_sentence_punctuation_preserves_exact_identifier_gate` ([file](../tests/test_steward_protections.py)) | 5 |
| `test_validator_diagnostics_preserve_rejection_and_omit_document_content` ([file](../tests/test_steward_protections.py)) | 1 |
| `test_fetch_diagnostics_identify_unavailable_evidence_without_approving_it` ([file](../tests/test_steward_protections.py)) | 3 |
| `test_real_europe_pmc_fixtures_match_original_identifier` ([file](../tests/test_europe_pmc.py)) | 2 |
| `test_europe_pmc_byte_layout_and_volatile_metadata_do_not_change_digest` ([file](../tests/test_europe_pmc.py)) | 1 |
| `test_europe_pmc_substantive_change_still_rejects_validator` ([file](../tests/test_europe_pmc.py)) | 1 |
| `test_europe_pmc_structured_pmid_is_exact` ([file](../tests/test_europe_pmc.py)) | 1 |
| `test_transient_fetch_retries_once_and_then_succeeds` ([file](../tests/test_europe_pmc.py)) | 2 |
| `test_europe_pmc_wrong_record_binding_is_unavailable` ([file](../tests/test_europe_pmc.py)) | 1 |

New frontend tests in frontend/tests/protections.test.ts cover reporter/reset preflight, contest preflight target, matching reporter/counter readbacks, matching persisted contest and rejection of successful-leader/majority-disagree receipts. The prior 16 frontend cases also pass.

## Paste-ready steward response

874/900 characters in the saved file.

```text
C=contracts/evidence_retraction_registry.py; T=tests/test_steward_protections.py.
1 Capacity/abuse: C:register_source/submit_notice; T:test_quota_isolation/test_reporter_access. Caller rejection: 0x30befba27a70ff5e5e712eb22d86a62566b5c29ebe8be346bf7d0a2cc0bbd09f
2 Provenance: C:_assess_notice/_publication_text; T:test_host_gate/test_identifier_gate; tests/test_europe_pmc.py stability/retry. Host rejection: 0xa30f80d2c4762f6e516360cfd334cdbcedd1f189dffa1373666edc531bf00e3b
3 Erroneous retractions: C:contest_notice/_overturn; T:test_contest_restore. Live window: 0xd1bf89c7f34a0e4585cea46d0ab7578ed1d74109d294a257940c5b979a558caf; overturn/reversal direct-test-only.
4 Updates/recovery: C:reassess_decision; T:test_recovery_children. Parent ACTIVE v2, child blocked: 0x8d2bbca3096b2f76cf09c8a5651d53b1db9b77c6191916079c8dc35400d17648. 70 contract/21 frontend tests pass.
```

## Portal field lengths

One-liner 158/180; description 951/1000; expected outcome 498/500. Primary tag suggestion: Governance, if offered. Demo video remains empty at the owner's request.

One-liner:
When evidence is corrected or retracted, GenLayer validators judge the notice and Recall blocks every decision that depended on it until its owner reviews it.

Description:
Recall extends the accepted Evidence Retraction Registry with an evidence workspace. GenLayer validators independently judge authentic corrections and retractions. Versioned evidence blocks dependent decisions while unrelated branches stay active. Per-registrant quotas (12 sources/24 decisions), global ceilings (256/512), authorized reporters, two UNCERTAIN results per version and 16 notices per source apply before consensus. Frozen exact hosts and DOI/PMID matches bind notices to sources. Europe PMC JSON is canonicalized; transient HTTP failures retry once. A 72-hour registrant contest preserves history; overturns remove only their blockers and preserve later owner reviews. Confirmed retractions accept only publisher reversal. Finalized StudioNet proofs cover correction/retraction, owner recovery and host/caller rejection. Contest/reversal is direct-test-only. StudioNet is simulation; host/identifier checks are not publisher signatures.

Expected outcome:
Recorded cases show retraction and material correction: each source advances to v2, both dependents block and the independent branch stays active. Live network shows owner recovery: parent ACTIVE v2, child blocked. Proof includes FINALIZED success and two expected host/caller rollbacks with unchanged state. Inspect source quotas, identifier, hosts, reporters and notice counts; registrants can manage reporters/reset uncertainty and contest within 72 hours. Overturn/reversal is direct-test-only.

Exact how-to steps, evidence URLs and contract link are in portal-fields.json. All 8 unique nonempty URLs returned HTTP 200.

## Boundaries

Live contest UPHELD/OVERTURNED/UNCERTAIN and publisher-reversal execution remain unproven: no authentic counter-notice was supplied. Those paths, quota isolation, reporter authorization/revocation and uncertainty reset are covered by direct tests; no live quota-exhaustion or Sybil-resistance claim is made. Host/identifier checks are not publisher signatures. Production-chain operation and institutional authority remain untested; StudioNet is hosted simulation and authorizations are synthetic. Current proof used the authorized local operator; earlier Chrome/Rabby receipts remain archived and are not proof of new-instance browser signing.

## Production

Production deployment `dpl_6XqnyL2i6tRwe9oim5w6QEWAGzhe` is READY. Both main branches received app release commit `1d7669c7ef5b7324059b33f8e4cf88b5287ee685`; the final documentation commit preserves those app bytes. [Shipping checks](../deployments/recall-v3-shipping.json) | [Test matrix](TEST_MATRIX.md) | [Demo](DEMO.md) | [Tutorial](TUTORIAL.md).
