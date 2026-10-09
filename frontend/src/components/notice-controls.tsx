"use client";
import { useEffect, useState } from "react";
import { humanError, validateReference, type Case, type Mode, type WriteMethod } from "@/lib/model";

export function NoticeControls({data, mode, wallet, busy, write}: {
  data: Case; mode: Mode; wallet?: string; busy: boolean;
  write: (method: WriteMethod, args: (string | number)[], recordId: string) => Promise<void>;
}) {
  const [sourceId, setSourceId] = useState(data.sources[0]?.source_id ?? "");
  const [reporter, setReporter] = useState("");
  const [noticeId, setNoticeId] = useState(data.notices[0]?.notice_id ?? "");
  const [refs, setRefs] = useState("");
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const source = data.sources.find(s => s.source_id === sourceId) ?? data.sources[0];
  const managedSourceId = source?.source_id ?? "";
  const eligibleNotices = data.notices.filter(n => n.contest_until);
  const notice = eligibleNotices.find(n => n.notice_id === noticeId) ?? eligibleNotices[0];
  const noticeSource = data.sources.find(s => s.source_id === notice?.source_id);
  const owns = (owner?: string) => !!wallet && owner?.toLowerCase() === wallet.toLowerCase();
  const canManage = mode === "live" && owns(source?.registered_by) && !busy;
  const seconds = now ? Math.max(0, Math.floor((notice?.contest_until ?? 0) - now / 1000)) : 0;
  const canContest = mode === "live" && owns(noticeSource?.registered_by) && seconds > 0 && !notice?.contest && notice?.status !== "OVERTURNED" && !busy;
  async function manage(method: "authorize_reporter" | "revoke_reporter" | "reset_uncertain_counter") {
    setError("");
    try {
      if (!canManage) throw new Error("Connect the source registrant's wallet in Live network.");
      if (method !== "reset_uncertain_counter" && (!/^0x[0-9a-f]{40}$/i.test(reporter) || /^0x0{40}$/i.test(reporter))) throw new Error("Enter a nonzero 20-byte reporter address.");
      await write(method, method === "reset_uncertain_counter" ? [managedSourceId] : [managedSourceId, reporter], managedSourceId);
    } catch (e) { setError(humanError(e)); }
  }
  async function contest() {
    setError("");
    try {
      if (!canContest || !notice || !noticeSource) throw new Error("Only the registrant may contest once, within 72 hours.");
      const urls = refs.split(/\n/).map(s => s.trim()).filter(Boolean);
      if (!urls.length || urls.length > 3 || new Set(urls).size !== urls.length) throw new Error("Provide 1–3 unique counter-evidence URLs, one per line.");
      for (const url of urls) {
        validateReference(url);
        if (!noticeSource.notice_hosts?.includes(new URL(url).hostname.toLowerCase())) throw new Error("Counter-evidence host is not authorized for this source.");
      }
      await write("contest_notice", [notice.notice_id, JSON.stringify(urls)], notice.source_id);
    } catch (e) { setError(humanError(e)); }
  }
  return <section className="action-form">
    <h2>Reporter authorization</h2>
    <p>The source registrant controls who may report notices. Limits apply before validator work.</p>
    <label htmlFor="managed-source">Managed source</label>
    <select id="managed-source" value={managedSourceId} onChange={e => setSourceId(e.target.value)}>{data.sources.map(s => <option key={s.source_id}>{s.source_id}</option>)}</select>
    <p>Identifier: {source?.source_identifier ?? "Historical record"}. Allowed hosts: {source?.notice_hosts?.join(", ") ?? "Historical record"}.</p>
    <p>Uncertain notices this version: {source?.uncertain_count ?? 0}/2. Stored notices: {source?.notice_ids?.length ?? 0}/16.</p>
    <p>Authorized reporters: {source?.reporters?.join(", ") || "Registrant only"}.</p>
    <label htmlFor="reporter-address">Reporter address</label>
    <input id="reporter-address" value={reporter} onChange={e => setReporter(e.target.value)} placeholder="0x…" />
    <button className="secondary" type="button" disabled={!canManage} onClick={() => void manage("authorize_reporter")}>Authorize reporter</button>{" "}
    <button className="secondary" type="button" disabled={!canManage} onClick={() => void manage("revoke_reporter")}>Revoke reporter</button>{" "}
    <button className="secondary" type="button" disabled={!canManage} onClick={() => void manage("reset_uncertain_counter")}>Reset uncertainty counter</button>
    <h2>Contest notice</h2>
    <p>Blocks apply immediately. Within 72 hours the registrant may supply publisher counter-evidence once. Overturning preserves history and never overrides a later owner review or another notice.</p>
    <label htmlFor="contested-notice">Consequential notice</label>
    <select id="contested-notice" value={notice?.notice_id ?? ""} onChange={e => setNoticeId(e.target.value)}>{eligibleNotices.map(n => <option key={n.notice_id} value={n.notice_id}>{n.notice_id} · {n.status} · {n.source_id}</option>)}</select>
    <p aria-live="off">{notice?.contest ? `Contest recorded: ${notice.contest.finding}` : seconds ? `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m ${seconds % 60}s remaining` : "Contest window closed"}</p>
    <label htmlFor="counter-evidence">Counter-evidence URLs</label>
    <textarea id="counter-evidence" value={refs} onChange={e => setRefs(e.target.value)} placeholder="One authorized-host HTTPS URL per line" />
    <button className="primary" type="button" disabled={!canContest} onClick={() => void contest()}>Sign contest notice</button>
    <p className="form-help">After the window, a retracted source accepts only a publisher reversal that passes the provenance checks through Submit notice. Host and identifier checks are not cryptographic publisher signatures. No live overturn is claimed; this path is covered by direct tests.</p>
    {error && <p className="alert error" role="alert">{error}</p>}
  </section>;
}
