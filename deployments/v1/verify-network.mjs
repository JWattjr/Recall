import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { redact } from './redact.mjs';
const root = new URL("../../", import.meta.url);
const old = JSON.parse(
  await fs.readFile(
    new URL("deployments/studionet-release-2026-09-28.json", root),
    "utf8",
  ),
);
const client = createClient({ chain: studionet });
const output = {
  checked_at: new Date().toISOString(),
  network: {
    name: studionet.name,
    chain_id: studionet.id,
    rpc: studionet.rpcUrls.default.http[0],
  },
  contract: old.contract_address,
  checks: {},
  transactions: [],
  state: { sources: [], decisions: [], notices: [], history: [] },
  preflight: [],
};
const pause = () => new Promise((r) => setTimeout(r, 1300));
const local = await fs.readFile(
  new URL("contracts/evidence_retraction_registry.py", root),
  "utf8",
);
const code = await client.getContractCode(old.contract_address);
const normalize = (s) => s.replaceAll("\r\n", "\n").trimEnd();
output.checks.source_matches = normalize(local) === normalize(code);
output.checks.source_sha256 = crypto
  .createHash("sha256")
  .update(normalize(code))
  .digest("hex");
await pause();
const abi = await client.getContractSchema(old.contract_address);
output.checks.abi = abi;
const expected = JSON.parse(
  await fs.readFile(new URL("contracts/abi.json", root), "utf8"),
);
output.checks.abi_matches = JSON.stringify(abi) === JSON.stringify(expected);
await pause();
for (const t of old.transactions) {
  try {
    output.transactions.push({
      operation: t.operation,
      hash: t.hash,
      receipt: await client.getTransaction({ hash: t.hash }),
    });
  } catch (e) {
    output.transactions.push({
      operation: t.operation,
      hash: t.hash,
      error: String(e),
    });
  }
  await pause();
}
for (const [type, ids] of [
  ["sources", ["report-a", "report-unrelated"]],
  ["decisions", ["decision-a", "decision-b", "decision-c"]],
  ["notices", ["N-000001"]],
]) {
  for (const id of ids) {
    output.state[type].push(
      await client.readContract({
        address: old.contract_address,
        functionName:
          type === "sources"
            ? "get_source"
            : type === "decisions"
              ? "get_decision"
              : "get_notice",
        args: [id],
        jsonSafeReturn: true,
      }),
    );
    await pause();
  }
}
output.state.history = await client.readContract({
  address: old.contract_address,
  functionName: "get_history",
  args: [],
  jsonSafeReturn: true,
});
for (const url of old.evidence_urls.filter((u) => !u.includes("github.com"))) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(20000),
      redirect: "manual",
    });
    const body = new Uint8Array(await response.arrayBuffer());
    let utf8 = true,
      text = "";
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(body);
    } catch {
      utf8 = false;
    }
    output.preflight.push({
      url,
      status: response.status,
      bytes: body.length,
      redirect: response.headers.get("location"),
      strict_utf8: utf8,
      contract_fetch_compatible:
        response.status === 200 &&
        body.length > 0 &&
        body.length <= 5000 &&
        utf8,
      preview: text.slice(0, 5000),
    });
  } catch (e) {
    output.preflight.push({ url, error: String(e) });
  }
}
await fs.writeFile(
  new URL("deployments/recall-network-verification-2026-10-04.json", root),
  JSON.stringify(
    redact(output),
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    {
      checks: output.checks,
      transactions: output.transactions.map((t) => ({
        operation: t.operation,
        hash: t.hash,
        status: t.receipt?.statusName,
        execution: t.receipt?.txExecutionResultName,
        error: t.error,
      })),
      preflight: output.preflight.map(({ preview, ...p }) => p),
    },
    null,
    2,
  ),
);
