# Owner submission handoff

Submission-ready for owner review. The browser-wallet release record confirms `flow_complete: true`: all five writes finalized and matched actual registry state.

Use the current **Projects** category after checking its form. Recall has not been submitted automatically.

| Field | Prepared value |
|---|---|
| Name | Recall — evidence changes, decisions follow |
| Application | https://recall-genlayer.vercel.app |
| Repository | https://github.com/JWattjr/evidence-retraction-registry |
| Contract | `0x432960e720542c0EAB68f76a4274fBf972A19a31` |
| Network | StudioNet, chain 61999, hosted development simulator |

## Description to paste

Recall answers: “This evidence was corrected or withdrawn. Which decisions now need reviewing?” Users register publications and synthetic research grant authorizations with explicit dependencies. GenLayer independently reads the evidence and judges a correction or retraction. Deterministic contract code versions changed evidence and atomically disables reachable future authorizations, preserving unrelated branches. The decision owner explicitly reassesses against current evidence; recovering a parent leaves its children blocked.

The deployed Next.js workspace includes recorded exploration without a wallet, live finalized-state reads, a dependency diagram and accessible mobile list, wallet registration/notice/reassessment forms, publication preflight, proof/history, transaction tracking and state readback. Local rehearsal is clearly labeled and produces no fake transaction IDs. The contract has finite bounds and no global listing API, so the app uses an explicit case manifest.

Fresh finalized proof demonstrates a real-publication retraction, dependent authorization blocking, successful owner recovery and a child that remains blocked. The deployed app completed all five writes through Chrome/Rabby with user-approved signatures, then verified finalized receipts and state. The repository includes source/ABI alignment, transaction records, reproducible setup, architecture, a tutorial and a two-minute demo. 22 mocked contract tests and 16 frontend tests pass, alongside lint, strict TypeScript and production builds.

StudioNet is hosted simulation; production blockchain operation is untested. Live material-correction propagation remains unproven: authentic correction attempts returned UNCERTAIN leader results without a stored notice. Recall does not certify scientific truth, publisher identity or institutional authority, and cannot reverse completed payments.

## Supporting links

- [Proof manifest](PROOF_MANIFEST.md)
- [Browser-wallet release record](../deployments/recall-browser-wallet-2026-10-04.json)
- [Complete submission draft](../SUBMISSION_DRAFT.md)
- [Two-minute demo](DEMO.md)
- [Tutorial](TUTORIAL.md)
- [Verification and boundaries](RELEASE_VERIFICATION.md)
- [Portal criteria checked 4 October](PORTAL_RULES.md)

Before pressing Submit, check the current form/category, paste the public links and description, and retain the correction/simulator limitations. Use genuine proof for any attachment the form requests. Acceptance and points remain subject to steward review; no additive tutorial award is promised.
