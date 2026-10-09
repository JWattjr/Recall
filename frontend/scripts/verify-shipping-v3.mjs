// Verify the public release and exact Portal URLs after the main-branch push.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);
const release=JSON.parse(await fs.readFile(new URL('deployments/recall-v3-release.json',root),'utf8'));
const fields=JSON.parse(await fs.readFile(new URL('docs/submission/portal-fields.json',root),'utf8'));
assert.ok(release.completed_at);
const output={checked_at:new Date().toISOString(),contract:release.contract_address,source_commit:process.argv[2],checks:{},failures:[]};
async function checked(name,fn){try{await fn();output.checks[name]=true;}catch(error){output.checks[name]=false;output.failures.push({check:name,message:error.message});}}
await checked('public_page',async()=>{const response=await fetch(fields.website,{signal:AbortSignal.timeout(30000)});assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes(release.contract_address));});
await checked('public_live_api',async()=>{
 const response=await fetch(fields.website+'/api/case?fresh=1',{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200);
 const body=await response.json();assert.equal(body.contract,release.contract_address);assert.equal(body.chainId,61999);assert.deepEqual(body.errors,[]);
 for(const kind of ['sources','decisions','notices']){
  const key=kind==='sources'?'source_id':kind==='decisions'?'decision_id':'notice_id';
  const expected=release.final_onchain_readback[kind];assert.equal(body.data[kind].length,expected.length);
  for(const record of expected)assert.deepEqual(body.data[kind].find(row=>row[key]===record[key]),record);
 }
 output.api={status:response.status,checked_at:body.checkedAt,sources:body.data.sources.length,decisions:body.data.decisions.length,notices:body.data.notices.length,record_errors:body.errors.length};
});
await checked('public_availability_preflight',async()=>{const response=await fetch(fields.website+'/api/preflight',{signal:AbortSignal.timeout(60000)});assert.equal(response.status,200);const body=await response.json();assert.equal(body.ready,true);assert.ok(body.documents.every(d=>d.status===200&&d.bytes<=20000));output.availability={checked_at:body.checkedAt,ready:body.ready,documents:body.documents.map(({text,...d})=>d)};});
const urls=[...new Set([fields.website,fields.github,...fields.contractLinks,...fields.evidence].filter(Boolean))];
const linkChecks=[];
for(const url of urls){
 try{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});linkChecks.push({url,status:response.status,final_url:response.url});await response.body?.cancel();}
 catch(error){linkChecks.push({url,status:null,error:error.message});}
}
const reply=await fs.readFile(new URL('docs/submission/STEWARD_RESPONSE.md',root),'utf8');
output.field_lengths={oneLiner:fields.oneLiner.length,description:fields.description.length,expectedOutcome:fields.expectedOutcome.length,stewardResponse:reply.length};
await checked('portal_links_200',async()=>assert.ok(linkChecks.every(row=>row.status===200)));
await checked('portal_field_lengths',async()=>{assert.ok(output.field_lengths.oneLiner<=180);assert.ok(output.field_lengths.description<=1000);assert.ok(output.field_lengths.expectedOutcome<=500);assert.ok(reply.length<=900);assert.equal(fields.demoVideo,'');});
await fs.writeFile(new URL('docs/submission/link-check.json',root),JSON.stringify({checked_at:output.checked_at,links:linkChecks,field_lengths:output.field_lengths},null,2)+'\n');
await fs.writeFile(new URL('deployments/recall-v3-shipping.json',root),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({...output,links:linkChecks},null,2));
if(output.failures.length)process.exitCode=1;
