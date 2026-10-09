# Protected v3 proof manifest - 9 October 2026

Contract `0x790b3faD72076e1A5A3eA3C1FE84FfA09435aB05` on StudioNet 61999, hosted development simulation. Normalized LF/trimmed-end source SHA-256: `fd2d74310d6b59fe58b0a05c8139b143c54436e7dbe98772636855d38590676c`.

Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.

[Release receipts and finalized reads](../deployments/recall-v3-release.json) | [Independent network verification](../deployments/recall-v3-network-verification.json).

## Current release

All 14 transactions are FINALIZED with MAJORITY_AGREE: 12 successful writes including deployment and two deliberate ERROR/rollback rejections. Registrations and consequences matched LATEST_FINAL state reads.

| Operation | Hash | Execution |
| --- | --- | --- |
| deploy | `0x5a72d4db3d800c1ec16fecf562e0b1be72c3b5b74373262391082b4ac20abc4f` | SUCCESS |
| register_source:report-a | `0x14ce1d2a176d176bf7cfe70a2533fc90f528b6f29f04537bad8467f66f3aac9f` | SUCCESS |
| register_source:report-unrelated | `0x5f15a32b7de7e5561824ce68a246f599a72e0dd9c5f49ef2f84a4299b8363b30` | SUCCESS |
| register_decision:decision-a | `0x24ecdc5247161e2e26554be997ef3416806c3164c24db3c466106cb570c621cb` | SUCCESS |
| register_decision:decision-b | `0x0d87d0350d367d46a44243662c63374d116300cd7fbf746a6adde38b43c2380c` | SUCCESS |
| register_decision:decision-c | `0x710b6a4d88d483176996f90da36758a09d54ffdc05a3a84c59a855a1076f6e1b` | SUCCESS |
| reject_host | `0xa30f80d2c4762f6e516360cfd334cdbcedd1f189dffa1373666edc531bf00e3b` | ERROR (expected rollback) |
| reject_caller | `0x30befba27a70ff5e5e712eb22d86a62566b5c29ebe8be346bf7d0a2cc0bbd09f` | ERROR (expected rollback) |
| submit_notice:report-a | `0xd1bf89c7f34a0e4585cea46d0ab7578ed1d74109d294a257940c5b979a558caf` | SUCCESS |
| reassess_decision:decision-a | `0x8d2bbca3096b2f76cf09c8a5651d53b1db9b77c6191916079c8dc35400d17648` | SUCCESS |
| register_source:correction-study-doi | `0xdeb4b48847a38d069a79c730d831cd7d199d2a40ce03506a60ecf70b78664a02` | SUCCESS |
| register_decision:correction-parent-doi | `0x8db2ea49df34d126c059ded1103225d03df430ac675d6977d9065a63051fcd2c` | SUCCESS |
| register_decision:correction-child-doi | `0x5bbe4eb89455f50ebcb74109432e79dab7f917cec62ed985a4d0592ea1d12194` | SUCCESS |
| submit_notice:correction-study-doi | `0xe3b1a9410728e859e8c1844727f2a178bfdcf68bd62bceee6ff2d01420757313` | SUCCESS |

## Authentic notices and owner recovery

Retraction: [Europe PMC original PMID 29641633](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:29641633%20AND%20SRC:MED&resultType=core&format=json) and [Europe PMC retraction PMID 29940049](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:29940049%20AND%20SRC:MED&resultType=core&format=json). N-000001 returned RETRACTION, identifier_match=true and authorized Europe PMC host. report-a became RETRACTED v2; decision-a and decision-b blocked at v1; independent decision-c stayed active. The consequential notice opened a 72-hour contest window.

Correction: [original PMID 28664264](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:28664264%20AND%20SRC:MED&resultType=core&format=json) was registered under its DOI `10.1007/s12687-017-0310-z`, with default NCBI/Crossref/Europe PMC hosts. [Real erratum PMID 29294252](https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:29294252%20AND%20SRC:MED&resultType=core&format=json) explicitly corrects reported lifestyle-change and dietary-practice percentages. N-000002 returned MATERIAL_CORRECTION, identifier_match=true and authorized Europe PMC host. correction-study-doi became CORRECTED v2; correction-parent-doi and correction-child-doi blocked at v1; the independent branch stayed active.

The owner approved DOI registration and Europe PMC core JSON after NCBI rate limiting caused validator uncertainty. Every actual notice passed the exact contract canonicalizer and identifier gate with identical digests across three off-chain fetches. The evidence digest, model input and identifier match use only pmid, doi, title, publication types, abstract and correction entries; transport metadata and byte layout are excluded. Strict validator comparison remains unchanged. Raw publisher responses are preserved as test fixtures; no publisher evidence was fabricated.

