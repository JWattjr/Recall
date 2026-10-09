import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionHashVariant } from "genlayer-js/types";
import { CONTRACT } from "./case";
import { transactionPhase, type Tx } from "./model";
export const readClient = () => createClient({ chain: studionet });
export async function readRecord(kind: "source" | "decision", id: string) {
  return readClient().readContract({
    address: CONTRACT,
    functionName: "get_" + kind,
    args: [id],
    jsonSafeReturn: true,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}
export async function readTransaction(hash: `0x${string}`) {
  const client = readClient();
  const receipt = await client.getTransaction({
    hash: hash as Parameters<typeof client.getTransaction>[0]["hash"],
  });
  const status = receipt.statusName ?? String(receipt.status ?? "UNKNOWN");
  const leader = receipt.consensus_data?.leader_receipt?.[0];
  const execution =
    receipt.txExecutionResultName ?? leader?.execution_result ?? "UNKNOWN";
  const result = leader?.result as unknown as { status?: string } | undefined;
  const normalized =
    result?.status === "rollback"
      ? "ROLLBACK"
      : execution === "FINISHED_WITH_RETURN"
        ? "SUCCESS"
        : execution;
  const readable = (leader?.result as unknown as { payload?: { readable?: string } })?.payload?.readable;
  const noticeId = result?.status === "return" ? readable?.match(/"notice_id":"([^"]+)"/)?.[1] : undefined;
  return {
    ...(noticeId ? { expectedNoticeId: noticeId } : {}),
    status,
    execution,
    phase: transactionPhase(status, normalized, receipt.resultName ?? receipt.result),
    receipt: {
      hash: receipt.hash,
      status,
      execution,
      consensus: receipt.resultName ?? receipt.result,
      leader: leader
        ? {
            vote: leader.vote,
            execution_result: leader.execution_result,
            result: leader.result,
          }
        : undefined,
    },
  };
}
export async function fetchLive(
  sourceIds: string[],
  decisionIds: string[],
  fresh = false,
) {
  const query = new URLSearchParams({
    sources: sourceIds.join(","),
    decisions: decisionIds.join(","),
    fresh: fresh ? "1" : "0",
  });
  const r = await fetch("/api/case?" + query, { cache: "no-store" });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error);
  return result;
}
export async function pollTransaction(tx: Tx): Promise<Tx> {
  const r = await fetch("/api/transaction/" + tx.hash, { cache: "no-store" });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error);
  return { ...tx, ...result };
}
export async function fetchRecords(
  sourceIds: string[], decisionIds: string[], notices = false, history = false,
) {
  const query = new URLSearchParams({
    scope: "records", fresh: "1", sources: sourceIds.join(","),
    decisions: decisionIds.join(","), notices: notices ? "1" : "0", history: history ? "1" : "0",
  });
  const response = await fetch("/api/case?" + query, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
export type Provider = {
  request: (args: {
    method: string;
    params?: unknown[] | object;
  }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
};
declare global {
  interface Window {
    ethereum?: Provider;
  }
}
export async function connectWallet() {
  if (!window.ethereum)
    throw new Error(
      "Install an EIP-1193 wallet such as MetaMask, then connect on StudioNet.",
    );
  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];
  if (!accounts[0]) throw new Error("No wallet account was selected.");
  await ensureNetwork();
  return accounts[0] as `0x${string}`;
}
export async function ensureNetwork() {
  const provider = window.ethereum;
  if (!provider) throw new Error("Wallet unavailable.");
  const chain = await provider.request({ method: "eth_chainId" });
  if (String(chain).toLowerCase() !== "0x" + studionet.id.toString(16)) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + studionet.id.toString(16) }],
      });
    } catch (e) {
      if ((e as { code?: number }).code !== 4902) throw e;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x" + studionet.id.toString(16),
            chainName: studionet.name,
            nativeCurrency: studionet.nativeCurrency,
            rpcUrls: [studionet.rpcUrls.default.http[0]],
          },
        ],
      });
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + studionet.id.toString(16) }],
      });
    }
  }
  const actual = await provider.request({ method: "eth_chainId" });
  if (String(actual).toLowerCase() !== "0x" + studionet.id.toString(16))
    throw new Error(
      "Switch the wallet to StudioNet, chain 61999, before signing.",
    );
}
export async function submitWrite(
  account: `0x${string}`,
  method: Tx["method"],
  args: (string | number)[],
) {
  await ensureNetwork();
  const current = (await window.ethereum!.request({
    method: "eth_accounts",
  })) as string[];
  if (current[0]?.toLowerCase() !== account.toLowerCase())
    throw new Error("Wallet account changed. Reconnect before signing.");
  const client = createClient({
    chain: studionet,
    account,
    provider: window.ethereum as NonNullable<
      Parameters<typeof createClient>[0]
    >["provider"],
  });
  const hash: unknown = await client.writeContract({
    address: CONTRACT,
    functionName: method,
    args: args.map((v) => (typeof v === "number" ? BigInt(v) : v)),
    value: 0n,
  });
  if (typeof hash !== "string" || !/^0x[0-9a-f]{64}$/i.test(hash))
    throw new Error(
      "The wallet returned no valid GenLayer transaction ID. Inspect the wallet before retrying.",
    );
  return hash;
}
