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

Historical 28 September direct mode passed 10 parameter-expanded tests. Those results are preserved below; fresh verification follows.

## Live StudioNet result

The demonstration ran on chain 61999 from the pinned runner. All 8 submitted transactions finalized: deployment, two source registrations, three decision registrations, one RETRACTION notice, and one expected stale-replay rollback. The source moved from version 1 ACTIVE to version 2 RETRACTED; decision-a and decision-b became BLOCKED_REASSESSMENT with authorization disabled; decision-c and its unrelated source remained ACTIVE. The on-chain source blob matched the Git source. The release file records all public views and transaction details.

That historical run exercised RETRACTION and guarded replay only. The original record is deployments/v1/studionet-release-2026-09-28.json.

## Fresh 4 October verification

26 direct cases pass: existing propagation, correction, malformed judgments, fetch failures and validator tamper checks, plus tests/test_shipping.py for no-change/uncertainty semantics, SUPPORTED/UNSUPPORTED/UNCERTAIN reassessment, owner/stale checks, missing/invented/duplicate citations and source/decision/notice/version bounds. These use mocked web/model I/O.

16 frontend tests pass: reachability, provisional/finalized/rollback/UNDETERMINED mapping, dependency/URL validation, missing wallet, add/switch, rejected switch, false switch success, signer changes and decoded NOT_FOUND handling. Network tests use a mocked provider. Targeted-read planning and partial-merge tests ensure fresh checks retain target/parent validation without reloading unrelated records or losing existing branches.

3 GenVM lint checks, SDK method validation, ABI extraction, strict TypeScript and production build pass. Fresh retraction and successful owner recovery have finalized receipts and state readback. The new instance proved authentic material correction and retraction with source v2 and blocked direct/transitive dependents; v1 inconclusive attempts remain archived. Chrome/Rabby completed all five deployed writes with user-approved signatures, finalized receipts and state readback; the local credential-backed EIP-1193 harness is separate evidence. See RELEASE_VERIFICATION.md and PROOF_MANIFEST.md.

## V2 definition and citation agreement

Four additional direct cases cover presentation-only erratum storage without blocking, numerical material-correction propagation with an unrelated active branch, notice citation-order agreement, and reassessment citation-order agreement. Changed findings/validity remain rejected; duplicate/invented citations and all digest/version bindings keep their existing checks. Total: 26 contract tests.
