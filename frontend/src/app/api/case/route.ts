import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { readClient } from "@/lib/network";
import { CONTRACT, caseManifest, CODE_SHA256 } from "@/lib/case";
import { TransactionHashVariant } from "genlayer-js/types";
import { contractReadReason } from "@/lib/rpc-error";
export const runtime = "nodejs";
let cache: { key: string; expires: number; result: unknown } | undefined;
let alignment: { expires: number; valid: boolean } | undefined;
export const maxDuration = 60;
function ids(value: string | null, defaults: string[], max: number) {
  const output = [
    ...new Set([...defaults, ...(value?.split(",").filter(Boolean) ?? [])]),
  ];
  if (
    output.length > max ||
    output.some((x) => !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$/.test(x))
  )
    throw new Error("Invalid bounded manifest.");
  return output;
}
export async function GET(request: NextRequest) {
  try {
    const sources = ids(
        request.nextUrl.searchParams.get("sources"),
        caseManifest.sourceIds,
        12,
      ),
      decisions = ids(
        request.nextUrl.searchParams.get("decisions"),
        caseManifest.decisionIds,
        24,
      );
    const key = JSON.stringify([sources, decisions]);
    if (
      request.nextUrl.searchParams.get("fresh") !== "1" &&
      cache?.key === key &&
      cache.expires > Date.now()
    )
      return NextResponse.json(cache.result);
    const client = readClient();
    if (!alignment || alignment.expires < Date.now()) {
      const code = await client.getContractCode(CONTRACT);
      alignment = {
        expires: Date.now() + 300000,
        valid:
          createHash("sha256")
            .update(code.replaceAll("\r\n", "\n").trimEnd())
            .digest("hex") === CODE_SHA256,
      };
    }
    if (!alignment.valid)
      throw new Error(
        "The deployed code no longer matches this release. Wallet writes are disabled until alignment is verified.",
      );
    const read = (functionName: string, args: string[]) =>
      client.readContract({
        address: CONTRACT,
        functionName,
        args,
        jsonSafeReturn: true,
        transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
      });
    const sourceRows = [],
      decisionRows = [],
      errors = [];
    for (const id of sources) {
      try {
        sourceRows.push(await read("get_source", [id]));
      } catch (e) {
        errors.push({ id, error: contractReadReason(e) });
      }
    }
    for (const id of decisions) {
      try {
        decisionRows.push(await read("get_decision", [id]));
      } catch (e) {
        errors.push({ id, error: contractReadReason(e) });
      }
    }
    const notices = [];
    for (let index = 1; index <= 16; index++) {
      try {
        notices.push(
          await read("get_notice", ["N-" + String(index).padStart(6, "0")]),
        );
      } catch (e) {
        if (/\[NOT_FOUND\]/.test(contractReadReason(e))) break;
        throw e;
      }
    }
    const history = (await read("get_history", [])) as {
      reassessments: unknown[];
    };
    const result = {
      checkedAt: new Date().toISOString(),
      contract: CONTRACT,
      chainId: 61999,
      boundary:
        "Explicit case manifest and locally tracked IDs; no global enumeration. Notice IDs are sequential and bounded; this read scans them until the first missing ID.",
      data: {
        sources: sourceRows,
        decisions: decisionRows,
        notices,
        history: history.reassessments,
      },
      errors,
    };
    if (!sourceRows.length || !decisionRows.length)
      throw new Error("The case could not be read from StudioNet.");
    cache = { key, expires: Date.now() + 30000, result };
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}
