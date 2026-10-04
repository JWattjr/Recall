# V2 release verification - 4 October 2026

New instance: `0x91C663Df0D7103614485283D3A1E49Cf525f5fda`, StudioNet 61999. Both notice paths and owner recovery passed, independently checked through finalized state reads. [Proof manifest](PROOF_MANIFEST.md) links the records.

## Contract checks

```powershell
& '..\.venv\Scripts\genvm-lint.exe' check contracts/evidence_retraction_registry.py --json
& '..\.venv\Scripts\genvm-lint.exe' schema contracts/evidence_retraction_registry.py --output deployments/abi-v2.json
& '..\.venv\Scripts\python.exe' -m pytest -q
```

26 contract tests pass. Three GenVM lint checks pass; SDK validation reports 9 methods (5 views, 4 writes). ABI extraction succeeds and matches the deployed ABI. The pinned runner is unchanged. Direct tests mock web/model I/O; actual network evidence is separate.

## Frontend and network checks

```powershell
npm run typecheck
npm test
npm run build
npm run verify:network
node scripts/release-v2.mjs
vercel --prod --yes --scope wattxs-projects
```

Strict TypeScript, all 16 frontend tests and the production build pass. The read-only network check revalidated all 12 new receipts as FINALIZED / SUCCESS, matched deployed source and ABI, matched every final source/decision/notice and history row, and checked both paths and recovery. [Network record](../deployments/recall-v2-network-verification.json).

Recorded retraction captures propagation before recovery. Recorded material correction captures CORRECTED source v2 and both blocked dependents. Live network reads the new instance, including recovered decision-a v2 and decision-b still blocked. Browser records are scoped to the contract address; v1 saved records remain under their previous storage keys.

Production deployment and browser results are recorded in [shipping verification](../deployments/recall-v2-shipping.json).

## Boundaries

StudioNet is hosted simulation. Production-chain operation, publisher authentication and institutional authority are unverified. NO_MATERIAL_CHANGE and unsupported reassessment remain mocked test coverage rather than separate live demonstrations. New-instance writes used the authorized local operator. The earlier Chrome/Rabby flow and UNCERTAIN MRI attempts remain preserved under deployments/v1 and docs/archive-v1; those receipts belong to the old contract.

No Portal form was submitted. The owner chooses the primary tag from the form, clears reCAPTCHA and submits manually.

Production deployment `dpl_DU7GfNqDnjEDPYPsQivUYe4qWQ7Y` reached READY and the public alias loaded. Browser checks confirmed both recorded cases, the new-address MATERIAL_CORRECTION proof, and a timestamped full Live network read showing the recovered parent and blocked dependents. The deployed /api/case returned HTTP 200 with no record errors. Release source commit: `1b7d16c7922fc0dc436993093e839e990d234449`.

All 8 unique nonempty URLs in portal-fields.json returned HTTP 200. Field lengths: one-liner 158/180, description 938/1000, expected outcome 473/500. [HTTP check record](submission/link-check.json).
