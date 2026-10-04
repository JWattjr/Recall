# Recall architecture

One pinned intelligent contract supplies registry truth. Next.js consumes its five views and four writes, without a divergent contract copy. The [README diagram](../README.md#mechanism) shows the full path.

`submit_notice` checks expected source version, source status and capacity. Validators independently fetch current and proposed references under a 5,000-byte strict UTF-8 limit. The strict schema binds exact citations, frozen input, evidence and judgment digests. Extra fields, fabricated citations and disagreement fail validation. Publications are untrusted prompt input.

MATERIAL_CORRECTION advances the source, replaces references and blocks reachable decisions. RETRACTION advances it to RETRACTED and removes usable references. Breadth-first traversal commits atomically within 24 decisions. NO_MATERIAL_CHANGE and UNCERTAIN store a notice without changing authorization state. Fetch failure is uncertainty, not proof of safety or withdrawal.

`reassess_decision` checks ownership, expected version, usable parents and capacity. Purpose stays frozen. SUPPORTED creates an active new version; UNSUPPORTED/UNCERTAIN creates a blocked new version. Children never silently reactivate. Registration only records declared dependencies and does not semantically prove support.

## Discovery and reads

`frontend/src/lib/case.ts` declares the bounded manifest. `/api/case` verifies deployed normalized code hash, performs latest-final views and scans sequential notices until decoded NOT_FOUND. Other errors remain failures. Reads cache 30 seconds; writes force fresh reads. Missing tracked records are reported.

Sources and decisions have no global listing endpoint. Browser registrations and user-entered known IDs extend that browser's manifest within 12/24 bounds. It is not a universal index; visualized reachability may omit records outside it.

`/api/preflight` has a fixed original-study/retraction allowlist, no redirect following, timeout, streaming byte cap and strict UTF-8. It measures availability, not consensus. `/api/transaction/[hash]` validates IDs, caches receipt reads and omits simulator configuration/credentials/state dumps.

## Writes and finality

Only EIP-1193 wallet signing is exposed. Chain 61999 is checked, added/switched when needed, then checked again. Account/network events clear the signer. No public privileged signing route exists.

Before signing, current versions, owner, usable dependencies and capacity are checked. Upstream version/status changes require refreshed review. A write lock and pending-transaction guard prevent accidental repeats. Returned IDs persist immediately and resume on reload. Polls use 20-second intervals, at most 40 automatic checks; stalled checks resume the same ID without a promised confirmation time.

ACCEPTED is provisional. FINALIZED plus successful execution/result return means execution success; rollback/error are separate. UNDETERMINED can progress further on this StudioNet deployment and continues bounded polling. Contract state is read after successful finality. Receipt success and a matching state transition remain separate evidence: correction receipts did not establish persisted correction and are documented accordingly.

The offline historical snapshot, live reads, dated owner-recovery proof and scripted rehearsal have distinct labels. Proof exposes findings, citations, digests, current versions, history and copyable transaction IDs. No unverified explorer route is invented.
