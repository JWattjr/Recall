// Read-only check after a stopped proof. Never imports the write/release runner.
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('../../',import.meta.url);
const release=JSON.parse(await fs.readFile(new URL('deployments/v3-diagnostic-disagreement/recall-v3-release.json',root),'utf8'));
const client=createClient({chain:studionet});
const output={checked_at:new Date().toISOString(),contract:release.contract_address,source:null,decisions:[],unchanged:false};
const read=async(functionName,args)=>client.readContract({address:release.contract_address,functionName,args,jsonSafeReturn:true,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});
try {
 output.source=await read('get_source',['report-a']);
 for(const id of ['decision-a','decision-b']){
  await new Promise(resolve=>setTimeout(resolve,2500));
  output.decisions.push(await read('get_decision',[id]));
 }
 assert.equal(output.source.status,'ACTIVE');assert.equal(output.source.version,1);assert.deepEqual(output.source.notice_ids,[]);
 for(const d of output.decisions){assert.equal(d.status,'ACTIVE');assert.equal(d.version,1);assert.equal(d.authorization_enabled,true);}
 output.unchanged=true;
 await fs.mkdir(new URL('deployments/v3-diagnostic-disagreement/',root),{recursive:true});
 await fs.writeFile(new URL('deployments/v3-diagnostic-disagreement/unchanged-state.json',root),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify({contract:output.contract,unchanged:output.unchanged,source:output.source.status,decisions:output.decisions.map(d=>({id:d.decision_id,status:d.status,version:d.version}))}));
} catch(error){console.error(error.shortMessage??error.message);process.exitCode=1;}
