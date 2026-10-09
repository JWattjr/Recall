# Security notes — protected release

Registration declares an evidence basis; it does not certify truth or institutional authority. The registering sender owns the decision and alone may reassess it. Purpose stays frozen; recovering a parent never unblocks its children.

## Capacity and access

Each registrant has 12 sources and 24 decisions. Global safety ceilings are 256 sources and 512 decisions, rather than the former shared 12/24 limit. A source stores at most 16 notices over its life, including UNCERTAIN and NO_MATERIAL_CHANGE. There is no global notice quota: uncertainty on one source consumes no other source's budget. At most two UNCERTAIN results are accepted on a source version; the registrant may reset that counter, and a consequential version change resets it automatically. This protects unrelated registrants from one address; it is not Sybil resistance, indefinite availability or reserved global capacity.

Only the registrant and up to eight explicitly authorized reporters may submit notices. Registrant-only authorize_reporter/revoke_reporter/reset_uncertain_counter use canonical source keys. All authorization, quota, lifetime, expected-version and URL-host gates execute before any web/model work. Global IDs remain first-come; address quotas do not prevent ID squatting.

## Provenance boundary

Registration requires a bounded DOI or PMID:<digits> and freezes 1–3 exact lowercase DNS hostnames. An empty JSON host list defaults to eutils.ncbi.nlm.nih.gov, api.crossref.org and www.ebi.ac.uk. Every notice/counter URL must be HTTPS and exactly match one of those hosts; look-alikes, suffixes, trailing-dot aliases and foreign hosts fail before consensus.

Inside each independently rerun nondeterministic assessment, a consequential notice must cite an available notice document containing the registered identifier. DOI comparison ignores case and checks token boundaries. A sentence-ending period followed by whitespace or end of text is accepted; longer `.extra`, `-extra` and `/extra` identifiers remain rejected. NCBI prints `PMID: 28664264`; PMID comparison ignores whitespace after the colon, preserves the exact label and digits and rejects longer PMIDs. This normalization is necessary for authentic NCBI text. Missing identifiers downgrade RETRACTION/MATERIAL_CORRECTION to UNCERTAIN, even if model text says otherwise. Digests bind frozen input and canonical evidence text; validators compare findings and citation sets while rejecting duplicate/invented citations.

**Host allowlists and identifier matches are not cryptographic publisher signatures.** The registrant chooses hosts and may choose an untrustworthy publisher. TLS endpoint syntax and matching identifiers do not authenticate publisher identity, registrant institutional authority, resolved DNS/IP, redirect destinations, publication timestamps or semantic freshness. A malicious allowlisted document can repeat a legitimate identifier. Model judgment remains fallible; text is treated as untrusted data and instructions are ignored, but perfect prompt-injection resistance is not claimed. Failed/non-200/oversized/invalid UTF-8 fetches produce uncertainty, not proof of safety. Bodies are capped at 20,000 bytes.

## Consequences and correction of errors

Retraction/correction advances source version and immediately blocks every reachable decision in one atomic bounded traversal (at most 512 decisions). Each blocker is tracked independently. Every applied correction/retraction opens a 72-hour contest window measured by transaction time. Only the source registrant may contest once with 1–3 authorized-host counter references and matching identifier text. Validators independently answer whether the notice is inapplicable or withdrawn/reversed by the publisher. UPHELD/UNCERTAIN records the contest without restoration.

OVERTURNED preserves the notice and all prior versions, adds a new source version and restores the latest surviving evidence state. Overturning an older notice cannot erase a newer valid notice. A decision returns to its prior status only if it still carries this blocker, has no other blocker and has not been reassessed; changed/inactive upstream decision versions also prevent automatic restoration. Owner reviews and newer dependencies are never overwritten. Unreassessed children can be restored when their sole erroneous blocker is overturned; this is distinct from owner reassessment, which never restores children.

A RETRACTED source is no longer terminal: after the contest window, its only consequential notice route is a publisher retraction reversal assessed with the same host/identifier gates and independent comparison. Unrelated corrections cannot restore it. Source history permits 40 entries, enough for 16 lifetime notices and their one-time contests/reversals; decision history remains eight versions. No authentic reversal is invented: contest/reversal semantics are direct-test coverage only unless a live record explicitly says otherwise.

## Application

The application exposes fixed bounded views, browser wallet writes and receipt polling. No public signing endpoint or private key exists in the bundle. Local operator scripts retrieve the already authorized account from the OS keychain and persist public hashes before polling. Poll timeouts resume the same hash, never resubmit. Receipt finality, execution success and persisted state are separate checks. Preflight checks fixed URLs off-chain and is not validator proof. Known-ID manifests are incomplete indexes. StudioNet is hosted simulation; production-chain operation is untested. V1/v2 proofs remain archived and do not establish protections on older instances.

Validator mismatch diagnostics disclose comparison booleans, bounded finding enums and citation counts. They do not print fetched document text, reference URLs or credentials, and do not relax the equivalence comparison.

Notice fetch diagnostics log the registered/notice request index, availability, HTTP status, response type/size, bounded failure reason or exception type, and a digest of available text. They do not log response text, URL, headers, exception messages or credentials. Fetch acceptance and evidence-digest comparison are unchanged.

Europe PMC canonicalization retains six publication fields including all correction entries and rejects missing/multiple/wrong-PMID records. Structured PMID matching requires the exact pmid or an exact MED correction id; it does not accept bare numbers. Changes to substantive retained fields change the evidence digest. Byte layout, whitespace and excluded volatile metadata do not. One immediate retry on 429/5xx does not permit accepting unavailable evidence.
