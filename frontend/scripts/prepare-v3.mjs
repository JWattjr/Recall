// Build recorded application snapshots only from a fully proved release.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../../', import.meta.url);
const read = path => fs.readFile(new URL(path, root), 'utf8');
const write = (path, text) => fs.writeFile(new URL(path, root), text);
const json = (path, value) => write(path, JSON.stringify(value, null, 2) + '\n');
const r = JSON.parse(await read('deployments/recall-v3-release.json'));
assert.ok(r.completed_at, 'Complete the live release before preparing assets');
const ret = r.after_retraction, cor = r.after_correction, recovery = r.after_recovery;
assert.equal(ret.notice.finding, 'RETRACTION');
assert.equal(cor.notice.finding, 'MATERIAL_CORRECTION');
assert.equal(recovery.parent.status, 'ACTIVE');
assert.equal(recovery.parent.version, 2);
assert.equal(recovery.child.authorization_enabled, false);
const entries = [r.deployment, ...r.operations];
assert.equal(entries.length, 14);
const transactions = entries.map(e => {
  assert.equal(e.status, 'FINALIZED');
  assert.equal(Number(e.receipt.result), 6);
  assert.equal(e.execution, e.expected_error ? 'ERROR' : 'SUCCESS');
  return {operation:e.operation, method:e.method ?? 'deploy', hash:e.hash,
    status:e.status, execution:e.execution,
    result:e.receipt.consensus_data.leader_receipt[0].result.status,
    consensus:'MAJORITY_AGREE', expected_failure:!!e.expected_error, proof_passed:true};
});
const hash = operation => entries.find(e => e.operation === operation).hash;
const unrelated = r.final_onchain_readback.sources.find(s => s.source_id === 'report-unrelated');
const snapshot = row => ({sources:[row.source, unrelated],
  decisions:[row.parent, row.child, row.independent], notices:[row.notice], history:[]});
await json('frontend/src/data/historical.json', {
  contract_address:r.contract_address, project:{source_commit:'main'},
  source_sha256:r.source_sha256, checked_at:r.completed_at, transactions,
  final_onchain_readback:snapshot(ret), correction:snapshot(cor),
});
await json('frontend/src/data/release-proof.json', {
  checkedAt:r.completed_at, network:'StudioNet 61999 - hosted development simulator',
  ownerRecovery:true, childStaysBlocked:true, parent:recovery.parent, child:recovery.child,
  transactions, correction:{materialCorrectionProven:true,
    hash:hash('submit_notice:correction-study-doi'), status:'FINALIZED', finding:cor.notice.finding},
});
const fields = JSON.parse(await read('docs/submission/portal-fields.json'));
fields.contractLinks = ['https://explorer-studio.genlayer.com/address/' + r.contract_address];
fields.howTo[2].instruction = 'Switch to Live network. Evidence review (decision-a) is ACTIVE v2, SUPPORTED after owner reassessment. Downstream authorization (decision-b), correction-parent-doi and correction-child-doi remain blocked at v1.';
await json('docs/submission/portal-fields.json', fields);
const lengths = Object.fromEntries(['oneLiner','description','expectedOutcome'].map(k => [k, fields[k].length]));
assert.ok(lengths.oneLiner <= 180 && lengths.description <= 1000 && lengths.expectedOutcome <= 500);
let reply = await read('docs/submission/STEWARD_RESPONSE.md');
const replacements = {
  '0x193f670e9ffbca07a876ec408f7fd2cd70bdbafc704784ac401e64c854a392b0':'reject_caller',
  '0x672071a363074dcf7d577e4a0109b455ce9dec55daf1fc0eeb0fe5e7941bd55c':'reject_host',
  '0xb1b4d33e2f68fb151c7476a46cc4777441dbe36b1282c1ef56464c16c84d9489':'submit_notice:report-a',
  '0x66702c71c777cd43060d973c7598a6701df287b1f923cf28dbd30080ef904dc5':'reassess_decision:decision-a',
};
for (const [old, operation] of Object.entries(replacements)) reply = reply.replaceAll(old, hash(operation));
assert.ok(reply.length <= 900);
await write('docs/submission/STEWARD_RESPONSE.md', reply);
const lines = ['# Protected v3 proof manifest - 9 October 2026', '',
  `Contract \`${r.contract_address}\` on StudioNet 61999, hosted development simulation. Normalized LF/trimmed-end source SHA-256: \`${r.source_sha256}\`.`, '',
  'Runner: `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`.', '',
  '[Release receipts and finalized reads](../deployments/recall-v3-release.json) | [Independent network verification](../deployments/recall-v3-network-verification.json).', '',
  '## Current release', '',
  'All 14 transactions are FINALIZED with MAJORITY_AGREE: 12 successful writes including deployment and two deliberate ERROR/rollback rejections. Registrations and consequences matched LATEST_FINAL state reads.', '',
  '| Operation | Hash | Execution |', '| --- | --- | --- |'];
