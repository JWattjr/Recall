export type Source = {
  source_id: string;
  publisher_label: string;
  registered_by: string;
  source_identifier?: string;
  notice_hosts?: string[];
  reporters?: string[];
  uncertain_count?: number;
  notice_ids?: string[];
  version: number;
  status: string;
  current_refs: string[];
  versions: {
    version: number;
    status: string;
    references: string[];
    notice_id?: string;
  }[];
};
export type Decision = {
  decision_id: string;
  owner: string;
  purpose: string;
  sequence: number;
  version: number;
  status: string;
  authorization_enabled: boolean;
  dependencies: string[];
  parent_versions: { parent_key: string; version: number }[];
  blocked_by_source?: string;
  blocked_by_notice?: string;
  last_validity: string;
  last_snapshot_digest: string;
  last_evidence_digest?: string;
  last_citations?: string[];
};
export type Notice = {
  notice_id: string;
  source_id: string;
  base_version: number;
  finding: string;
  citations: string[];
  references: string[];
  affected_decisions: string[];
  evidence_digest: string;
  snapshot_digest: string;
  input_snapshot_digest: string;
  submitted_by: string;
  status?: string;
  contest_until?: number;
  contest?: { finding: string; contested_at: number; restored_decisions: string[] };
  source_identifier?: string;
  authorized_hosts?: string[];
  identifier_match?: boolean;
};
export type Case = {
  sources: Source[];
  decisions: Decision[];
  notices: Notice[];
  history: Record<string, unknown>[];
};
export type Mode = "recorded" | "live" | "rehearsal";
export type WriteMethod =
  | "register_source"
  | "register_decision"
  | "submit_notice"
  | "reassess_decision"
  | "authorize_reporter"
  | "revoke_reporter"
  | "reset_uncertain_counter"
  | "contest_notice";
export type Tx = {
  hash: string;
  method: WriteMethod;
  recordId: string;
  createdAt: string;
  status: string;
  execution: string;
  phase:
    | "submitted"
    | "pending"
    | "provisional"
    | "success"
    | "error"
    | "rollback"
    | "stalled";
  readback?: unknown;
  expectedVersion?: number;
  expectedNoticeId?: string;
  expectedReporter?: string;
  readbackVerified?: boolean;
  error?: string;
};
export function verifyWriteReadback(tx: Tx, data: Case): boolean {
  if (tx.method === "contest_notice") return data.notices.some(n => n.notice_id === tx.expectedNoticeId && !!n.contest);
  if (tx.method === "authorize_reporter" || tx.method === "revoke_reporter") {
    const source = data.sources.find(s => s.source_id === tx.recordId);
    if (!source || !tx.expectedReporter) return false;
    return (source.reporters ?? []).includes(tx.expectedReporter.toLowerCase()) === (tx.method === "authorize_reporter");
  }
  if (tx.method === "reset_uncertain_counter") return data.sources.some(s => s.source_id === tx.recordId && s.uncertain_count === 0);
  if (tx.method === "register_source")
    return data.sources.some((s) => s.source_id === tx.recordId);
  if (tx.method === "register_decision")
    return data.decisions.some((d) => d.decision_id === tx.recordId);
  if (tx.method === "submit_notice")
    return data.notices.some(
      (n) =>
        n.notice_id === tx.expectedNoticeId &&
        n.source_id === tx.recordId &&
        n.base_version === tx.expectedVersion,
    );
  return (
    tx.expectedVersion !== undefined &&
    data.decisions.some(
      (d) =>
        d.decision_id === tx.recordId && d.version === tx.expectedVersion! + 1,
    )
  );
}
export function descendants(data: Case, key: string): string[] {
  const seen = new Set<string>();
  const queue = [key];
  for (let i = 0; i < queue.length; i++) {
    for (const d of data.decisions) {
      const k = "D:" + d.decision_id;
      if (d.dependencies.includes(queue[i]) && !seen.has(k)) {
        seen.add(k);
        queue.push(k);
      }
    }
  }
  return [...seen];
}
export function transactionPhase(
  status: string,
  execution: string,
  consensus?: string | number,
): Tx["phase"] {
  const s = status.toUpperCase(),
    e = execution.toUpperCase();
  if (s === "FINALIZED") {
    if (consensus != null && !["6", "MAJORITY_AGREE", "SUCCESS"].includes(String(consensus))) return "error";
    if (e === "SUCCESS") return "success";
    if (e === "ROLLBACK") return "rollback";
    return "error";
  }
  if (s === "CANCELED") return "error";
  if (s === "ACCEPTED" || s === "READY_TO_FINALIZE") return "provisional";
  return "pending";
}
export function validateIds(ids: string[]): void {
  if (
    ids.length > 4 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$/.test(id))
  )
    throw new Error("Choose at most four unique IDs of each dependency kind.");
}
export function validateReference(value: string): void {
  if (value.length > 500 || /\s/.test(value) || !value.startsWith("https://"))
    throw new Error("Use an HTTPS URL of at most 500 characters.");
  const u = new URL(value);
  if (
    u.username ||
    u.password ||
    (u.port && u.port !== "443") ||
    !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname) ||
    u.hostname.endsWith(".local") ||
    u.hostname.endsWith(".internal") ||
    u.hostname.endsWith(".localhost")
  )
    throw new Error("Use a public DNS hostname with the default HTTPS port.");
}
export function humanError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (/stale/i.test(raw))
    return "The record changed. Refresh live state and review the current version before submitting again.";
  if (/429|32429|rate.limit/i.test(raw))
    return "StudioNet is rate limited. Wait before retrying this read. If you have a transaction ID, check that existing ID instead of resubmitting.";
  if (/LIMIT|capacity|registry is full|history is full/i.test(raw))
    return "The bounded registry or version history is full. Use another independently deployed registry.";
  if (/rejected|denied|4001/i.test(raw))
    return "Wallet signing was declined. No new transaction was submitted.";
  if (/consensus|LLM_ERROR|UNDETERMINED/i.test(raw))
    return "The judgment could not complete. Inspect the transaction before considering another submission.";
  return raw.slice(0, 700);
}
