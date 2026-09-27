# Security notes

## Graph and authority

- Anyone may register sources, record decision dependencies, or submit a notice. A decision's registering sender becomes its owner; only that owner may reassess it.
- Source and decision IDs are bounded. Decisions may refer only to already registered active decisions. This monotonic registration rule prevents cycles. Each decision has at most four source and four decision parents; a parent has bounded fanout.
- On an accepted correction or retraction, the source version changes and a deterministic breadth-first traversal blocks all reachable decisions in the same atomic transaction. Traversal is capped by the 24-record graph size. A failed transaction cannot leave only part of that known branch blocked.
- Decision owners must pass the current expected version. Reassessment records the current parent versions and an exact snapshot digest, increments the decision version, and explicitly chooses the replacement dependencies. Downstream decisions stay blocked until separately reassessed.

## Consensus and sources

- For a notice, both the current registered reference and at least one new notice reference must be available to produce a determinate judgment. Validators independently fetch and judge the pair. The schema binds the source ID, base version, digest, and citations.
- Notice and reassessment outputs reject unknown fields, invented references, bad parent IDs, stale versions, and validator disagreement. No source basis produces `UNCERTAIN`, which does not invalidate or reactivate an authorization.
- Fetch accepts nonempty UTF-8 bodies up to 5,000 bytes from syntax-checked HTTPS public-DNS URLs. Publisher identity, cryptographic signatures, DNS resolution, redirects, timestamps, and semantic freshness are not verified. Page text is untrusted prompt input.

## Limits

- The graph is bounded to 12 sources, 24 decisions, 16 notices, eight dependencies per decision, and eight versions per record. Reassessment history has a fixed cap.
- The record describes internal authorization state. It cannot cancel or reverse external payments, messages, or finalized chain transactions.
- Direct tests mock web/model behavior. Live validator behavior, network finality, and the pinned runner's availability on a target chain are unverified.
