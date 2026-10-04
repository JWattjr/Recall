import { test } from "node:test";
import assert from "node:assert/strict";
import {
  descendants,
  transactionPhase,
  validateIds,
  validateReference,
} from "../src/lib/model";
const data = {
  sources: [],
  notices: [],
  history: [],
  decisions: [
    { decision_id: "a", dependencies: ["S:changed"] },
    { decision_id: "b", dependencies: ["D:a"] },
    { decision_id: "c", dependencies: ["S:independent"] },
  ],
} as unknown as Parameters<typeof descendants>[0];
test("Reachability includes direct and transitive dependents, preserving unrelated branches", () => {
  assert.deepEqual(descendants(data, "S:changed"), ["D:a", "D:b"]);
  assert.deepEqual(descendants(data, "D:a"), ["D:b"]);
  assert.deepEqual(descendants(data, "S:independent"), ["D:c"]);
});
test("Acceptance is provisional and finality alone is not successful execution", () => {
  assert.equal(transactionPhase("ACCEPTED", "SUCCESS"), "provisional");
  assert.equal(transactionPhase("FINALIZED", "SUCCESS"), "success");
  assert.equal(transactionPhase("FINALIZED", "UNKNOWN"), "error");
  assert.equal(transactionPhase("FINALIZED", "FINISHED_WITH_ERROR"), "error");
  assert.equal(transactionPhase("FINALIZED", "ROLLBACK"), "rollback");
  assert.equal(transactionPhase("LEADER_TIMEOUT", "UNKNOWN"), "pending");
  assert.equal(transactionPhase("UNDETERMINED", "UNKNOWN"), "pending");
});
test("Dependency inputs enforce the separate four-parent bounds", () => {
  assert.doesNotThrow(() => validateIds(["a", "b", "c", "d"]));
  assert.throws(() => validateIds(["a", "b", "c", "d", "e"]));
  assert.throws(() => validateIds(["a", "a"]));
  assert.throws(() => validateIds(["invalid/id"]));
});
test("References require public HTTPS hostname syntax", () => {
  assert.doesNotThrow(() =>
    validateReference("https://eutils.ncbi.nlm.nih.gov/path"),
  );
  for (const url of [
    "http://example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://user@example.com",
    "https://example.com:444",
    "https://example.internal",
    "https://example.com/ spaces",
  ])
    assert.throws(() => validateReference(url));
});
