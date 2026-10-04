import { test } from "node:test";
import assert from "node:assert/strict";
import { writeReadIds, mergeRecords } from "../src/lib/records";
import { type Case } from "../src/lib/model";

test("Registration preflight reads only its target and declared parents", () => {
  assert.deepEqual(writeReadIds("register_source", ["new", "https://example.com", "Publisher"]), { sources: ["new"], decisions: [], notices: false });
  assert.deepEqual(writeReadIds("register_decision", ["child", "Frozen purpose", '["study"]', '["parent"]']), { sources: ["study"], decisions: ["child", "parent"], notices: false });
});
test("Notice and reassessment preflights retain version targets without scanning unrelated records", () => {
  assert.deepEqual(writeReadIds("submit_notice", ["study", 1, '["https://example.com"]']), { sources: ["study"], decisions: [], notices: true });
  assert.deepEqual(writeReadIds("reassess_decision", ["parent", 1, '["current"]', "[]"]), { sources: ["current"], decisions: ["parent"], notices: false });
});
test("Partial readback updates changed records without losing unrelated branches or proof", () => {
  const previous = { sources: [{ source_id: "study", version: 1 }], decisions: [{ decision_id: "parent", version: 1 }, { decision_id: "independent", version: 1 }], notices: [{ notice_id: "N-000001" }], history: [{ decision_id: "older" }] } as unknown as Case;
  const patch = { sources: [], decisions: [{ decision_id: "parent", version: 2 }], notices: [], history: [] } as unknown as Case;
  const result = mergeRecords(previous, patch);
  assert.deepEqual(result.decisions.map(d => [d.decision_id, d.version]), [["parent", 2], ["independent", 1]]);
  assert.deepEqual(result.sources, previous.sources);
  assert.deepEqual(result.notices, previous.notices);
  assert.deepEqual(result.history, previous.history);
  assert.equal(previous.decisions[0].version, 1);
});
