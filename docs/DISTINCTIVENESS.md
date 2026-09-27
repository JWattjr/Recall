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

The source records parent versions in each decision and bounds breadth/history; contracts/evidence_retraction_registry.py (register_decision, submit_notice, _propagate_block, reassess_decision).

**Evidence status:** implemented; the current direct suite passes 6 tests. Phase 3 still needs propagation abuse, validator disagreement, failed-fetch, replay, and history-boundary tests. The StudioNet runner probe passed, but this project has not had its own live demonstration yet.