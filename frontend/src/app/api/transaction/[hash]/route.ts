import { NextResponse } from "next/server";
import { readTransaction } from "@/lib/network";
const cache = new Map<string, { expires: number; result: unknown }>();
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params;
  if (!/^0x[0-9a-f]{64}$/i.test(hash))
    return NextResponse.json(
      { error: "Invalid transaction identifier." },
      { status: 400 },
    );
  try {
    const old = cache.get(hash);
    if (old && old.expires > Date.now()) return NextResponse.json(old.result);
    const result = await readTransaction(hash as `0x${string}`);
    if (cache.size > 100) cache.clear();
    cache.set(hash, { expires: Date.now() + 15000, result });
    return NextResponse.json(
      JSON.parse(
        JSON.stringify(result, (_, v) =>
          typeof v === "bigint" ? v.toString() : v,
        ),
      ),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 503 },
    );
  }
}
