# Proof manifest — 4 October 2026

StudioNet 61999 is hosted development simulation. Contract: `0x432960e720542c0EAB68f76a4274fBf972A19a31`. Runner remains pinned. [Source/ABI and receipt revalidation](../deployments/recall-network-verification-2026-10-04.json) matches source commit `c0d00fc83477c6eaa69bcf001c5378212e7ac52a` and normalized SHA-256 `4310a5cb4b5dfb4e326a0c41a1c946d905e1d537fedd37b0c60116a8e87168f2`.

## Historical retraction, revalidated

[Original release](../deployments/studionet-release-2026-09-28.json) remains unchanged. Eight receipts were checked again: seven finalized successful executions and one finalized stale-replay rollback. report-a is RETRACTED v2, decision-a and decision-b are blocked, decision-c remains active.

Retraction: `0x903df09915835536652632d327bde8cb1cd963cf6621fe74d27ecbcb917329a5`
Rollback: `0x33d50ddd035e95b92480cddb6065a8a210eb92c92349ba034f90aace90dedc0c`

## Fresh explicit owner recovery

[New release and state reads](../deployments/recall-live-release-2026-10-04.json). All five operations FINALIZED, execution SUCCESS, result return:

| Operation | Transaction ID |
|---|---|
| Register grant source | `0x56c85abcaefab1ce4db629004760f7fc960a578e1210b9d4140b79d8812938fe` |
| Register parent | `0xd5148110de35d3a870cfd1f42ae009bb2cf546e24f32f43d645664bee996cb5d` |
| Register child | `0x7f3d1324ce9f7cb6696c7b96a32301c3d242b1db0ecab9799a91f4249978395a` |
| Retraction N-000002 | `0xf7a05011ddbd9ddb8df6b4aad85b53b193f97cbce96e5457daec14dde1718e5e` |
| Owner reassessment | `0xe3e27c3a95520e1dc264da7a4965eaf09aa0d8d975b9a1838f7bca576512a0fe` |

Owner: `0xdb433ff614bdd1ece21aa97221c3e0a7ecf79c92`. Published retraction made grant-study-20261004 RETRACTED v2 and blocked its two synthetic decisions. Reassessing the parent's frozen COPE evidence-governance purpose against report-unrelated returned SUPPORTED. grant-policy-review is ACTIVE v2; grant-release-review remains BLOCKED_REASSESSMENT v1. decision-c stays active. Stored citations and digests appear in the release and app proof view.

## Correction gap

Authentic original MRI publication PMID 30904949 / DOI `10.1007/s00234-019-02198-w` and correction PMID 31011771 / DOI `10.1007/s00234-019-02214-z` returned HTTP 200, 2,918 / 1,255 bytes, strict UTF-8 in [off-chain preflight](../deployments/recall-correction-preflight-2026-10-04.json). This does not establish validator availability.

[First run](../deployments/recall-correction-release-2026-10-04.json) registered the source/decisions, then notice `0xc441e7df8ee15ab7af0ffdb83e230937c34710776a4a915d4e0e915688845163` finalized with an UNCERTAIN leader return. Finalized reads showed source v1 and no N-000003.

[Version-guarded retry through the app wallet helper](../deployments/recall-wallet-transport-2026-10-04.json): `0x6d8fbeceb4755810a68e3d0503411080d53b1cf012a5107e43fed0bb0904ef84` also FINALIZED; material correction remained unproven and N-000003 absent. It used a credential-backed local EIP-1193 adapter, not a browser extension. No publication or consensus result was fabricated.

Explorer routing was not verified; copy IDs to the CLI or use the app's transaction route. New RPC records omit credentials and simulator configuration/state dumps. Historical proof remains preserved.
