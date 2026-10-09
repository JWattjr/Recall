# Owner submission handoff

Prepared for owner review. Nothing was submitted to the Portal.

Use [portal-fields.json](submission/portal-fields.json) for the exact form text and public links. Choose the primary tag from the form's own list, clear reCAPTCHA and submit manually.

Application: https://recall-genlayer.vercel.app
Repository: https://github.com/JWattjr/Recall
Contract: `0x91C663Df0D7103614485283D3A1E49Cf525f5fda` on StudioNet 61999, hosted development simulator.

## Description

Recall builds on Evidence Retraction Registry, accepted as an Intelligent Contract on Sep 28. This Project adds an evidence workspace, wallet workflows, two recorded cases, live finalized reads and proof inspection. Users register publications and decisions in a dependency graph. GenLayer validators read the original and notice and judge their relationship; contract code versions changed evidence and blocks every reachable dependent decision while unrelated branches stay active. A real PubMed retraction and numerical erratum each finalized on a new StudioNet instance, advanced the source to v2 and blocked its parent and child. Owner reassessment restored the retraction parent to ACTIVE v2, SUPPORTED against current COPE guidance; its child stayed blocked. Receipts and state reads support both cases. StudioNet is a hosted simulator. Recall does not certify scientific truth, publisher identity or institutional authority.

## Expected outcome

Recorded case offers Retraction and Material correction: each shows source v2, both dependent authorizations blocked, and an independent active branch. Proof & history shows FINALIZED / SUCCESS receipts, citations and digests for both notices. Live network shows the retraction parent ACTIVE v2 after owner reassessment; its child and both correction decisions remain blocked. The network check verifies every new receipt, deployed source/ABI and final state of both cases.

Field lengths: one-liner 158/180; description 932/1000; expected outcome 473/500.

[Proof](PROOF_MANIFEST.md), [full release](../deployments/recall-v2-release.json), [verification](RELEASE_VERIFICATION.md), [demo](DEMO.md), and [tutorial](TUTORIAL.md) support review. The video field remains empty; no URL is invented. V1 proofs and documents remain archived.
