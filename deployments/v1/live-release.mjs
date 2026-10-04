// Local operator tool only. This file is never imported by the app or a route.
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { redact } from './redact.mjs';
process.on('uncaughtException', e => { console.error(e.message); process.exit(1); });
process.on('unhandledRejection', e => { console.error(e instanceof Error ? e.message : String(e)); process.exit(1); });
const root = new URL("../../", import.meta.url);
const correction = process.argv.includes("--correction");
const recordPath = new URL(
  correction
    ? "deployments/recall-correction-release-2026-10-04.json"
    : "deployments/recall-live-release-2026-10-04.json",
  root,
);
const keytarPath = path.join(
  process.env.APPDATA,
  "npm/node_modules/genlayer/node_modules/keytar/lib/keytar.js",
);
const keytar = (await import(pathToFileURL(keytarPath).href)).default;
const key = await keytar.getPassword(
  "genlayer-cli",
  "account:moment-grid-studionet",
);
if (!key)
  throw new Error(
    "Unlock the configured moment-grid-studionet account with the GenLayer CLI, then rerun. No credential is exported.",
  );
const client = createClient({ chain: studionet, account: createAccount(key) });
const address = "0x432960e720542c0EAB68f76a4274fBf972A19a31";
const original =
  "https://api.crossref.org/v1/works?filter=doi:10.11607/prd.476&rows=1&select=DOI,title,publisher,issued,type";
const notice =
  "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=29940049&rettype=abstract&retmode=text";
const operations = correction
  ? [
      {
        method: "register_source",
        args: [
          "mri-study-20261004",
          "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=30904949&rettype=abstract&retmode=text",
          "NCBI publication record of the original MRI study",
        ],
      },
      {
        method: "register_decision",
        args: [
          "mri-grant-review",
          "Synthetic research grant authorization to rely on diagnostic performance estimates and confidence intervals in DOI 10.1007/s00234-019-02198-w for evidence review.",
          '["mri-study-20261004"]',
          "[]",
        ],
      },
      {
        method: "register_decision",
        args: [
          "mri-grant-followup",
          "Synthetic downstream research grant authorization dependent on mri-grant-review remaining active.",
          "[]",
          '["mri-grant-review"]',
        ],
      },
      {
        method: "submit_notice",
        args: [
          "mri-study-20261004",
          1n,
          '["https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=31011771&rettype=abstract&retmode=text"]',
        ],
      },
    ]
  : [
      {
        method: "register_source",
        args: [
          "grant-study-20261004",
          original,
          "Published clinical study; synthetic grant fixture",
        ],
      },
      {
        method: "register_decision",
        args: [
          "grant-policy-review",
          "Synthetic research grant authorization to use COPE retraction guidelines for reviewing published evidence and deciding when evidence should be retracted.",
          '["grant-study-20261004"]',
          "[]",
        ],
      },
      {
        method: "register_decision",
        args: [
          "grant-release-review",
          "Synthetic research grant authorization for further evidence governance review, dependent on grant-policy-review remaining active.",
          "[]",
          '["grant-policy-review"]',
        ],
      },
      {
        method: "submit_notice",
        args: ["grant-study-20261004", 1n, JSON.stringify([notice])],
      },
      {
        method: "reassess_decision",
        args: ["grant-policy-review", 1n, '["report-unrelated"]', "[]"],
      },
    ];
let record;
try {
  record = JSON.parse(await fs.readFile(recordPath, "utf8"));
} catch {
  record = {
    release_date: "2026-10-04",
    network: "GenLayer StudioNet",
    chain_id: 61999,
    contract: address,
    actor: client.account.address,
    fixture:
      "Synthetic grant authorizations with authentic Crossref and NCBI publications. Original historical records are preserved.",
    operations: [],
  };
}
const save = () =>
  fs.writeFile(
    recordPath,
    JSON.stringify(
      redact(record),
      (_, v) => (typeof v === "bigint" ? v.toString() : v),
      2,
    ) + "\n",
  );
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < operations.length; i++) {
  const op = operations[i];
  let entry = record.operations[i];
  if (!entry) {
    const hash = await client.writeContract({
      address,
      functionName: op.method,
      args: op.args,
      value: 0n,
    });
    entry = {
      method: op.method,
      args: op.args,
      hash,
      submitted_at: new Date().toISOString(),
    };
    record.operations.push(entry);
    await save();
    console.log(
      JSON.stringify({ event: "submitted", method: op.method, hash }),
    );
  }
  let receipt,
    finalized = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    receipt = await client.getTransaction({ hash: entry.hash });
    entry.status = receipt.statusName;
    entry.execution =
      receipt.consensus_data?.leader_receipt?.[0]?.execution_result ??
      receipt.txExecutionResultName;
    entry.result_code =
      receipt.consensus_data?.leader_receipt?.[0]?.result?.status;
    entry.receipt = receipt;
    await save();
    if (entry.status === "FINALIZED") {
      finalized = true;
      break;
    }
    console.log(
      JSON.stringify({
        event: "pending",
        method: entry.method,
        hash: entry.hash,
        status: entry.status,
        attempt,
      }),
    );
    await pause(20000);
  }
  if (!finalized)
    throw new Error(
      "Polling bounded out. Rerun to resume the same transaction, never resubmit it.",
    );
  console.log(
    JSON.stringify({
      event: "finalized",
      method: entry.method,
      hash: entry.hash,
      status: entry.status,
      execution: entry.execution,
      result_code: entry.result_code,
    }),
  );
  if (
    entry.execution !== "SUCCESS" &&
    entry.execution !== "FINISHED_WITH_RETURN"
  )
    throw new Error(
      "Finalized execution did not succeed; inspect the recorded receipt.",
    );
  const read = (functionName, args) =>
    client.readContract({
      address,
      functionName,
      args,
      jsonSafeReturn: true,
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
    });
  entry.readback = await read(
    op.method === "register_source" || op.method === "submit_notice"
      ? "get_source"
      : "get_decision",
    [String(op.args[0])],
  );
  if (op.method === "submit_notice") {
    record.after_notice = {
      parent: await read("get_decision", [
        correction ? "mri-grant-review" : "grant-policy-review",
      ]),
      child: await read("get_decision", [
        correction ? "mri-grant-followup" : "grant-release-review",
      ]),
      independent: await read("get_decision", ["decision-c"]),
      notice: await read("get_notice", [correction ? "N-000003" : "N-000002"]),
    };
    record.expected_finding = correction ? "MATERIAL_CORRECTION" : "RETRACTION";
    record.scenario_passed =
      record.after_notice.notice.finding === record.expected_finding &&
      !record.after_notice.parent.authorization_enabled &&
      !record.after_notice.child.authorization_enabled &&
      record.after_notice.independent.authorization_enabled;
    await save();
    if (!record.scenario_passed)
      throw new Error(
        "Publication-change scenario did not produce the expected state; inspect the stored finding.",
      );
  }
  if (op.method === "reassess_decision") {
    record.after_recovery = {
      parent: entry.readback,
      child: await read("get_decision", ["grant-release-review"]),
      independent: await read("get_decision", ["decision-c"]),
      history: await read("get_history", []),
    };
    record.successful_owner_recovery =
      entry.readback.authorization_enabled && entry.readback.version === 2;
    record.child_stays_blocked =
      !record.after_recovery.child.authorization_enabled;
    record.completed_at = new Date().toISOString();
  }
  await save();
  await pause(1500);
}
console.log(
  JSON.stringify({
    successful_owner_recovery: record.successful_owner_recovery,
    child_stays_blocked: record.child_stays_blocked,
  }),
);
