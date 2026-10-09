import { NextResponse } from "next/server";
import { noticeReference, originalReference } from "@/lib/case";
let cached: { expires: number; data: unknown } | undefined;
export async function GET() {
  if (cached && cached.expires > Date.now())
    return NextResponse.json(cached.data);
  const documents = [];
  for (const url of [originalReference, noticeReference]) {
    try {
      const retrieve = () => fetch(url, {
        signal: AbortSignal.timeout(12000),
        redirect: "manual",
        cache: "no-store",
      });
      let r = await retrieve();
      if (r.status === 429 || (r.status >= 500 && r.status <= 599)) {
        await r.body?.cancel();
        r = await retrieve();
      }
      if (r.status !== 200) {
        documents.push({
          url,
          status: r.status,
          available: false,
          reason:
            "Publication did not return HTTP 200. Redirects are not followed by this preflight.",
        });
        continue;
      }
      const reader = r.body?.getReader();
      const chunks: Uint8Array[] = [];
      let bytes = 0;
      if (!reader) throw new Error("No response body");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 20000) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
      if (bytes > 20000)
        throw new Error(
          "Publication exceeds the contract limit of 20,000 bytes.",
        );
      const all = new Uint8Array(bytes);
      let offset = 0;
      for (const chunk of chunks) {
        all.set(chunk, offset);
        offset += chunk.length;
      }
      const text = new TextDecoder("utf-8", { fatal: true }).decode(all);
      documents.push({
        url,
        status: r.status,
        bytes,
        available: !!text.trim(),
        text,
      });
    } catch (e) {
      documents.push({
        url,
        available: false,
        reason: e instanceof Error ? e.message : String(e),
      });
    }
  }
  const data = {
    checkedAt: new Date().toISOString(),
    origin:
      "Off-chain preflight; validators independently fetch and judge publications.",
    documents,
    ready: documents.every((d) => d.available),
  };
  cached = { expires: Date.now() + 60000, data };
  return NextResponse.json(data);
}
