# Test matrix

Run `python -m pytest` from the repository root. Tests mock web/model I/O in direct mode and do not establish live network consensus.

| Invariant or behavior | Test |
|---|---|
| Retraction increments source version, blocks direct and transitive dependents, preserves unrelated authorization, and reassessing a parent does not restore its child | `test_retraction_blocks_only_transitive_dependents_and_reassessment_versions_do_not_restore_children` |
| Material correction advances the version, updates current references, blocks dependents, and rejects a stale notice | `test_material_correction_versions_source_and_stale_notice_cannot_invalidate_again` |
| Unavailable current or notice source yields uncertainty and does not block decisions | `test_unavailable_notice_evidence_stays_uncertain_and_does_not_block` |
| Validator rejects changed finding, altered digest, and added leader fields | `test_validator_rejects_changed_notice_finding_stale_snapshot_and_extra_fields` |
| Malformed consensus output fails without changing source version | `test_malformed_notice_output_fails_closed_without_source_version_change` |
| Forward/cyclic decision edges are rejected by requiring registered earlier parent decisions | `test_forward_and_cyclic_decision_dependencies_are_rejected` |

| Every model-returned judgment field is validated and compared or bound to frozen input | `test_every_returned_judgment_field_is_compared_or_snapshot_bound` |
| HTTP error, empty body, oversized body, and invalid UTF-8 produce an uncertain notice without blocking decisions | `test_unavailable_notice_evidence_stays_uncertain_and_does_not_block` (four response cases) |
| Notice validator rejects a forged evidence digest while finding and cited URL remain unchanged | `test_validator_rejects_changed_notice_finding_stale_snapshot_and_extra_fields` |

The current run passed 10 parameter-expanded direct tests. GenVM lint passed 3 checks; SDK validation reported 9 methods (5 views and 4 writes); schema extraction succeeded. No deployment was run.
