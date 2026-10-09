import { type Case, type WriteMethod } from "./model";

// Pre-sign checks need the target and declared parents, not the entire graph.
export function writeReadIds(method: WriteMethod, args: (string | number)[], recordId = String(args[0])) {
  const sourceTarget = method !== "register_decision" && method !== "reassess_decision";
  const parents = method === "register_decision" || method === "reassess_decision";
  return {
    sources: [...new Set([
      ...(sourceTarget ? [recordId] : []),
      ...(parents ? JSON.parse(String(args[2])) as string[] : []),
    ])],
    decisions: [...new Set([
      ...(!sourceTarget ? [String(args[0])] : []),
      ...(parents ? JSON.parse(String(args[3])) as string[] : []),
    ])],
    notices: method === "submit_notice" || method === "contest_notice",
  };
}

// A partial read must preserve unrelated records and proof already in the workspace.
export function mergeRecords(previous: Case, patch: Case): Case {
  const merge = <T>(old: T[], incoming: T[], key: (row: T) => string): T[] =>
    [...new Map([...old, ...incoming].map(row => [key(row), row])).values()];
  return {
    sources: merge(previous.sources, patch.sources, row => row.source_id),
    decisions: merge(previous.decisions, patch.decisions, row => row.decision_id),
    notices: merge(previous.notices, patch.notices, row => row.notice_id),
    history: patch.history.length ? patch.history : previous.history,
  };
}
