# Submission draft — not deployed or submitted

**Status: local draft only. This contract is undeployed and has not been submitted to the GenLayer Portal.**

## Project

`EvidenceRetractionRegistry` stores versioned source records, explicit dependencies, and authorization decisions. A validator-checked correction or retraction advances one source version. A bounded synchronous graph walk disables every dependent authorization and its downstream decisions in one transition. Owners explicitly reassess affected decisions into new versions; downstream records do not silently reactivate.

## Distinguishing mechanism

This project propagates invalidation through dependency edges and preserves unrelated branches. It does not merely classify two claims: the source version change mutates authorization availability across a bounded graph.

## Local verification recorded

- GenVM lint: passed 3 checks.
- Contract validation: 9 methods (5 views, 4 writes).
- ABI schema extraction: succeeded to `contracts/abi.json`.
- Direct-mode tests: 6 passed, covering direct/transitive blocking, unrelated branches, correction, stale notices, malformed leader output, validator disagreement, and explicit versioned reassessment.
- Deployment, live consensus receipts, Portal review, and external payment reversal: not performed.

## Limitations

This registry cannot reverse external actions. Direct tests mock evidence and model responses. Publisher identity, freshness, live network behavior, and deployment compatibility remain unverified. This draft makes no ecosystem originality or Portal-score claim.
