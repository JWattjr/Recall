# Shipping verification — 4 October 2026

New records contain source/ABI alignment, historical receipt revalidation, fresh owner recovery, correction attempts and off-chain evidence availability. [Proof manifest](PROOF_MANIFEST.md) links them. The historical release stays unchanged.

## Executed commands

Project root, using the existing parent-directory virtual environment:

```powershell
& '..\.venv\Scripts\python.exe' -m pytest -q -p no:cacheprovider --basetemp=.pytest-tmp
& '..\.venv\Scripts\genvm-lint.exe' check contracts/evidence_retraction_registry.py --json
& '..\.venv\Scripts\genvm-lint.exe' schema contracts/evidence_retraction_registry.py --output deployments/abi-check-2026-10-04.json
```

22 parameter-expanded direct tests pass; 3 lint checks pass; SDK validation reports 9 methods, 5 views / 4 writes; ABI extraction succeeds. The newer available runner was not adopted.

Frontend:

```powershell
npm run typecheck
npm test
npm run build
npm audit --omit=dev
npm run verify:network
node scripts/live-release.mjs
node scripts/live-release.mjs --correction
npx tsx scripts/wallet-write-check.ts
vercel --prod --yes --scope wattxs-projects
```

Strict TypeScript and production build pass. 13 frontend tests pass. Production dependency audit reports zero vulnerabilities. Retraction/recovery network calls succeeded and were read back. Correction operations finalized, but the first script's missing-notice read failed; the retry explicitly records that material correction was not proven.

Browser checks cover recorded exploration, direct/transitive selection, unrelated branch, mobile list, local withdrawal/recovery, missing-wallet error, notice preflight, proof/history and current live manifest. Final deployed checks, exact commands and commit are saved in `deployments/recall-shipping-2026-10-04.json`.

## Boundaries

- Interactive extension-wallet signing was unavailable. The actual app helper was checked with a local credential-backed EIP-1193 provider and a real finalized transaction. Mocked switch/add/reject/account-change tests are separate evidence.
- Live material correction is not proven: two authentic NCBI attempts returned UNCERTAIN leader results and N-000003 was absent in finalized reads. Source and MRI decisions remain active v1. Receipt success does not prove propagation or persistence.
- NO_MATERIAL_CHANGE, unsupported reassessment and capacity failures are direct-test coverage, not separate live demonstrations.
- StudioNet is hosted simulation. Production chain, publisher authenticity and institutional authority are unverified; no guaranteed confirmation time exists.
- Authenticated Portal eligibility needs owner review. Nothing was submitted and no award is promised.
