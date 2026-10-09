# V3 release verification - 9 October 2026

Contract `0x790b3faD72076e1A5A3eA3C1FE84FfA09435aB05`, StudioNet 61999. The full Europe PMC live proof and independent network verification pass. Production deployment, public browser/API verification, both main-branch pushes and all Portal URL checks pass. Earlier completed v2 verification is preserved in docs/archive-v2/RELEASE_VERIFICATION.md.

## Local validation

70 contract direct cases pass in 11.89 seconds; 21 frontend tests pass. GenVM lint passes all three checks; SDK validation/schema report 13 methods (5 views, 8 writes), matching the extracted ABI. Runner remains pinned to py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6. Strict TypeScript and the final Next.js 16.3.8 production build pass. Direct cases mock web/model I/O and selected cases independently rerun captured validators; they do not establish network consensus.

Commands from repository root use the existing parent environment:

```powershell
& '..\.venv\Scripts\genvm-lint.exe' check contracts/evidence_retraction_registry.py --json
& '..\.venv\Scripts\genvm-lint.exe' schema contracts/evidence_retraction_registry.py --output contracts/abi.json
& '..\.venv\Scripts\python.exe' -m pytest -q -o addopts='-p no:cacheprovider'
```

Frontend commands:

```powershell
cd frontend
npm test
npm run typecheck
npm run build
npm run verify:network
node scripts/prepare-v3.mjs
vercel project inspect --non-interactive --scope wattxs-projects
vercel --prod --yes --scope wattxs-projects
```

## Evidence repair and proof boundary

The owner reproduced concurrent NCBI HTTP 429 responses; independent StudioNet validators had returned UNCERTAIN without model calls. Failed receipts and unchanged-state checks are preserved in deployments/v3-retraction-disagreement and deployments/v3-diagnostic-disagreement. They are rejected proposals, not committed retractions.

Europe PMC core JSON is now normalized into six retained fields (pmid, doi, title, pubTypeList, abstractText, commentCorrectionList), with sorted keys/lists and collapsed whitespace. The exact canonical text feeds evidence digest, model input and identifier gate. HTTP 429/5xx retries once; bodies are bounded to 20,000 bytes. Wrong/multiple PMID records remain unavailable. Input/source/version/evidence/finding/citation comparisons remain strict. Every actual notice is preceded by identical canonical digests and identifier matches over three off-chain fetches of original and notice URLs. Deliberate look-alike host URLs are rejected without retrieval.

The proof generator produced both dated recorded cases, owner recovery and current contract links from finalized reads, and catalogued 54 distinct current/archived hashes. `npm run verify:network` independently passed all 28 checks: source bytes/SHA, ABI, all 14 FINALIZED majority-agreed receipts, every final source/decision/notice, history and both propagation/recovery outcomes. Twelve writes (including deployment) succeeded; two deliberate host/caller transactions finalized expected rollback. No failed or timed-out hash was resubmitted. [Network verification](../deployments/recall-v3-network-verification.json).

Vercel production deployment `dpl_6XqnyL2i6tRwe9oim5w6QEWAGzhe` reached READY and is aliased to https://recall-genlayer.vercel.app. Release app source commit: `1d7669c7ef5b7324059b33f8e4cf88b5287ee685`. Both origin (JWattjr/Recall) and registry (JWattjr/evidence-retraction-registry) main branches received this commit without force. The final verification and handoff commit changes release records, documentation and the smoke-check assertion; app and contract bytes remain identical to this deployed commit.

The public /api/case returned HTTP 200 and exactly matched all 3 sources, 5 decisions and 2 notices, with zero record errors. The availability panel returned 200/ready for both Europe PMC documents. All 8 exact nonempty Portal URLs returned HTTP 200. Browser verification confirmed both recorded cases, the fresh timestamped Live network read, new registry address, ACTIVE v2 parent and blocked child/correction dependents, identifier/host inputs, reporter/reset controls and a running 72-hour contest countdown. Signing is disabled without a wallet. Console has zero errors/warnings. [Shipping record](../deployments/recall-v3-shipping.json) | [Live screenshot](../deployments/recall-v3-browser-live.png).

A Windows generated-cache permission error affected the local date-label rebuild; rerunning that build outside the filesystem restriction passed. A smoke-check initially expected the contract address in initial HTML, although the UI renders it in Proof & history. The corrected initial-content check passes; exact API contract/state comparisons were retained. The precheck result is preserved in deployments/recall-v3-shipping-precheck.json. No contract or consensus rule changed. Field lengths are 158/180, 951/1000, 498/500 and steward response 874/900.

## Scope

Hosted StudioNet simulation only; grants/authorizations are synthetic. Reporter controls, quota isolation, uncertainty reset, contest outcomes and publisher reversal are direct-tested. No authentic publisher counter-notice was supplied, so no live overturn/reversal is claimed. Host/identifier checks are not cryptographic publisher signatures. The owner requested no demo video. Existing Portal contribution bd6c877a… remains untouched; Resubmit is a manual owner action.