Owner reassessment retained the frozen COPE governance purpose and used report-unrelated, PMID 20017220. SUPPORTED restored decision-a to ACTIVE v2; decision-b stayed blocked v1. Recovery does not validate the withdrawn clinical finding.

Host rejection returned `[EXPECTED] notice host not authorized for this source`; unauthorized caller rejection returned `[EXPECTED] notice caller is not an authorized reporter`. Both finalized with majority-agreed ERROR/rollback, leaving ACTIVE source v1 and no notice IDs.

## Preserved earlier attempts

These receipts belong to older instances and do not prove the final contract. The PMID attempt proposed UNCERTAIN but failed consensus. The DOI attempt stored UNCERTAIN because the old token boundary rejected terminal punctuation. A later retraction proposal returned RETRACTION with matching identifier but failed validator equivalence consensus; finalized source and decisions remained active. The independent assessments are preserved honestly, without treating leader SUCCESS as committed success. No failed or timed-out hash was resubmitted.

### v3-preliminary

Contract `0x6f3Ef99E1Ff3A5A463cA4D06f566271D9E304012`. [Archive](../deployments/v3-preliminary/recall-v3-release.json).

| Operation | Hash | Saved result |
| --- | --- | --- |
| deploy | `0xde136fba373052ebe95e0bd2440610c80f45f85846be82b973a6d7ae66b7382f` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-a | `0x036efa1b6da60437aa31dfaa32a28db80fc06d36cb3b18bd8dfabaaf80e3bd86` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-unrelated | `0xb30a200cf1f0bbe24a91fbcf2dca187af934d3c7b310030f87eb392437283c57` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-a | `0xcb9a9fb43bccc640fe0e51b73b3062febf6acf77adf529bffa4b69061fdf1bce` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |

### v3-pmid-attempt

Contract `0xc2E8A3DC1c86008BB752088555E42fc16e2C1e5f`. [Archive](../deployments/v3-pmid-attempt/recall-v3-release.json).

| Operation | Hash | Saved result |
| --- | --- | --- |
| deploy | `0xc4ee1177d8e59259dc38a26dda17e4b27a4b9952cb2244dcdcb33562ca20aa78` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-a | `0x3225c019ee03153714c9627669a511a6557e96a267589d9828ecd3eb372824f0` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-unrelated | `0x29c437738d35bcef43ae5b446dd83d2c2d1cd2075c8e58ee220705694ab9dd7e` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-a | `0xbcfb2832f1d9a650fecdbf1a66e02a19c6cf02db941b31a44a11c0c9417efd89` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-b | `0x81e7c23be0ef8c5611195f69149fd41c20844f6f166894477c5e6383c3b8b1d1` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-c | `0x333230710af0885180adf1410c9d6eeb897419c7f1648b0b5ebbacc4803a2c7a` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| reject_host | `0x672071a363074dcf7d577e4a0109b455ce9dec55daf1fc0eeb0fe5e7941bd55c` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| reject_caller | `0x193f670e9ffbca07a876ec408f7fd2cd70bdbafc704784ac401e64c854a392b0` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| submit_notice:report-a | `0xb1b4d33e2f68fb151c7476a46cc4777441dbe36b1282c1ef56464c16c84d9489` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| reassess_decision:decision-a | `0x66702c71c777cd43060d973c7598a6701df287b1f923cf28dbd30080ef904dc5` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:correction-study | `0xe29e4ed7ec49cf67d04ffa12d96c76dce59d4d4772ce6133d0c823e8b232e001` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:correction-parent | `0xf608f3e8479bb9f64dab70afacb360e3b92fce597a66c5f40789d7f193ae698c` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:correction-child | `0xa6b9370676426c1324136964418d26df67c9ec3196b2112640b5d65c839a278e` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| submit_notice:correction-study | `0x0852e95453fb89bf81b09c28b5a4100a33b03af59d346ba7bdf35059b8c77916` | FINALIZED / leader SUCCESS / MAJORITY_DISAGREE |

### v3-doi-attempt

Contract `0xc2E8A3DC1c86008BB752088555E42fc16e2C1e5f`. [Archive](../deployments/v3-doi-attempt/recall-v3-release.json).

