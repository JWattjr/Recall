// Local operator only; no credential is exported or exposed to the app.
import {createClient, createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {redact} from './redact.mjs';
const root=new URL('../../',import.meta.url), file=new URL('deployments/recall-v3-release.json',root);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const publication=id=>`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:${id}%20AND%20SRC:MED&resultType=core&format=json`;
const urls={original:publication('29641633'),retraction:publication('29940049'),independent:publication('20017220'),correctionOriginal:publication('28664264'),correction:publication('29294252')};
const sentence="The percentages for 'any positive lifestyle change' and 'improved dietary practices' have unintentionally been incorrectly reported.";
let record; try{record=JSON.parse(await fs.readFile(file,'utf8'));}catch{record={schema_version:'3.0',network:{name:studionet.name,chain_id:studionet.id,rpc:studionet.rpcUrls.default.http[0]},fixture:'Synthetic authorizations; authentic publications',evidence_urls:urls,correction_pmids:{original:'28664264',erratum:'29294252',material_sentence:sentence},operations:[],preflight:[]};}
const save=()=>fs.writeFile(file,JSON.stringify(redact(record),(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
async function preflight(kind,refs,identifier){
 const result=await new Promise((resolve,reject)=>{
  const child=spawn(fileURLToPath(new URL('../../../.venv/Scripts/python.exe',import.meta.url)),[fileURLToPath(new URL('scripts/evidence_preflight.py',root))],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  let stdout='';child.stdout.on('data',data=>{stdout+=data;});child.stderr.resume();
  child.on('error',()=>reject(Error('Evidence preflight process failed')));
  child.on('close',code=>{try{const parsed=JSON.parse(stdout);if(code!==0||!parsed.passed)reject(Error(parsed.error??'Evidence preflight rejected'));else resolve(parsed);}catch{reject(Error('Evidence preflight returned invalid output'));}});
  child.stdin.end(JSON.stringify({urls:refs,identifier}));
 });
 record.preflight.push({kind,checked_at:new Date().toISOString(),...result});await save();
 console.log(JSON.stringify({event:'evidence-preflight',kind,documents:result.documents.length,samples_per_document:3,stable:true,identifier_match:true}));
}
if(!record.deployment){
 await preflight('registration-retraction-fixtures',[urls.original,urls.retraction],'10.11607/prd.476');
 await preflight('registration-independent-fixture',[urls.independent],'PMID:20017220');
 await preflight('registration-correction-fixtures',[urls.correctionOriginal,urls.correction],'10.1007/s12687-017-0310-z');
}
const keytar=(await import(pathToFileURL(path.join(process.env.APPDATA,'npm/node_modules/genlayer/node_modules/keytar/lib/keytar.js')).href)).default;
const key=await keytar.getPassword('genlayer-cli','account:moment-grid-studionet');
if(!key)throw Error('Configured local operator account is locked. Unlock to resume.');
const client=createClient({chain:studionet,account:createAccount(key)});record.actor=client.account.address;
const code=(await fs.readFile(new URL('contracts/evidence_retraction_registry.py',root),'utf8')).replaceAll('\r\n','\n').trimEnd();
const sourceHash=crypto.createHash('sha256').update(code).digest('hex');
if(record.deployment && record.source_sha256!==sourceHash)throw Error('Saved deployment source changed. Archive this attempt before a new release; never overwrite its proof.');
record.source_sha256=sourceHash;
record.correction_identifier='10.1007/s12687-017-0310-z';
record.owner_authorized_fixture_change='Owner approved DOI fixture and Europe PMC core JSON references for all publications, canonical stable fields, 20000-byte limit and one transient HTTP retry. Previous attempts remain archived.';
async function finalized(entry){
 for(let attempt=0;attempt<40;attempt++){
  const receipt=await client.getTransaction({hash:entry.hash});entry.receipt=receipt;entry.status=receipt.statusName;
  entry.execution=receipt.consensus_data?.leader_receipt?.[0]?.execution_result??receipt.txExecutionResultName;await save();
  if(entry.status==='FINALIZED'){
   console.log(JSON.stringify({event:'finalized',operation:entry.operation,hash:entry.hash,execution:entry.execution}));
   if(entry.expected_error){
    const result=receipt.consensus_data?.leader_receipt?.[0]?.result;
    entry.error_text = result?.raw ? Buffer.from(result.raw,'base64').subarray(1).toString('utf8') : JSON.stringify(result);
    if(Number(receipt.result)!==6||entry.execution!=='ERROR'||result?.status!=='rollback'||!entry.error_text.includes(entry.expected_error))throw Error('Expected deterministic rejection did not match: '+entry.error_text);
    console.log(JSON.stringify({event:'expected-rejection',operation:entry.operation,hash:entry.hash,error:entry.error_text}));
   }else if(entry.execution!=='SUCCESS'||Number(receipt.result)!==6){console.log(JSON.stringify({exact_leader_output:receipt.consensus_data?.leader_receipt?.[0]?.result?.payload?.readable??receipt.consensus_data?.leader_receipt?.[0]?.result,validator_diagnostics:receipt.consensus_data?.validators?.map(v=>({vote:v.vote,nondet_disagree:v.nondet_disagree,stdout:v.genvm_result?.stdout,stderr:v.genvm_result?.stderr}))}));throw Error('FINALIZED execution failed; stopped without resubmission.');}
   return receipt;
  }
  console.log(JSON.stringify({event:'pending',operation:entry.operation,hash:entry.hash,status:entry.status}));await pause(20000);
 }
 throw Error('Polling timed out. Rerun to resume the same saved hash; never resubmit.');
}
if(!record.deployment){record.deployment={operation:'deploy',hash:await client.deployContract({code,args:[]}),submitted_at:new Date().toISOString()};await save();console.log(JSON.stringify({event:'submitted',...record.deployment}));}
const deployment=await finalized(record.deployment);record.contract_address=deployment.to_address??deployment.toAddress;
if(!record.contract_address)throw Error('Deployment address missing');await save();
const read=async(functionName,args=[])=>{await pause(2300);return client.readContract({address:record.contract_address,functionName,args,jsonSafeReturn:true,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});};
const ops=[
 ['register_source',['report-a',urls.original,'Published clinical study; synthetic grant fixture','10.11607/prd.476','[]']],
 ['register_source',['report-unrelated',urls.independent,'COPE retraction guidelines','PMID:20017220','[]']],
 ['register_decision',['decision-a','Synthetic research grant authorization to use COPE retraction guidelines for reviewing published evidence and deciding when evidence should be retracted.','["report-a"]','[]']],
 ['register_decision',['decision-b','Synthetic downstream authorization dependent on decision-a remaining active.','[]','["decision-a"]']],
 ['register_decision',['decision-c','Independent synthetic COPE evidence governance authorization.','["report-unrelated"]','[]']],
 ['submit_notice',['report-a',1n,JSON.stringify(['https://www.ebi.ac.uk.evil.com/notice'])],{expected_error:'notice host not authorized for this source',label:'reject_host'}],
 ['submit_notice',['report-a',1n,JSON.stringify([urls.retraction])],{expected_error:'notice caller is not an authorized reporter',label:'reject_caller',unauthorized:true}],
 ['submit_notice',['report-a',1n,JSON.stringify([urls.retraction])]],
 ['reassess_decision',['decision-a',1n,'["report-unrelated"]','[]']],
 ['register_source',['correction-study-doi',urls.correctionOriginal,'Same authentic original study; DOI fixture authorized by owner after PMID proof failed','10.1007/s12687-017-0310-z','[]']],
 ['register_decision',['correction-parent-doi','Synthetic research authorization relying on the reported lifestyle-change and dietary-practice percentages in DOI 10.1007/s12687-017-0310-z.','["correction-study-doi"]','[]']],
 ['register_decision',['correction-child-doi','Synthetic downstream authorization dependent on correction-parent-doi remaining active.','[]','["correction-parent-doi"]']],
 ['submit_notice',['correction-study-doi',1n,JSON.stringify([urls.correction])]],
];
for(let i=0;i<ops.length;i++){
 const[method,args,options={}]=ops[i];let entry=record.operations[i];if(entry?.verified)continue;
 if(!entry){
 if(method==='submit_notice'){
  const correction=args[0]==='correction-study-doi';
  if(options.label==='reject_host'){record.preflight.push({kind:'reject_host',checked_at:new Date().toISOString(),deliberately_unauthorized:true,fetch_skipped:'Look-alike hostname must be rejected before retrieval.'});await save();}
  else await preflight(options.label??`${method}:${args[0]}`,[correction?urls.correctionOriginal:urls.original,...JSON.parse(args[2])],correction?'10.1007/s12687-017-0310-z':'10.11607/prd.476');
 }
 const writer = options.unauthorized ? createClient({chain:studionet,account:createAccount('0x'+crypto.randomBytes(32).toString('hex'))}) : client;
 entry={operation:options.label??`${method}:${args[0]}`,method,args,...options,actor:writer.account.address,hash:await writer.writeContract({address:record.contract_address,functionName:method,args,value:0n}),submitted_at:new Date().toISOString()};record.operations.push(entry);await save();console.log(JSON.stringify({event:'submitted',operation:entry.operation,hash:entry.hash}));}
 await finalized(entry);entry.readback=await read(method==='register_source'||method==='submit_notice'?'get_source':'get_decision',[args[0]]);
 if(method.startsWith('register_')&&(entry.readback.version!==1||entry.readback.status!=='ACTIVE'))throw Error('Registration finalized state mismatch');
 if(entry.expected_error){
  if(entry.readback.version!==1||entry.readback.status!=='ACTIVE'||entry.readback.notice_ids.length!==0)throw Error('Rejected submission changed source state');
  entry.verified=true;await save();continue;
 }
 if(method==='submit_notice'){
  const noticeId=entry.receipt.consensus_data?.leader_receipt?.[0]?.result?.payload?.readable?.match(/"notice_id":"(N-\d+)"/)?.[1];
  if(!noticeId)throw Error('Finalized receipt has no notice ID; stopped without guessing.');
  entry.expectedNoticeId=noticeId;await save();
  let notice;for(let attempt=0;attempt<8;attempt++){try{notice=await read('get_notice',[noticeId]);break;}catch(error){if(attempt===7)throw Error('Finalized notice readback failed: '+noticeId+'; '+error.shortMessage);await pause(5000);}}
  const correction=args[0]==='correction-study-doi';const snapshot={source:entry.readback,parent:await read('get_decision',[correction?'correction-parent-doi':'decision-a']),child:await read('get_decision',[correction?'correction-child-doi':'decision-b']),independent:await read('get_decision',['decision-c']),notice};
  record[correction?'after_correction':'after_retraction']=snapshot;await save();
  if(snapshot.notice.finding==='UNCERTAIN'){console.log(JSON.stringify({exact_leader_output:entry.receipt.consensus_data?.leader_receipt?.[0]?.result,stored_notice:snapshot.notice}));throw Error('UNCERTAIN: stopped as requested; path unproven.');}
  if(snapshot.notice.finding!==(correction?'MATERIAL_CORRECTION':'RETRACTION')||snapshot.source.version!==2||snapshot.source.status!==(correction?'CORRECTED':'RETRACTED')||snapshot.parent.authorization_enabled||snapshot.child.authorization_enabled||!snapshot.independent.authorization_enabled)throw Error('Notice propagation finalized state mismatch');
 }
 if(method==='reassess_decision'){
  record.after_recovery={parent:entry.readback,child:await read('get_decision',['decision-b']),independent:await read('get_decision',['decision-c'])};await save();
  if(entry.readback.version!==2||entry.readback.status!=='ACTIVE'||!entry.readback.authorization_enabled||record.after_recovery.child.authorization_enabled||!record.after_recovery.independent.authorization_enabled)throw Error('Recovery finalized state mismatch');
 }
 entry.verified=true;await save();await pause(2300);
}
record.final_onchain_readback={sources:[],decisions:[],notices:[],history:[]};
for(const id of ['report-a','report-unrelated','correction-study-doi'])record.final_onchain_readback.sources.push(await read('get_source',[id]));
for(const id of ['decision-a','decision-b','decision-c','correction-parent-doi','correction-child-doi'])record.final_onchain_readback.decisions.push(await read('get_decision',[id]));
for(const id of [...new Set(record.final_onchain_readback.sources.flatMap(s=>s.notice_ids))])record.final_onchain_readback.notices.push(await read('get_notice',[id]));
record.final_onchain_readback.history=await read('get_history');record.completed_at=new Date().toISOString();record.contest_live='Not exercised: no authentic publisher reversal supplied. Covered by direct tests only.';await save();
console.log(JSON.stringify({event:'release-proven',contract:record.contract_address,retraction:record.after_retraction.notice.finding,correction:record.after_correction.notice.finding,recovery:record.after_recovery.parent.status}));
