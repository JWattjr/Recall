# Building evidence-dependent authorizations

Recall makes evidence a continuing condition of future action. Its research grant fixtures demonstrate registry behavior, not real institutional authority or scientific truth.

## Record explicit support

`register_source(source_id, original_ref, publisher_label, source_identifier, notice_hosts_json)` creates a source. `register_decision(decision_id, purpose, source_ids_json, decision_ids_json)` freezes purpose, records dependencies and assigns sender ownership. Parent decisions must already exist and be active, preventing cycles. Registration records declared support; it does not judge that support semantically.

This working read example uses the pinned SDK and needs no wallet. Run from `frontend` after `npm ci`:

```javascript
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';
const client = createClient({ chain: studionet });
console.log(await client.readContract({
  address: '0x790b3faD72076e1A5A3eA3C1FE84FfA09435aB05',
  functionName: 'get_decision', args: ['decision-a'], jsonSafeReturn: true,
  transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
}));
```

Save as `read-example.mjs`, then `node read-example.mjs`. Wallet signing uses `src/lib/network.ts` with explicit chain/account checks. Never put private keys into a page or public route.

## Judge independently

`submit_notice` supplies source, expected base version and up to three notice references. Validators independently fetch current/new publications under the 20,000-byte strict UTF-8 bound. The notice prompt explicitly distinguishes changed results/numbers/doses/conclusions from presentation-only fixes. It constrains four findings; validators compare sorted, deduplicated citation sets and bind frozen input, evidence and judgment digests. Source text is untrusted input.

The release preflight uses the exact pure contract canonicalizer and identifier check on three fetches of every original/notice URL and requires stable digests before notice writes. It never supplies a server summary as validator evidence. The real examples use Europe PMC REST core records; validators fetch them independently. The browser availability panel is a separate convenience check and cannot guarantee validator retrieval. This new instance separately proved the real retraction and PMID 29294252 material correction with finalized state reads. V1 MRI attempts remain archived.

## Apply deterministic consequences

Correction/retraction versions evidence and atomically blocks every reachable decision within the global 512-decision safety ceiling. NO_MATERIAL_CHANGE/UNCERTAIN leave authorizations unchanged. A bounded traversal avoids an unbounded contract crawl.

The frontend computes reachability only from loaded records and names its bounded manifest. Without listing views, applications must retain known IDs or build an actual index, rather than imply global discovery.

## Recover explicitly

Only the owner may `reassess_decision` with expected version and current usable evidence/earlier active parents. SUPPORTED creates an active new version; UNSUPPORTED/UNCERTAIN creates a blocked new version. Purpose stays frozen. Children never recover automatically.

The live parent's purpose concerned COPE retraction governance, so current COPE guidance supported it. Recovery did not claim a withdrawn clinical finding was true. New dependencies, citations, digests and parent versions explain the exact authorization.

## Check receipt and state separately

Persist the returned ID before polling. ACCEPTED is provisional; finalized rollback is failure. This StudioNet deployment can pass through UNDETERMINED before finalization, so checks are bounded and resumable. After successful finality, read and compare intended state. Both proven consequential notices finalized with majority agreement; finalized reads confirmed source v2 and blocked dependents. The network check rechecks all successful and expected-rejected receipts and both final cases.

Run `npm test` for graph/finality/wallet handling and project-root `python -m pytest` for contract invariants. Direct tests mock external evidence/model output; [live records](PROOF_MANIFEST.md) are separate proof. No library was extracted because current helpers are tied to this ABI and case boundary; the tutorial and read example are reusable without delaying the release.

## Reporter and provenance setup

For the authentic correction fixture use DOI `10.1007/s12687-017-0310-z` and `[]` for notice hosts: NCBI/Crossref/Europe PMC defaults. For a custom publisher supply JSON of 1–3 exact lowercase hostnames. Hosts/identifier are frozen. Only the registrant or a source-authorized reporter may submit. The registrant may authorize/revoke up to eight reporters and reset a two-result uncertainty counter; reset cannot clear the 16-notice lifetime quota. Rejected callers/hosts/limits invoke no web/model work.

## Contest an erroneous notice

In Live network, open Submit notice, then Contest notice. Select an applied notice, inspect its countdown and connect the source registrant wallet. Supply 1–3 unique authorized-host counter URLs. Counter text must identify the exact source and establish that the notice is inapplicable or publisher-withdrawn/reversed. Submit once and retain the hash. UPHELD/UNCERTAIN preserves blocks; OVERTURNED adds a version and conditionally restores sole-blocked, unreassessed decisions. Other notices, later owner review and changed upstream decision versions remain effective. After 72 hours only a publisher retraction reversal through Submit notice can recover a retracted source. Never invent counter-evidence; these paths are tested with mocks, not claimed as live publisher reversals. Host/identifier checks are not publisher signatures.

The initial fixture registered `PMID:28664264` as requested. The earlier NCBI erratum text contains the original DOI but omits that PMID; the leader returned UNCERTAIN and validator consensus rejected the transaction. Its saved hash was not resubmitted. With owner authorization the same original study was registered as `correction-study-doi` using its DOI, which is present in the authentic notice. See PROOF_MANIFEST.md for both outcomes.

## Stable publication evidence

The Europe PMC URL format is `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:<PMID>%20AND%20SRC:MED&resultType=core&format=json`. Register originals with their own Europe PMC record: PMID 29641633 for DOI 10.11607/prd.476; PMID 28664264 for DOI 10.1007/s12687-017-0310-z. Notices are PMIDs 29940049 and 29294252 respectively. The contract requires exactly one matching MED PMID result and retains pmid, doi, title, pubTypeList, abstractText and commentCorrectionList. Whitespace and key/list order normalize before evidence digest, prompt and identifier matching. Substantive changes still reject independent agreement. Bodies over 20,000 bytes remain unavailable. HTTP 429/5xx receives one immediate retry.