for (const t of transactions) lines.push(`| ${t.operation} | \`${t.hash}\` | ${t.execution}${t.expected_failure ? ' (expected rollback)' : ''} |`);
lines.push('', '## Authentic notices and owner recovery', '',
  `Retraction: [Europe PMC original PMID 29641633](${r.evidence_urls.original}) and [Europe PMC retraction PMID 29940049](${r.evidence_urls.retraction}). ${ret.notice.notice_id} returned RETRACTION, identifier_match=true and authorized Europe PMC host. report-a became RETRACTED v2; decision-a and decision-b blocked at v1; independent decision-c stayed active. The consequential notice opened a 72-hour contest window.`, '',
  `Correction: [original PMID 28664264](${r.evidence_urls.correctionOriginal}) was registered under its DOI \`10.1007/s12687-017-0310-z\`, with default NCBI/Crossref/Europe PMC hosts. [Real erratum PMID 29294252](${r.evidence_urls.correction}) explicitly corrects reported lifestyle-change and dietary-practice percentages. ${cor.notice.notice_id} returned MATERIAL_CORRECTION, identifier_match=true and authorized Europe PMC host. correction-study-doi became CORRECTED v2; correction-parent-doi and correction-child-doi blocked at v1; the independent branch stayed active.`, '',
  'The owner approved DOI registration and Europe PMC core JSON after NCBI rate limiting caused validator uncertainty. Every actual notice passed the exact contract canonicalizer and identifier gate with identical digests across three off-chain fetches. The evidence digest, model input and identifier match use only pmid, doi, title, publication types, abstract and correction entries; transport metadata and byte layout are excluded. Strict validator comparison remains unchanged. Raw publisher responses are preserved as test fixtures; no publisher evidence was fabricated.', '',
  'Owner reassessment retained the frozen COPE governance purpose and used report-unrelated, PMID 20017220. SUPPORTED restored decision-a to ACTIVE v2; decision-b stayed blocked v1. Recovery does not validate the withdrawn clinical finding.', '',
  'Host rejection returned `[EXPECTED] notice host not authorized for this source`; unauthorized caller rejection returned `[EXPECTED] notice caller is not an authorized reporter`. Both finalized with majority-agreed ERROR/rollback, leaving ACTIVE source v1 and no notice IDs.', '',
  '## Preserved earlier attempts', '',
  'These receipts belong to older instances and do not prove the final contract. The PMID attempt proposed UNCERTAIN but failed consensus. The DOI attempt stored UNCERTAIN because the old token boundary rejected terminal punctuation. A later retraction proposal returned RETRACTION with matching identifier but failed validator equivalence consensus; finalized source and decisions remained active. The independent assessments are preserved honestly, without treating leader SUCCESS as committed success. No failed or timed-out hash was resubmitted.');
