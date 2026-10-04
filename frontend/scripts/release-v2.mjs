// Local operator only; no credential is exported or exposed to the app.
import {createClient, createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {redact} from './redact.mjs';
const root=new URL('../../',import.meta.url), file=new URL('deployments/recall-v2-release.json',root);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const efetch=id=>`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${id}&rettype=abstract&retmode=text`;
const urls={original:'https://api.crossref.org/v1/works?filter=doi:10.11607/prd.476&rows=1&select=DOI,title,publisher,issued,type',retraction:efetch('29940049'),independent:efetch('20017220'),correctionOriginal:efetch('28664264'),correction:efetch('29294252')};
const sentence="The percentages for 'any positive lifestyle change' and 'improved dietary practices' have unintentionally been incorrectly reported.";
let record; try{record=JSON.parse(await fs.readFile(file,'utf8'));}catch{record={schema_version:'2.0',network:{name:studionet.name,chain_id:studionet.id,rpc:studionet.rpcUrls.default.http[0]},fixture:'Synthetic authorizations; authentic publications',evidence_urls:urls,correction_pmids:{original:'28664264',erratum:'29294252',material_sentence:sentence},operations:[],preflight:[]};}
const save=()=>fs.writeFile(file,JSON.stringify(redact(record),(_,v)=>typeof v==='bigint'?v.toString():v,2)+'\n');
for(const [kind,url] of Object.entries(urls)){
 if(record.preflight.some(p=>p.kind===kind&&p.status===200&&p.bytes>0&&p.bytes<5000))continue;
 const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(30000)}),body=new Uint8Array(await r.arrayBuffer());
 const text=new TextDecoder('utf-8',{fatal:true}).decode(body);
 const p={kind,url,status:r.status,bytes:body.length,sha256:crypto.createHash('sha256').update(body).digest('hex'),material_sentence_present:kind==='correction'?text.replace(/\s+/g,' ').includes(sentence):undefined};
 record.preflight=record.preflight.filter(p=>p.kind!==kind);record.preflight.push(p);await save();
 if(r.status!==200||!body.length||body.length>=5000||(kind==='correction'&&!p.material_sentence_present))throw Error(`Preflight failed: ${kind}`);
 await pause(1000);
}
const keytar=(await import(pathToFileURL(path.join(process.env.APPDATA,'npm/node_modules/genlayer/node_modules/keytar/lib/keytar.js')).href)).default;
const key=await keytar.getPassword('genlayer-cli','account:moment-grid-studionet');
if(!key)throw Error('Configured local operator account is locked. Unlock to resume.');
const client=createClient({chain:studionet,account:createAccount(key)});record.actor=client.account.address;
const code=(await fs.readFile(new URL('contracts/evidence_retraction_registry.py',root),'utf8')).replaceAll('\r\n','\n').trimEnd();
record.source_sha256=crypto.createHash('sha256').update(code).digest('hex');
async function finalized(entry){
 for(let attempt=0;attempt<40;attempt++){
  const receipt=await client.getTransaction({hash:entry.hash});entry.receipt=receipt;entry.status=receipt.statusName;
  entry.execution=receipt.consensus_data?.leader_receipt?.[0]?.execution_result??receipt.txExecutionResultName;await save();
  if(entry.status==='FINALIZED'){
   console.log(JSON.stringify({event:'finalized',operation:entry.operation,hash:entry.hash,execution:entry.execution}));
   if(entry.execution!=='SUCCESS'){console.log(JSON.stringify({exact_leader_output:receipt.consensus_data?.leader_receipt?.[0]?.result,exact_leader_receipt:redact(receipt.consensus_data?.leader_receipt?.[0])}));throw Error('FINALIZED execution failed; stopped without resubmission.');}
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
 ['register_source',['report-a',urls.original,'Published clinical study; synthetic grant fixture']],
 ['register_source',['report-unrelated',urls.independent,'COPE retraction guidelines']],
 ['register_decision',['decision-a','Synthetic research grant authorization to use COPE retraction guidelines for reviewing published evidence and deciding when evidence should be retracted.','["report-a"]','[]']],
 ['register_decision',['decision-b','Synthetic downstream authorization dependent on decision-a remaining active.','[]','["decision-a"]']],
 ['register_decision',['decision-c','Independent synthetic COPE evidence governance authorization.','["report-unrelated"]','[]']],
 ['submit_notice',['report-a',1n,JSON.stringify([urls.retraction])]],
 ['reassess_decision',['decision-a',1n,'["report-unrelated"]','[]']],
 ['register_source',['correction-study',urls.correctionOriginal,'Published genetic testing meta-analysis; synthetic fixture']],
 ['register_decision',['correction-parent','Synthetic research authorization relying on the reported lifestyle-change and dietary-practice percentages in DOI 10.1007/s12687-017-0310-z.','["correction-study"]','[]']],
 ['register_decision',['correction-child','Synthetic downstream authorization dependent on correction-parent remaining active.','[]','["correction-parent"]']],
 ['submit_notice',['correction-study',1n,JSON.stringify([urls.correction])]],
];
for(let i=0;i<ops.length;i++){
 const[method,args]=ops[i];let entry=record.operations[i];if(entry?.verified)continue;
 if(!entry){entry={operation:`${method}:${args[0]}`,method,args,hash:await client.writeContract({address:record.contract_address,functionName:method,args,value:0n}),submitted_at:new Date().toISOString()};record.operations.push(entry);await save();console.log(JSON.stringify({event:'submitted',operation:entry.operation,hash:entry.hash}));}
 await finalized(entry);entry.readback=await read(method==='register_source'||method==='submit_notice'?'get_source':'get_decision',[args[0]]);
 if(method.startsWith('register_')&&(entry.readback.version!==1||entry.readback.status!=='ACTIVE'))throw Error('Registration finalized state mismatch');
 if(method==='submit_notice'){
  const correction=args[0]==='correction-study';const snapshot={source:entry.readback,parent:await read('get_decision',[correction?'correction-parent':'decision-a']),child:await read('get_decision',[correction?'correction-child':'decision-b']),independent:await read('get_decision',['decision-c']),notice:await read('get_notice',[correction?'N-000002':'N-000001'])};
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
for(const id of ['report-a','report-unrelated','correction-study'])record.final_onchain_readback.sources.push(await read('get_source',[id]));
for(const id of ['decision-a','decision-b','decision-c','correction-parent','correction-child'])record.final_onchain_readback.decisions.push(await read('get_decision',[id]));
for(const id of ['N-000001','N-000002'])record.final_onchain_readback.notices.push(await read('get_notice',[id]));
record.final_onchain_readback.history=await read('get_history');record.completed_at=new Date().toISOString();await save();
console.log(JSON.stringify({event:'release-proven',contract:record.contract_address,retraction:record.after_retraction.notice.finding,correction:record.after_correction.notice.finding,recovery:record.after_recovery.parent.status}));
