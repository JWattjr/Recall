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
- Direct tests mock web/model behavior. Retraction and owner recovery have separate finalized StudioNet receipts and state reads dated 4 October 2026. The runner was compared with deployed code; production-chain availability is unverified.

## Recall frontend

- Fixed read routes expose bounded ABI views. Only an EIP-1193 wallet signs; no public privileged signing endpoint exists. Credentials stay gitignored and outside bundles/new RPC records.
- Preflight uses two fixed URLs, no redirect following, strict UTF-8, streaming size cap and timeout. Contract URL syntax checks do not authenticate publishers, resolved DNS destinations or freshness. Off-chain checks do not strengthen on-chain guarantees.
- The strict schema and bound citations constrain publication prompt injection but do not prove perfect resistance. Registration is declared support, not semantic validation.
- Polling persists IDs, distinguishes provisional acceptance from finality/execution, and has a bounded automatic window. When browser storage is unavailable, users must copy IDs. Receipt success and persisted state are separate evidence.
- V1 MRI attempts remain archived as UNCERTAIN. The new instance separately proved real retraction and an explicit numerical correction with successful finalized receipts and state reads. See PROOF_MANIFEST.md and RELEASE_VERIFICATION.md.
