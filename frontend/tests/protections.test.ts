import {test} from "node:test";
import assert from "node:assert/strict";
import {writeReadIds} from "../src/lib/records";
import {verifyWriteReadback, type Case, type Tx} from "../src/lib/model";
const data = {sources:[{source_id:"study",reporters:["0xabc"],uncertain_count:0}],decisions:[],notices:[{notice_id:"N-1",source_id:"study",contest:{finding:"UPHELD"}}],history:[]} as unknown as Case;
const tx = {recordId:"study",expectedReporter:"0xabc",expectedNoticeId:"N-1"} as Tx;
test("Reporter and reset preflight reads source without unrelated records",()=>{
  for (const method of ["authorize_reporter","revoke_reporter","reset_uncertain_counter"] as const)
    assert.deepEqual(writeReadIds(method,["study","0xabc"]),{sources:["study"],decisions:[],notices:false});
});
test("Contest preflight uses source ID while retaining the notice target",()=>{
  assert.deepEqual(writeReadIds("contest_notice",["N-1","[]"],"study"),{sources:["study"],decisions:[],notices:true});
});
test("Reporter and counter finality require matching persisted source changes",()=>{
  assert.equal(verifyWriteReadback({...tx,method:"authorize_reporter"},data),true);
  assert.equal(verifyWriteReadback({...tx,method:"revoke_reporter"},data),false);
  assert.equal(verifyWriteReadback({...tx,method:"reset_uncertain_counter"},data),true);
  assert.equal(verifyWriteReadback({...tx,recordId:"absent",method:"reset_uncertain_counter"},data),false);
});
test("A successful contest receipt requires the matching persisted contest",()=>{
  assert.equal(verifyWriteReadback({...tx,method:"contest_notice"},data),true);
  assert.equal(verifyWriteReadback({...tx,expectedNoticeId:"N-other",method:"contest_notice"},data),false);
});

// A successful leader proposal can still be rejected by validator consensus.
test("finalized majority disagreement never reports transaction success", async () => {
  const { transactionPhase } = await import("../src/lib/model");
  assert.equal(transactionPhase("FINALIZED", "SUCCESS", 7), "error");
  assert.equal(transactionPhase("FINALIZED", "SUCCESS", "MAJORITY_DISAGREE"), "error");
  assert.equal(transactionPhase("FINALIZED", "SUCCESS", 6), "success");
  assert.equal(transactionPhase("FINALIZED", "ROLLBACK", 6), "rollback");
});
