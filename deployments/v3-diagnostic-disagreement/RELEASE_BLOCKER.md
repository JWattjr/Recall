# Recall v3 release stopped - diagnostic validator disagreement

Production remains v2. The protected release has not been pushed to GitHub or deployed to Vercel. Do not resubmit current draft fields or snapshots.

Contract: `0x62112aA722Ad6B7e30996549fa07B7bdcDCA4554`
Normalized source SHA-256: `cab4d434855d2afd4a92492788b203637d6dc1f48c55e1a7a7b43503fced483b`
Failed retraction transaction: `0x9b69763c59d1f1f65d963c86e2b63de3dc42b74e219d0a7d70b3b19fe3a81c9d`

FINALIZED / leader SUCCESS / MAJORITY_DISAGREE. The leader proposed RETRACTION with identifier_match=true; consensus rejected it. No subsequent live write was sent and the failed hash was not resubmitted.

## Exact leader output

The following is the SDK's exact result.payload.readable string, not valid JSON. Raw output is preserved in the archived receipt.

```text
{"affected_decisions":["decision-a","decision-b",]"applied_state":{"references":[]"status":"RETRACTED"}"authorized_hosts":["eutils.ncbi.nlm.nih.gov",]"base_version":1"citations":["https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29940049&rettype=abstract&retmode=text",]"contest_until":1791800816"evidence_digest":"sha256:467f41004847635e5d27df45465ab3c14faaef108e0afd16a30b4a4263d28dae""finding":"RETRACTION""identifier_match":true"input_snapshot_digest":"sha256:fa121bbf76acd70be7e6bcfbdaa85a47e721709c340476422f1a862dc0dbf394""notice_id":"N-000001""pre_notice_state":{"references":["https://api.crossref.org/v1/works?filter=doi:10.11607/prd.476&rows=1&select=DOI,title,publisher,issued,type",]"status":"ACTIVE""version":1}"references":["https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29940049&rettype=abstract&retmode=text",]"snapshot_digest":"sha256:917422862510316fa5e1a4ef7f9c9e387235ca8241bdca57dd6d05f1706d01ef""source_id":"report-a""source_identifier":"10.11607/prd.476""status":"APPLIED""submitted_by":"0xdb433ff614bdd1ece21aa97221c3e0a7ecf79c92"}
```

## Validator diagnostics

Both disagreeing validators emitted:

```text
[NOTICE_VALIDATION_MISMATCH] {"citations_match":false,"evidence_digest_matches":false,"input_snapshot_matches":true,"judgment_digest_matches":false,"leader_citation_count":1,"leader_finding":"RETRACTION","source_matches":true,"validator_citation_count":0,"validator_finding":"UNCERTAIN","version_matches":true}
```

Source/version/input binding match, while independently fetched evidence digests differ. Both validators returned UNCERTAIN with zero citations and made no model call (their execution_stats lacks the leader's llm entry). This points to unavailable evidence before classification. Which request failed, its status and the exact cause are not yet established. No comparison rule has been weakened. The other two validators were idle.

## Current-instance hashes

| Operation | Hash | Result |
| --- | --- | --- |
| deploy | `0x84c1d6eea4c73c346fd42bafd67e7ca8dbe33f560447dcb8f54bd8bcd30aa863` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| register_source:report-a | `0xe88edde06629620a464ec46a1d62c62a29e6b26c522ccdc4f33feace459830f8` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| register_source:report-unrelated | `0x0a9857ff29309cbca9f07afaee0a76a07066793b64c4768e435711411f723fb3` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| register_decision:decision-a | `0xc2328ab138eb9fffa9639d8e82b6e70f9346d3865f26488bfb8cb0ee6a6593e8` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| register_decision:decision-b | `0x45339efd189f025ce3a1714602cbebecfbdc4cd33228a0d8d64dab441489c7b8` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| register_decision:decision-c | `0xa9fc8049eb19d15aa4752989eee16c607a0f07ecff421997b5012ac86edb18ad` | FINALIZED / SUCCESS / MAJORITY_AGREE |
| reject_host | `0xd154eea2b5ca9df593f35d235963e5951ecb431a9f9a874a785e612f338e179e` | FINALIZED / ERROR / MAJORITY_AGREE |
| reject_caller | `0xad5b45f8f7cf889f8a1993dacd4ab6dafb4138b03826d77e3b00e7d12370a4c5` | FINALIZED / ERROR / MAJORITY_AGREE |
| submit_notice:report-a | `0x9b69763c59d1f1f65d963c86e2b63de3dc42b74e219d0a7d70b3b19fe3a81c9d` | FINALIZED / SUCCESS / MAJORITY_DISAGREE |

## Checks and remaining work

59 direct contract cases, 21 frontend tests, strict TypeScript and three GenVM lint checks pass. ABI extraction succeeds: 13 methods, 5 views, 8 writes. Direct tests mock external I/O and do not establish live consensus. Registrations and expected host/caller rollback checks succeeded. Read-only LATEST_FINAL checks confirm the source ACTIVE v1 with no notices and both decisions ACTIVE v1 with authorization enabled. This check is saved separately in deployments/v3-diagnostic-disagreement/unchanged-state.json.

Retraction, correction and owner recovery on this diagnostic instance remain unproven. Final proof snapshots, network verification, Vercel production/browser checks, GitHub push, URL checks and resubmission package remain pending. Contest/reversal is direct-test-only. No Portal Resubmit action was taken.

## Archives

This run is preserved in deployments/v3-diagnostic-disagreement. Prior preliminary, PMID, DOI and retraction-disagreement attempts remain unchanged. v1 and v2 archives remain intact.

## Prepared next diagnostic attempt

Local fetch instrumentation now records registered/notice index, availability, HTTP status, body type/length, safe failure reason and available-text digest. No document text, URL, headers or exception message is emitted. Fetch acceptance and independent evidence comparison remain unchanged. All 62 direct cases and three lint checks pass; the three new cases cover HTTP 429, oversized body and empty text with rejected retraction. This local source has not been deployed and is not a proven network fix. The stopped diagnostic deployment above was built with the earlier 59-case suite. A new live attempt requires owner direction under the explicit stop-on-failure instruction.
