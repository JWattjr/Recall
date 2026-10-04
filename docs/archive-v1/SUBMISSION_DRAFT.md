# Recall — Portal submission draft

**Status:** submission-ready application and owner review package; not submitted. The correction and simulator limitations below remain explicit.

**Application:** https://recall-genlayer.vercel.app
**Repository:** https://github.com/JWattjr/evidence-retraction-registry

Recall turns semantic evidence changes into bounded authorization changes. Users register publications and synthetic research grant decisions with explicit dependencies. GenLayer independently judges a correction or retraction; deterministic code versions changed evidence and atomically disables every reachable future authorization. Unrelated branches remain active. Owners explicitly reassess against current evidence, creating new versions; downstream decisions remain blocked until separately reviewed.

The Next.js workspace opens on a recorded real-publication retraction, with a diagram, accessible mobile list, selected-record explanations, proof/history, live finalized-state reads and wallet forms. Local rehearsal is labeled and produces no fake hashes. Sources/decisions use a bounded manifest because the contract has no listing views.

On StudioNet 61999 at `0x432960e720542c0EAB68f76a4274fBf972A19a31`, original finalized receipts were revalidated against deployed source and ABI. Fresh grant-branch retraction and owner reassessment succeeded: `grant-policy-review` became ACTIVE v2, SUPPORTED against COPE guidance; `grant-release-review` remained blocked and independent decision-c stayed active. [Proof manifest](docs/PROOF_MANIFEST.md) contains hashes and full records.

22 mocked contract tests and 16 frontend tests pass; GenVM lint, ABI extraction, strict TypeScript, production build and production dependency audit pass. Recorded exploration, mobile/keyboard controls, preflight, proof/history and live alignment were browser checked. All five deployed registration/retraction/reassessment writes were completed in Chrome through Rabby with user-approved signatures, finalized successfully, and matched actual state. The parent recovered to ACTIVE v2, SUPPORTED; its child remained blocked v1. [Browser-wallet proof](deployments/recall-browser-wallet-2026-10-04.json) records the full flow and sanitized receipts.

Authentic published material-correction evidence was fetched off-chain, but two live attempts returned UNCERTAIN leader results and no corresponding notice persisted in finalized reads. Live material-correction propagation is not claimed. StudioNet is hosted simulation; production blockchain operation is untested.

The contribution is continuing evidence dependency management rather than a prediction market or charter acceptance judgment. Recall does not certify scientific truth, institutional authority or publisher identity and cannot reverse payments. See [limitations](docs/SECURITY_NOTES.md), [tutorial](docs/TUTORIAL.md), [demo](docs/DEMO.md), and [current authenticated Portal criteria](docs/PORTAL_RULES.md). Projects is the currently observed category for a full app; acceptance and points remain subject to current rules and steward review. The tutorial supports this submission; no additive award is promised.
