# Test matrix — steward protections

Direct mode mocks external documents/model judgment. Selected cases explicitly rerun captured validators; this is not full network consensus. Existing fixtures now supply the required identifier/hosts and source-history bounds are expanded for append-only contests. The prior 26 invariants remain covered.

| Steward requirement | Direct tests in tests/test_steward_protections.py |
|---|---|
| Registrant quotas isolate a second address; >16 uncertain results across sources do not exhaust a shared notice cap | test_quota_isolation |
| Two uncertain results stop all further notices before consensus; registrant can reset | test_third_uncertain_preconsensus_and_registrant_reset |
| Unauthorized caller, authorization, revocation and registrant-only management | test_reporter_access |
| Canonical IDs prevent reporter/reset phantom source keys | test_management_uses_canonical_source_key |
| Foreign, look-alike and trailing-dot host rejected before consensus | test_host_gate (3) |
| Invalid DOI/PMID and invalid/duplicate/oversized host lists | test_invalid_identifier_rejected (6), test_invalid_notice_host_list_rejected (4) |
| Missing DOI/PMID and injection cannot force correction/retraction | test_identifier_gate (4) |
| Error contest restores append-only source version and sole-blocked decisions; dishonest validator finding rejected | test_contest_restore |
| Later owner review preserved; changed upstream basis prevents child restoration | test_overturn_does_not_undo_separate_owner_reassessment |
| Another notice remains a blocker and newer evidence survives an older overturn | test_second_notice_remains_blocker_and_older_overturn_preserves_new_evidence |
| Contest owner/window/once/host gates; uncertainty leaves blocks | test_contest_guards |
| Confirmed retraction only accepts a matching publisher reversal | test_confirmed_retraction_only_publisher_reversal_path |
| Default NCBI host and matching PMID permit material correction; owner recovers parent, child stays blocked | test_recovery_children |

Total: 70 direct cases (26 earlier cases, 44 new parameter-expanded cases). GenVM lint: 3 checks; SDK schema: 13 methods (5 views, 8 writes). Frontend: 21 tests, including source-target planning and matching contest/reporter/reset readbacks, plus the prior graph/finality/wallet/partial-merge checks. Strict TypeScript, build and independent live verification are required before handoff; results are recorded in RELEASE_VERIFICATION.md.

Live proof is separate: a new source/ABI-aligned StudioNet instance, real PubMed retraction and numerical correction, blocked direct/transitive dependents, independent branch active, owner recovery with child blocked, and two deliberate deterministic rejected transactions. Contest overturn/reversal remains direct-test-only because no authentic publisher counter-notice was supplied.

`finalized majority disagreement never reports transaction success` checks a successful leader proposal with rejected consensus, successful agreement, and expected rollback classification.

`test_doi_sentence_punctuation_preserves_exact_identifier_gate` adds five cases: uppercase original DOI with a terminal period/end or terminal period/newline is accepted; `.extra`, `-extra` and `/extra` extensions are rejected. Both leader and independently rerun validator are checked.

`test_validator_diagnostics_preserve_rejection_and_omit_document_content` checks that a disagreeing independent assessment stays rejected while diagnostics disclose only comparison metadata, not document text or reference URLs.

`test_fetch_diagnostics_identify_unavailable_evidence_without_approving_it` adds three validator cases: HTTP 429, oversized response and empty text. Each remains UNCERTAIN, rejects the leader retraction, and logs only request slot/status/type/size/reason without response text or URLs.

Europe PMC cases in tests/test_europe_pmc.py: test_real_europe_pmc_fixtures_match_original_identifier (2); test_europe_pmc_byte_layout_and_volatile_metadata_do_not_change_digest; test_transient_fetch_retries_once_and_then_succeeds (429/503, 2); test_europe_pmc_wrong_record_binding_is_unavailable; test_europe_pmc_substantive_change_still_rejects_validator; test_europe_pmc_structured_pmid_is_exact. Fixtures are authentic REST core responses for PMIDs 29641633, 29940049, 20017220, 28664264 and 29294252.
