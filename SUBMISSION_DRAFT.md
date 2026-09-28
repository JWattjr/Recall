# Submission draft — Evidence Retraction Registry

**Status:** StudioNet demonstration completed. This project has not been submitted to the GenLayer Portal.

## Contribution

The registry versions a changed evidence source and synchronously disables authorizations that depend on it, while preserving unrelated branches until affected owners reassess their decisions.

## Live evidence

On GenLayer StudioNet, chain 61999, the deployed source matched Git. A PubMed-indexed retraction notice was judged RETRACTION. Source report-a advanced from ACTIVE version 1 to RETRACTED version 2; decision-a and downstream decision-b were blocked; independent decision-c stayed active. A stale notice replay finalized as the expected rollback. All five public views were read back. The run finalized eight transactions: seven successful leader executions and one expected rollback.

The source references are public Crossref/PubMed records, but the authorization decisions and owners are synthetic fixtures. The demo proves the contract transition and dependency propagation for this fixture; it does not validate real institutional authority or reverse any external decision, right, or payment.

## Actual run types

- Direct mode: 10 parameter-expanded tests passed with mocked web and model responses.
- Static/SDK: 3 GenVM lint checks passed; SDK validation reported 9 methods; ABI schema extraction succeeded.
- Live: 8 StudioNet transactions finalized, including one expected stale-replay rollback. No separate integration suite or live reassessment was run.
- Source preflight: Crossref metadata HTTP 200/445 bytes; PubMed notice HTTP 200/580 bytes; unrelated PubMed guidance HTTP 200/2,473 bytes; all had zero redirects and valid UTF-8.

## Self-review

- Technical readiness: PASS.
- Distinctiveness: PASS against the named local portfolio comparators; no ecosystem-wide originality claim.
- Evidence readiness: pending anonymous public URL checks.
- Provisional verdict: READY WITH CAVEATS.

Remaining limits: publisher identity, signatures, redirects, DNS resolution, and freshness are not verified; the live demonstration covered only a retraction and stale replay; direct tests mock external evidence; the contract cannot reverse external actions. The contract does not expose a separate on-chain fetch status or byte count.

See the release record at deployments/studionet-release-2026-09-28.json, the distinctiveness review at docs/DISTINCTIVENESS.md, and the test matrix at docs/TEST_MATRIX.md.
