import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyWriteReadback, type Case, type Tx } from "../src/lib/model";
const tx = {
  method: "submit_notice",
  recordId: "study",
  expectedVersion: 1,
  expectedNoticeId: "N-000003",
  phase: "success",
} as Tx;
const empty = { sources: [], decisions: [], notices: [], history: [] } as Case;
test("Finalized execution with absent notice is not a verified transition", () => {
  assert.equal(verifyWriteReadback(tx, empty), false);
  const wrong = {
    ...empty,
    notices: [{ notice_id: "N-000002", source_id: "study", base_version: 1 }],
  } as Case;
  assert.equal(verifyWriteReadback(tx, wrong), false);
});
test("An uncertainty notice can be verified without advancing the source", () => {
  const data = {
    ...empty,
    notices: [
      {
        notice_id: "N-000003",
        source_id: "study",
        base_version: 1,
        finding: "UNCERTAIN",
      },
    ],
  } as Case;
  assert.equal(verifyWriteReadback(tx, data), true);
});
test("Recovery must read back the expected new decision version", () => {
  const reassessment = {
    ...tx,
    method: "reassess_decision",
    recordId: "parent",
  } as Tx;
  assert.equal(
    verifyWriteReadback(reassessment, {
      ...empty,
      decisions: [{ decision_id: "parent", version: 1 }],
    } as Case),
    false,
  );
  assert.equal(
    verifyWriteReadback(reassessment, {
      ...empty,
      decisions: [{ decision_id: "parent", version: 2 }],
    } as Case),
    true,
  );
});
