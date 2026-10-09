import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {redact} from './redact.mjs';
const root=new URL('../../',import.meta.url);
const release=JSON.parse(await fs.readFile(new URL('deployments/recall-v3-release.json',root),'utf8'));
assert.ok(release.completed_at,'Release must be complete');
const client=createClient({chain:studionet});
const output={checked_at:new Date().toISOString(),contract:release.contract_address,checks:{},transactions:[],state:{sources:[],decisions:[],notices:[],history:[]},failures:[]};
const pause=()=>new Promise(r=>setTimeout(r,2500));
const checked=async(name,fn)=>{try{await fn();output.checks[name]=true;}catch(e){output.checks[name]=false;output.failures.push({check:name,message:e.message});}};
const normalize=s=>s.replaceAll('\r\n','\n').trimEnd();
await checked('source_matches',async()=>{const code=await client.getContractCode(release.contract_address);const local=await fs.readFile(new URL('contracts/evidence_retraction_registry.py',root),'utf8');output.source_sha256=crypto.createHash('sha256').update(normalize(code)).digest('hex');assert.equal(normalize(code),normalize(local));assert.equal(output.source_sha256,release.source_sha256);});await pause();
await checked('abi_matches',async()=>{assert.deepEqual(await client.getContractSchema(release.contract_address),JSON.parse(await fs.readFile(new URL('contracts/abi.json',root),'utf8')));});await pause();
for(const entry of [release.deployment,...release.operations]){
 await checked(entry.operation,async()=>{const receipt=await client.getTransaction({hash:entry.hash});const execution=receipt.consensus_data?.leader_receipt?.[0]?.execution_result??receipt.txExecutionResultName;output.transactions.push({operation:entry.operation,hash:entry.hash,status:receipt.statusName,execution,receipt:redact(receipt)});assert.equal(receipt.statusName,'FINALIZED');assert.equal(execution,entry.expected_error?'ERROR':'SUCCESS');assert.equal(Number(receipt.result),entry.proof_passed===false?7:6);if(entry.expected_error){const result=receipt.consensus_data?.leader_receipt?.[0]?.result;assert.equal(result.status,'rollback');assert.ok(Buffer.from(result.raw,'base64').subarray(1).toString('utf8').includes(entry.expected_error));}assert.equal(receipt.to_address.toLowerCase(),release.contract_address.toLowerCase());});await pause();
}
for(const[kind,method,key]of[['sources','get_source','source_id'],['decisions','get_decision','decision_id'],['notices','get_notice','notice_id']]){
 for(const expected of release.final_onchain_readback[kind]){await checked(`${kind}:${expected[key]}`,async()=>{const actual=await client.readContract({address:release.contract_address,functionName:method,args:[expected[key]],jsonSafeReturn:true,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});output.state[kind].push(actual);assert.deepEqual(actual,expected);});await pause();}
}
await checked('history_matches',async()=>{output.state.history=await client.readContract({address:release.contract_address,functionName:'get_history',args:[],jsonSafeReturn:true,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});assert.deepEqual(output.state.history,release.final_onchain_readback.history);});
await checked('both_paths_and_recovery',async()=>{
 const s=id=>output.state.sources.find(x=>x.source_id===id),d=id=>output.state.decisions.find(x=>x.decision_id===id),n=id=>output.state.notices.find(x=>x.notice_id===id);
 assert.equal(n('N-000001').finding,'RETRACTION');assert.equal(n(release.after_correction.notice.notice_id).finding,'MATERIAL_CORRECTION');
 assert.equal(s('report-a').status,'RETRACTED');assert.equal(s('report-a').version,2);assert.equal(s('correction-study-doi').status,'CORRECTED');assert.equal(s('correction-study-doi').version,2);
 assert.equal(d('decision-a').status,'ACTIVE');assert.equal(d('decision-a').version,2);assert.equal(d('decision-a').last_validity,'SUPPORTED');
 for(const id of ['decision-b','correction-parent-doi','correction-child-doi']){assert.equal(d(id).status,'BLOCKED_REASSESSMENT');assert.equal(d(id).authorization_enabled,false);}
 assert.equal(d('decision-c').authorization_enabled,true);
 for(const snapshot of [release.after_retraction,release.after_correction]){assert.equal(snapshot.parent.authorization_enabled,false);assert.equal(snapshot.child.authorization_enabled,false);assert.equal(snapshot.independent.authorization_enabled,true);}
});
await fs.writeFile(new URL('deployments/recall-v3-network-verification.json',root),JSON.stringify(redact(output),(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
console.log(JSON.stringify({contract:output.contract,source_sha256:output.source_sha256,receipts:output.transactions.map(({receipt,...x})=>x),checks:output.checks,failures:output.failures},null,2));
if(output.failures.length)process.exitCode=1;
