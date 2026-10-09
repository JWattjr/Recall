# Building evidence-dependent authorizations

Recall makes evidence a continuing condition of future action. Its research grant fixtures demonstrate registry behavior, not real institutional authority or scientific truth.

## Record explicit support

`register_source(source_id, original_ref, publisher_label)` creates a source. `register_decision(decision_id, purpose, source_ids_json, decision_ids_json)` freezes purpose, records dependencies and assigns sender ownership. Parent decisions must already exist and be active, preventing cycles. Registration records declared support; it does not judge that support semantically.

This working read example uses the pinned SDK and needs no wallet. Run from `frontend` after `npm ci`:

```javascript
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
const client = createClient({ chain: studionet });
console.log(await client.readContract({
  address: '0x91C663Df0D7103614485283D3A1E49Cf525f5fda',
  functionName: 'get_decision', args: ['decision-a'], jsonSafeReturn: true,
  transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
}));
```

Save as `read-example.mjs`, then `node read-example.mjs`. Wallet signing uses `src/lib/network.ts` with explicit chain/account checks. Never put private keys into a page or public route.

## Judge independently

`submit_notice` supplies source, expected base version and up to three notice references. Validators independently fetch current/new publications under the 5,000-byte strict UTF-8 bound. The notice prompt explicitly distinguishes changed results/numbers/doses/conclusions from presentation-only fixes. It constrains four findings; validators compare sorted, deduplicated citation sets and bind frozen input, evidence and judgment digests. Source text is untrusted input.

Preflight measures availability only. It never supplies a server summary as validator evidence. The real retraction example uses small Crossref and NCBI text records. A browser fetch cannot guarantee validator retrieval. This new instance separately proved the real retraction and PMID 29294252 material correction with finalized state reads. V1 MRI attempts remain archived.

## Apply deterministic consequences

Correction/retraction versions evidence and atomically blocks every reachable decision within a 24-record graph. NO_MATERIAL_CHANGE/UNCERTAIN leave authorizations unchanged. A bounded traversal avoids an unbounded contract crawl.

The frontend computes reachability only from loaded records and names its bounded manifest. Without listing views, applications must retain known IDs or build an actual index, rather than imply global discovery.

## Recover explicitly

Only the owner may `reassess_decision` with expected version and current usable evidence/earlier active parents. SUPPORTED creates an active new version; UNSUPPORTED/UNCERTAIN creates a blocked new version. Purpose stays frozen. Children never recover automatically.

The live parent's purpose concerned COPE retraction governance, so current COPE guidance supported it. Recovery did not claim a withdrawn clinical finding was true. New dependencies, citations, digests and parent versions explain the exact authorization.

## Check receipt and state separately

Persist the returned ID before polling. ACCEPTED is provisional; finalized rollback is failure. This StudioNet deployment can pass through UNDETERMINED before finalization, so checks are bounded and resumable. After successful finality, read and compare intended state. Both new notices finalized successfully; finalized reads confirmed source v2 and blocked dependents. The network check rechecks all 12 receipts and both final cases.

Run `npm test` for graph/finality/wallet handling and project-root `python -m pytest` for contract invariants. Direct tests mock external evidence/model output; [live records](PROOF_MANIFEST.md) are separate proof. No library was extracted because current helpers are tied to this ABI and case boundary; the tutorial and read example are reusable without delaying the release.