| Operation | Hash | Saved result |
| --- | --- | --- |
| register_source:correction-study-doi | `0x910dd8d7f560983a0782f7a09384ac422b8fce63eea008f965e8c26b63843d3c` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:correction-parent-doi | `0x927ccf100c6aa31816bc7ae4f9b2cf223f24b806381498b5e62d80b5854a22cd` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:correction-child-doi | `0x95826af4779ec3a799a52e20d043b16c0806e3774546a3a47cbd871765eb6c37` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| submit_notice:correction-study-doi | `0x112327aa0bbe5db5bd2a3174ea196f6870c363c661eff40a649afe58ffe2aa8f` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |

### v3-retraction-disagreement

Contract `0x5954c9F61dBEE9d1Fd90291acC3b331A34bcD5B3`. [Archive](../deployments/v3-retraction-disagreement/recall-v3-release.json).

| Operation | Hash | Saved result |
| --- | --- | --- |
| deploy | `0x630c8f2e611c47e299f9eb51c5388fa214fd4caa1874e7e029c9ec2f35461a17` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-a | `0xe67c851835d80ec7003b39974d5c794cde05c33490f640289c32847224324952` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-unrelated | `0xdb5c144e51245c9ef854c411c015e025e003d33b68d2375b4338582caa7f86c1` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-a | `0x1a8f64def591b6addd2088cc4873007a1ac3e6941643563be8a0c2b1712536e0` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-b | `0x58909b2e4830699cf6cfeb9463139bc1ea0f8b3b3c39def8fd9cde7029a94972` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-c | `0x69ab7140070241e5240ca7665d49378bdb0b1f4e9a11b820332eb6c27993ad40` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| reject_host | `0x44df26f720420f2397904962ebb02a6906c5dc99905fa1803742231f1945ff4f` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| reject_caller | `0xda41b91767281e484c201dbd7aedbccd0a6882031cf68c094789448a4dd286e4` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| submit_notice:report-a | `0x2c7401c75f2e4783d1659044f7e8f5345ac2dd62a2deb6ceed99bd8c73af1b97` | FINALIZED / leader SUCCESS / MAJORITY_DISAGREE |

### v3-diagnostic-disagreement

Contract `0x62112aA722Ad6B7e30996549fa07B7bdcDCA4554`. [Archive](../deployments/v3-diagnostic-disagreement/recall-v3-release.json).

| Operation | Hash | Saved result |
| --- | --- | --- |
| deploy | `0x84c1d6eea4c73c346fd42bafd67e7ca8dbe33f560447dcb8f54bd8bcd30aa863` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-a | `0xe88edde06629620a464ec46a1d62c62a29e6b26c522ccdc4f33feace459830f8` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_source:report-unrelated | `0x0a9857ff29309cbca9f07afaee0a76a07066793b64c4768e435711411f723fb3` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-a | `0xc2328ab138eb9fffa9639d8e82b6e70f9346d3865f26488bfb8cb0ee6a6593e8` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-b | `0x45339efd189f025ce3a1714602cbebecfbdc4cd33228a0d8d64dab441489c7b8` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| register_decision:decision-c | `0xa9fc8049eb19d15aa4752989eee16c607a0f07ecff421997b5012ac86edb18ad` | FINALIZED / leader SUCCESS / MAJORITY_AGREE |
| reject_host | `0xd154eea2b5ca9df593f35d235963e5951ecb431a9f9a874a785e612f338e179e` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| reject_caller | `0xad5b45f8f7cf889f8a1993dacd4ab6dafb4138b03826d77e3b00e7d12370a4c5` | FINALIZED / leader ERROR / MAJORITY_AGREE |
| submit_notice:report-a | `0x9b69763c59d1f1f65d963c86e2b63de3dc42b74e219d0a7d70b3b19fe3a81c9d` | FINALIZED / leader SUCCESS / MAJORITY_DISAGREE |

## Boundaries

Contest UPHELD/OVERTURNED/UNCERTAIN and publisher-reversal execution are direct-test-only: no authentic counter-notice was supplied. Consequential window opening is live-proven. Quota isolation, reporter management and uncertainty reset are direct-tested; caller/host rejection is live-proven. Host/identifier checks are not cryptographic publisher signatures. Registrant quotas do not provide Sybil resistance. Production-chain operation is untested; authorizations are synthetic fixtures.

V2 proofs/snapshots remain in [deployments/v2](../deployments/v2) and [docs/archive-v2](archive-v2); V1 remains in deployments/v1 and docs/archive-v1. Credentials stay in the OS keychain/process memory, and proof files remove credential/node-configuration fields.
