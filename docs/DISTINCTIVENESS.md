# Distinctiveness audit

Scope: contract source review against the other nine portfolio contracts, the named standalone contracts, and relevant local projects. This is a local comparison, not an ecosystem-wide originality claim.

**Disposition: KEEP.** The distinctive mechanism is dependency-aware invalidation after a source changes, followed by explicit versioned reassessment.

| Closest comparator | Its judgment | Participants and actions | Its state changes | Capability or invariant implemented here |
|---|---|---|---|---|
| Standalone Source Conflict Resolution Kernel | Determines whether one fixed claim is supported, contradicted, or inconclusive across registered sources. | An owner supplies the claim/source set; anyone may trigger resolution. | Stores one outcome and attempt history. | A correction or retraction is a later event: it versions the source, blocks every reachable dependent decision, disables authorization, then lets each decision owner replace dependencies and reassess. |
| Standalone Token Claim Capability Gate | Classifies a frozen manifest against a frozen source list and reaches a terminal status. | A deployer freezes the claim/context/source set; callers review it. | Stores per-claim findings and a terminal gate result. | This registry preserves source and decision dependency edges so a later notice can invalidate prior downstream decisions without touching unrelated branches. |
| Standalone TruthGraph | Evaluates predicates over a fixed evidence graph. | A market owner supplies graph and source URLs; callers resolve it. | Stores a single market outcome. | TruthGraph does not version source notices or propagate a changed result through consumers of a prior decision. |
| New Research Novelty Bounty | Judges a claim against the current campaign registry. | Researchers submit serial claims; accepted claims become new registry entries. | Changes later campaign snapshots and rewards. | Both retain history, but this contract tracks source-to-decision dependencies and blocks previously active authorizations after correction/retraction; it does not reward novelty. |
| Local RedemptionGuard | Assesses asset evidence and exposure requests under configured caps. | An owner registers assets and evidence policy; callers request exposure. | Appends assessments and exposure requests. | Its assessment history is asset-local; this contract has explicit parent/child dependency edges and reassessment-gated authorization per decision. |


## Live demonstration and self-review

**One-sentence contribution:** The registry applies a judged correction or retraction to one versioned source, then disables only the authorizations reachable from that source through explicit dependency edges until their owners reassess them.

### Actual run types

- Direct mode: 10 parameter-expanded tests passed, including correction, uncertainty, replay, propagation, and reassessment cases; web and model responses are mocked.
- Static and SDK checks: GenVM lint passed 3 checks; SDK validation reported 9 methods; ABI schema extraction succeeded.
- Live StudioNet: 8 transactions finalized. Deployment, two source registrations, three decision registrations, and one retraction notice executed successfully; replay against the retracted source finalized as an expected rollback. The deployed source Git blob matched the local source commit.
- External source preflight: Crossref metadata, the PubMed retraction notice, and unrelated PubMed guidance returned HTTP 200 with 445, 580, and 2,473 bytes respectively, without redirects and with strict UTF-8.
- Not run live: correction, no-material-change, uncertain notice, and decision reassessment. No Portal review or points claim is made.

### Separate review gates

| Gate | Result | Evidence |
|---|---|---|
| Technical readiness | PASS | StudioNet chain 61999 deployment and source match; the retracted source, two blocked dependents, preserved unrelated branch, expected stale-replay rollback, and all public views were read back. |
| Distinctiveness | PASS | The dependency graph and versioned authorization invalidation differ from the named local comparators; this is a local portfolio comparison, not an ecosystem-wide originality claim. |
| Evidence readiness | PENDING PUBLIC URL CHECKS | The live finding cites the PubMed notice and the public state is captured. Anonymous GitHub checks will be completed after publication. |

**Provisional verdict: READY WITH CAVEATS.** Final evidence readiness is pending the anonymous public URL checks.

### Remaining blockers and limits

- The live run demonstrated one retraction notice; it did not exercise the other notice findings or live reassessment. See contracts/evidence_retraction_registry.py:469 and contracts/evidence_retraction_registry.py:619.
- Fetches enforce a 5,000-byte body bound and strict UTF-8, but do not verify publisher identity, signatures, redirects, DNS resolution, or freshness. See contracts/evidence_retraction_registry.py:122 and README.md:39.
- All authorization decisions and owners were synthetic fixtures. The registry records workflow state; it does not reverse external rights, decisions, or payments.
