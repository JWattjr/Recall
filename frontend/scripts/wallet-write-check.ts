// Local verification harness: real signing through the app's EIP-1193 helper.
// The account key stays in the OS keychain and process memory. This is not a browser wallet test.
import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { submitWrite } from "../src/lib/network";
import { contractReadReason } from "../src/lib/rpc-error";
import { redact } from "./redact.mjs";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const filename = "../deployments/recall-wallet-transport-2026-10-04.json";
async function main() {
  const keytar = (
    await import(
      pathToFileURL(
        path.join(
          process.env.APPDATA!,
          "npm/node_modules/genlayer/node_modules/keytar/lib/keytar.js",
        ),
      ).href
    )
  ).default;
  const key = await keytar.getPassword(
    "genlayer-cli",
    "account:moment-grid-studionet",
  );
  if (!key) throw new Error("Unlock the configured operator account.");
  const account = createAccount(key);
  const client = createClient({ chain: studionet, account });
  const calls: string[] = [];
  const provider = {
    async request({
      method,
      params,
    }: {
      method: string;
      params?: unknown[] | object;
    }) {
      calls.push(method);
      if (method === "eth_chainId") return "0xf22f";
      if (method === "eth_accounts" || method === "eth_requestAccounts")
        return [account.address];
      if (method === "eth_sendTransaction") {
        const tx = (params as Record<string, string>[])[0];
        const serializedTransaction = await account.signTransaction!({
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}`,
          value: BigInt(tx.value),
          gas: BigInt(tx.gas),
          gasPrice: BigInt(tx.gasPrice),
          nonce: Number(BigInt(tx.nonce)),
          chainId: 61999,
          type: "legacy",
        });
        return client.sendRawTransaction({ serializedTransaction });
      }
      return client.request({ method, params } as never);
    },
  };
  Object.assign(globalThis, { window: { ethereum: provider } });
  let record: Record<string, any>;
  try {
    record = JSON.parse(await fs.readFile(filename, "utf8"));
  } catch {
    record = {
      checked_at: new Date().toISOString(),
      kind: "Credential-backed local EIP-1193 transport harness; no browser wallet extension",
      operations: [],
    };
  }
  const save = () =>
    fs.writeFile(
      filename,
      JSON.stringify(
        redact(record),
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
      ) + "\n",
    );
  let operation = record.operations[0];
  if (!operation) {
    // Previous receipt finalized, but source remained v1 and notice did not persist.
    // Version guard prevents a concurrent material transition from being applied twice.
    const hash = await submitWrite(account.address, "submit_notice", [
      "mri-study-20261004",
      1,
      JSON.stringify([
        "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=31011771&rettype=abstract&retmode=text",
      ]),
    ]);
    operation = {
      hash,
      method: "submit_notice",
      submitted_at: new Date().toISOString(),
      provider_calls: calls,
    };
    record.operations.push(operation);
    await save();
    console.log(JSON.stringify({ submitted: hash, provider_calls: calls }));
  }
  for (let attempt = 0; attempt < 40; attempt++) {
    const receipt = await client.getTransaction({ hash: operation.hash });
    operation.status = receipt.statusName;
    operation.receipt = receipt;
    await save();
    if (receipt.statusName === "FINALIZED") break;
    console.log(
      JSON.stringify({
        hash: operation.hash,
        status: receipt.statusName,
        attempt,
      }),
    );
    await new Promise((r) => setTimeout(r, 20000));
  }
  const read = (functionName: string, args: string[]) =>
    client.readContract({
      address: "0x432960e720542c0EAB68f76a4274fBf972A19a31",
      functionName,
      args,
      jsonSafeReturn: true,
    });
  record.source = await read("get_source", ["mri-study-20261004"]);
  record.parent = await read("get_decision", ["mri-grant-review"]);
  record.child = await read("get_decision", ["mri-grant-followup"]);
  record.independent = await read("get_decision", ["decision-c"]);
  try {
    record.notice = await read("get_notice", ["N-000003"]);
  } catch (e) {
    record.notice_read_error = contractReadReason(e);
  }
  record.material_correction_proven =
    record.notice?.finding === "MATERIAL_CORRECTION" &&
    record.source.version === 2 &&
    !record.parent.authorization_enabled &&
    !record.child.authorization_enabled &&
    record.independent.authorization_enabled;
  await save();
  console.log(
    JSON.stringify({
      status: operation.status,
      material_correction_proven: record.material_correction_proven,
      notice_finding: record.notice?.finding,
      source_version: record.source.version,
    }),
  );
}
main().catch((e) => {
  console.error(contractReadReason(e));
  process.exitCode = 1;
});
