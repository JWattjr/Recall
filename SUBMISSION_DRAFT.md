# Recall - Portal submission draft

Prepared for owner review; not submitted.

[Application](https://recall-genlayer.vercel.app) | [Repository](https://github.com/JWattjr/Recall) | [Prepared fields](docs/submission/portal-fields.json)

Recall builds on Evidence Retraction Registry, accepted as an Intelligent Contract on Sep 28. This Project adds an evidence workspace, wallet workflows, two recorded cases, live finalized reads and proof inspection. Users register publications and decisions in a dependency graph. GenLayer validators read the original and notice and judge their relationship; contract code versions changed evidence and blocks every reachable dependent decision while unrelated branches stay active. A real PubMed retraction and numerical erratum each finalized on a new StudioNet instance, advanced the source to v2 and blocked its parent and child. Owner reassessment restored the retraction parent to ACTIVE v2, SUPPORTED against current COPE guidance; its child stayed blocked. Receipts and state reads support both cases. StudioNet is a hosted simulator. Recall does not certify scientific truth, publisher identity or institutional authority.

Contract `0x91C663Df0D7103614485283D3A1E49Cf525f5fda` on StudioNet 61999 finalized 12 successful writes, including deployment. Both notices and owner reassessment matched finalized state reads. [Proof manifest](docs/PROOF_MANIFEST.md) contains hashes and evidence; [verification](docs/RELEASE_VERIFICATION.md) records checks.

Recorded case offers Retraction and Material correction. Live network reads the new instance. Local rehearsal is scripted and produces no transaction. New-instance proofs use the authorized local operator. The earlier Chrome/Rabby flow and inconclusive MRI attempts remain in [deployments/v1](deployments/v1); those wallet signatures belong to v1.

The owner chooses the primary tag from the form's own list, clears reCAPTCHA and submits manually. StudioNet is hosted simulation; production-chain operation is untested. Recall does not authenticate publishers or institutional authority and cannot reverse completed payments. [Demo](docs/DEMO.md) and [tutorial](docs/TUTORIAL.md) support review.
