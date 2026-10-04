# Recall - Portal submission draft

Prepared for owner review; not submitted.

[Application](https://recall-genlayer.vercel.app) | [Repository](https://github.com/JWattjr/evidence-retraction-registry) | [Prepared fields](docs/submission/portal-fields.json)

Recall answers: this evidence was corrected or withdrawn, so which decisions need reviewing? Users register publications and decisions, such as synthetic research grant approvals, as an explicit dependency graph. GenLayer validators read the original and notice and judge the relationship. Contract code versions changed evidence and disables every reachable downstream decision while unrelated branches stay active. Both paths are proven live on StudioNet: a real PubMed retraction and a real numerical erratum each advanced its source to v2 and blocked its dependent parent and child. Owner reassessment restored the retraction parent to ACTIVE v2, SUPPORTED against current COPE guidance; its child stayed blocked. The app includes both recorded cases, live finalized reads, wallet forms, and receipt/state proof. StudioNet is a hosted simulator. Recall does not certify scientific truth, publisher identity or institutional authority.

Contract `0x91C663Df0D7103614485283D3A1E49Cf525f5fda` on StudioNet 61999 finalized 12 successful writes, including deployment. Both notices and owner reassessment matched finalized state reads. [Proof manifest](docs/PROOF_MANIFEST.md) contains hashes and evidence; [verification](docs/RELEASE_VERIFICATION.md) records checks.

Recorded case offers Retraction and Material correction. Live network reads the new instance. Local rehearsal is scripted and produces no transaction. New-instance proofs use the authorized local operator. The earlier Chrome/Rabby flow and inconclusive MRI attempts remain in [deployments/v1](deployments/v1); those wallet signatures belong to v1.

The owner chooses the primary tag from the form's own list, clears reCAPTCHA and submits manually. StudioNet is hosted simulation; production-chain operation is untested. Recall does not authenticate publishers or institutional authority and cannot reverse completed payments. [Demo](docs/DEMO.md) and [tutorial](docs/TUTORIAL.md) support review.
