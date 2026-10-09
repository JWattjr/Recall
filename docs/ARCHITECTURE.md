# Recall architecture — protected release

The Next.js app signs through the connected EIP-1193 wallet, submits to one pinned GenLayer contract, polls the returned hash and reads LATEST_FINAL records. The server owns bounded convenience reads and preflight; the contract owns roles, quotas, graph consequences and contests; publishers own external documents. No server can authoritatively summarize or sign a notice.

## Deterministic gates

register_source now takes `(source_id, source_url, publisher_label, source_identifier, notice_hosts)`; notice_hosts is JSON text, with `[]` selecting NCBI/Crossref/Europe PMC defaults. Per-address TreeMap counters enforce 12 sources and 24 decisions; global collections cap at 256/512. Source records include immutable identifier/hosts, reporters, lifetime notice IDs and version-local uncertainty count. authorize_reporter/revoke_reporter/reset_uncertain_counter are registrant-only. submit_notice checks reporter, base version, 16-per-source lifetime and two-UNCERTAIN gate, then exact HTTPS host, before invoking consensus. Notice storage has no shared quota.

## Independent judgment

Notice leader and every validator independently fetch source/notice text, build evidence digests, classify the relationship and enforce identifier presence in cited notice text. DOI case and PMID label spacing normalize only; boundaries reject different identifiers. Missing identifier changes consequential judgments to UNCERTAIN. Strict schemas reject extra fields, bad versions/digests and invented/duplicate citations; comparisons use sorted citation sets. Model output alone cannot bypass these gates.

## Graph and recovery

Earlier-active decision dependencies prevent cycles. Atomic breadth-first traversal visits at most 512 decisions, records each notice blocker and preserves the pre-block decision status/version. Correction replaces current references; retraction removes them. Owner reassessment freezes purpose, uses current usable sources/earlier parents, changes dependency edges and increments that decision version. It supersedes the decision's old blockers but does not touch children.

contest_notice snapshots notice/source/counter references immutably, applies registrant/once/72-hour/host gates and independently assesses UPHELD/OVERTURNED/UNCERTAIN. An overturn creates a new source version using the latest surviving consequential state and removes only that notice's blockers. Restoration is conditional on no other blockers, no later reassessment and unchanged active upstream decision versions. Histories retain outcomes/restorations; notice.status becomes OVERTURNED. After the window, a retracted source routes submit_notice exclusively through publisher-reversal assessment. Reversal does not accept ordinary correction findings.

## Frontend reads and writes

The app provides identifier/host source inputs, reporter controls, uncertainty reset, editable notice URL and contest form with a live countdown. Only registrants can use management controls; only eligible registrants can contest. Server ABI checks verify normalized deployed source SHA-256. `/api/case` reads explicit known source/decision IDs (browser bound 48/96) and each source's at-most-16 notice IDs, rather than assuming a global 16-notice cap. Histories include contests and reassessments.

The transaction route extracts the actual returned notice ID from the finalized receipt. This avoids guessing a global sequence when another source writes a notice. Partial readback retains unrelated records, checks the matching contest/reporter/counter transition and reloads affected decisions. Chain/account checks, an in-flight lock, persisted hashes and bounded resumable polling remain in place. ACCEPTED is provisional; FINALIZED may contain an expected rollback or validator majority disagreement. A leader SUCCESS with rejected consensus is an error, and only matching persisted state proves a transition. Recorded cases, Live network and scripted Local rehearsal have distinct labels.

See SECURITY_NOTES.md for the host/identifier authentication boundary and PROOF_MANIFEST.md for live receipts. V1/v2 snapshots and proofs remain archived; no live publisher reversal is claimed.

Europe PMC core responses are bounded to 20,000 bytes and bound to exactly one MED record with the PMID requested in the URL. Evidence uses only pmid, doi, title, pubTypeList, abstractText and commentCorrectionList; strings collapse whitespace, object keys and list entries sort canonically. Transport metadata and citation counts are excluded. The same canonical text feeds digests, model input and identifier matching. Other hosts retain raw text. HTTP 429/5xx retries once immediately; continued failure remains unavailable. Strict snapshot/source/version/evidence/finding/citation comparison is unchanged. Before each positive live notice the release runner invokes the exact pure contract helpers off-chain and requires identical canonical digests and identifiers over three fetches of both original and notice URLs. Deliberately unauthorized look-alike-host URLs are never fetched.
