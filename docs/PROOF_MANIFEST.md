# Proof manifest - v2, 4 October 2026

Contract `0x91C663Df0D7103614485283D3A1E49Cf525f5fda` on StudioNet 61999, a hosted development simulator. Normalized LF / trimmed-end source SHA-256: `218f011d2e26bc6d35033f9781b406e39ab8598af0f91fa118c85b5a930c5804`. Runner stays pinned to `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.

[Release receipts and finalized reads](../deployments/recall-v2-release.json) | [Read-only revalidation](../deployments/recall-v2-network-verification.json).

## Transactions

| Operation | Hash | Result |
|---|---|---|
| deploy | `0x745ef64260fd2dcde7d95c10c6e46b6d36856621a54f9e1f839dbeb897fcd5f6` | FINALIZED / SUCCESS |
| register_source:report-a | `0x3822f460be7a25a1524d2e22aade51f0c9658b5dffc576c6686ed4a1841a45f1` | FINALIZED / SUCCESS |
| register_source:report-unrelated | `0x976bea58b7d4d2f509a80ae375c41a7e5cb927c9b0f2590be8042e77f4ac5d5a` | FINALIZED / SUCCESS |
| register_decision:decision-a | `0xa2b3959c92631d264df92224c9130db5edc2d4b072a08da2025ec60c4d3d00fb` | FINALIZED / SUCCESS |
| register_decision:decision-b | `0x46b936baee552b2f37da53bf04247f09659fc0e03e887f135e554054cd606894` | FINALIZED / SUCCESS |
| register_decision:decision-c | `0x4d41b6001478fe196a5495cc4cb4eca54d7c09b7142e1bc535c1332c009f2425` | FINALIZED / SUCCESS |
| submit_notice:report-a | `0x45b2cf330bf9d9b25ed161ee9fa7a30bf401126a34de817c9949e29d3477abd4` | FINALIZED / SUCCESS |
| reassess_decision:decision-a | `0x28a7d05c198264b254347625e0e36208b8292447cb1104b16dfa8dfba4ff3e3a` | FINALIZED / SUCCESS |
| register_source:correction-study | `0x5697b7a752c498d73598216a5104f8c6d5063c3453fcb83e7ec1bc553936b84a` | FINALIZED / SUCCESS |
| register_decision:correction-parent | `0x88aa221a00229c88fea5fba0a6a5dc6ffea7b9ca5c518aa83e593e7efd19f063` | FINALIZED / SUCCESS |
| register_decision:correction-child | `0xcb3f712d0f0a470a41652ac75c594cf737cb181917ec17a1ab64c030e1c4546d` | FINALIZED / SUCCESS |
| submit_notice:correction-study | `0x59fd7d86db99f5410c0df682d9167213e6fe34d64d54fa344f2add62b09d014f` | FINALIZED / SUCCESS |

Every hash was saved before polling. A timeout resumes the same hash without resubmission. All registration readbacks matched ACTIVE v1. State reads use LATEST_FINAL.

## Retraction and owner recovery

Original: [Crossref DOI 10.11607/prd.476](https://api.crossref.org/v1/works?filter=doi:10.11607/prd.476&rows=1&select=DOI,title,publisher,issued,type). Notice: [PubMed PMID 29940049](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29940049&rettype=abstract&retmode=text). N-000001 returned RETRACTION, report-a became RETRACTED v2, and decision-a and decision-b were blocked. Independent decision-c stayed ACTIVE v1.

Owner `0xdB433ff614bDD1ecE21Aa97221C3E0a7ecf79c92` reassessed decision-a against report-unrelated, [COPE PMID 20017220](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=20017220&rettype=abstract&retmode=text). Its frozen purpose concerns COPE retraction governance. SUPPORTED restored decision-a to ACTIVE v2; decision-b remained BLOCKED_REASSESSMENT v1. Recovery does not validate the withdrawn clinical finding.

## Real material erratum

Original PMID **28664264**, DOI `10.1007/s12687-017-0310-z`: [https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=28664264&rettype=abstract&retmode=text](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=28664264&rettype=abstract&retmode=text). HTTP 200, **3559 bytes**.

Erratum PMID **29294252**, DOI `10.1007/s12687-017-0353-1`: [https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29294252&rettype=abstract&retmode=text](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29294252&rettype=abstract&retmode=text). HTTP 200, **1597 bytes**. The title identifies the original article; its Erratum-for block gives the original DOI.

Exact material sentence (NCBI line wrapping joined with spaces; words and punctuation unchanged):

> The percentages for 'any positive lifestyle change' and 'improved dietary practices' have unintentionally been incorrectly reported.

N-000002 returned MATERIAL_CORRECTION. correction-study became CORRECTED v2 with the erratum reference. correction-parent and correction-child became BLOCKED_REASSESSMENT v1. Independent decision-c stayed ACTIVE. Exact source/version bindings, citations and all digests remain in the release record. Both publication bodies were strict UTF-8 and below 5,000 bytes before use.

## V1 archive and boundaries

[Old proof files](../deployments/v1) and [old documents](archive-v1) remain preserved. Eleven original JSON proofs were checked unchanged against the prior Git revision. Old contract: `0x432960e720542c0EAB68f76a4274fBf972A19a31`. Its MRI attempts remain UNCERTAIN; this instance uses an explicit numerical erratum and the requested materiality definition. V1 Chrome/Rabby signatures belong to v1. New-instance writes used the authorized local operator; credentials stayed in the OS keychain/process memory.

The grants are synthetic fixtures. Publisher identity and institutional authority are not authenticated. Receipt success and state propagation were checked separately; production-chain operation is untested.