const seen = new Set(transactions.map(t => t.hash));
for (const folder of ['v3-preliminary','v3-pmid-attempt','v3-doi-attempt','v3-retraction-disagreement','v3-diagnostic-disagreement']) {
  const archive = JSON.parse(await read(`deployments/${folder}/recall-v3-release.json`));
  lines.push('', `### ${folder}`, '', `Contract \`${archive.contract_address}\`. [Archive](../deployments/${folder}/recall-v3-release.json).`, '',
    '| Operation | Hash | Saved result |', '| --- | --- | --- |');
  for (const e of [archive.deployment, ...archive.operations]) {
    if (seen.has(e.hash)) continue;
    seen.add(e.hash);
    lines.push(`| ${e.operation} | \`${e.hash}\` | ${e.status} / leader ${e.execution} / ${Number(e.receipt?.result) === 6 ? 'MAJORITY_AGREE' : 'MAJORITY_DISAGREE'} |`);
  }
}
lines.push('', '## Boundaries', '',
  'Contest UPHELD/OVERTURNED/UNCERTAIN and publisher-reversal execution are direct-test-only: no authentic counter-notice was supplied. Consequential window opening is live-proven. Quota isolation, reporter management and uncertainty reset are direct-tested; caller/host rejection is live-proven. Host/identifier checks are not cryptographic publisher signatures. Registrant quotas do not provide Sybil resistance. Production-chain operation is untested; authorizations are synthetic fixtures.', '',
  'V2 proofs/snapshots remain in [deployments/v2](../deployments/v2) and [docs/archive-v2](archive-v2); V1 remains in deployments/v1 and docs/archive-v1. Credentials stay in the OS keychain/process memory, and proof files remove credential/node-configuration fields.');
await write('docs/PROOF_MANIFEST.md', lines.join('\n') + '\n');
for (const path of ['README.md','docs/TUTORIAL.md']) {
  let text = await read(path);
  text = text.replaceAll('0xc2E8A3DC1c86008BB752088555E42fc16e2C1e5f', r.contract_address)
    .replaceAll('d63a54769556b1110701eea3d437ac7b054dc82af07f27c18ad782bec972afab', r.source_sha256)
    .replaceAll('15 successful writes', '12 successful writes')
    .replaceAll('plus two deliberate host/caller rollback transactions and one preserved consensus-rejected PMID attempt', 'plus two deliberate host/caller rollback transactions')
    .replaceAll('all 18 new receipts', 'all 14 new receipts')
    .replace(/\*\*Current v3 release status:.*?\*\*\n\n/, '');
  await write(path, text);
}
await write('docs/OWNER_SUBMISSION.md', `# Owner resubmission handoff\n\nUpdate existing contribution **bd6c877a…**; do not create a replacement. The owner reviews and pastes the fields/response and clicks Resubmit manually. No Portal resubmission was performed.\n\n[Application](https://recall-genlayer.vercel.app) | [Repository](https://github.com/JWattjr/Recall) | [Exact fields](submission/portal-fields.json) | [Steward response](submission/STEWARD_RESPONSE.md) | [Every current and archived hash](PROOF_MANIFEST.md)\n\nContract \`${r.contract_address}\`, StudioNet 61999. Fourteen finalized, majority-agreed receipts: 12 successful writes and two expected rollbacks. Both authentic notices advanced the source to v2 and blocked parent/child while preserving the independent branch. Owner reassessment recovered the parent ACTIVE v2; the child stayed blocked.\n\n## Description\n\n${fields.description}\n\n## Expected outcome\n\n${fields.expectedOutcome}\n\nField lengths: ${lengths.oneLiner}/180, ${lengths.description}/1000, ${lengths.expectedOutcome}/500. Steward reply: ${reply.length}/900. Primary tag suggestion: Governance, if offered. Demo video stays empty at the owner's request.\n\nContest/reversal is direct-test-only. Quota isolation and reporter/reset management are direct-tested. Host/identifier checks are not publisher signatures; StudioNet is simulation. The owner approved DOI registration after the NCBI text omitted the original PMID. Failed attempts remain archived; no failed hash was resubmitted.\n\n[Release verification](RELEASE_VERIFICATION.md) | [Test names](TEST_MATRIX.md) | [Demo](DEMO.md) | [Tutorial](TUTORIAL.md).\n`);
await write('SUBMISSION_DRAFT.md', `# Recall - existing contribution resubmission draft\n\nPrepared for existing submission bd6c877a…; not resubmitted. Use [owner handoff](docs/OWNER_SUBMISSION.md), [exact fields](docs/submission/portal-fields.json) and [steward response](docs/submission/STEWARD_RESPONSE.md).\n\n${fields.description}\n\n${fields.expectedOutcome}\n\nContract \`${r.contract_address}\`. [Proof manifest](docs/PROOF_MANIFEST.md) includes every current hash and the preserved failed-attempt archives. Video remains empty; the owner resubmits manually.\n`);
console.log(JSON.stringify({contract:r.contract_address, current_receipts:transactions.length,
  unique_hashes:seen.size, field_lengths:lengths, steward_response_length:reply.length}, null, 2));
