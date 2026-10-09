# V3 release verification - 9 October 2026

Contract `0x790b3faD72076e1A5A3eA3C1FE84FfA09435aB05`, StudioNet 61999. The full Europe PMC live proof and independent network verification pass. Production publication/browser checks are pending. Earlier completed v2 verification is preserved in docs/archive-v2/RELEASE_VERIFICATION.md.

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

Production deployment, public browser/API checks, GitHub push and URL checks remain pending. Field lengths are 158/180, 951/1000, 498/500 and steward response 874/900.

## Scope

Hosted StudioNet simulation only; grants/authorizations are synthetic. Reporter controls, quota isolation, uncertainty reset, contest outcomes and publisher reversal are direct-tested. No authentic publisher counter-notice was supplied, so no live overturn/reversal is claimed. Host/identifier checks are not cryptographic publisher signatures. The owner requested no demo video. Existing Portal contribution bd6c877a… remains untouched; Resubmit is a manual owner action.
