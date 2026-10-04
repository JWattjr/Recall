"use client";
import releaseProof from "@/data/release-proof.json";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  GitBranch,
  History,
  Info,
  Layers,
  List,
  LoaderCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShieldOff,
  Wallet,
  X,
} from "lucide-react";
import { Graph } from "./graph";
import {
  CONTRACT,
  CHAIN_ID,
  REPOSITORY,
  caseManifest,
  recorded,
  recordedTransactions,
  labels,
  noticeReference,
  originalReference,
  rehearsalCase,
} from "@/lib/case";
import {
  connectWallet,
  fetchLive,
  pollTransaction,
  submitWrite,
} from "@/lib/network";
import {
  descendants,
  humanError,
  validateIds,
  validateReference,
  verifyWriteReadback,
  type Case,
  type Mode,
  type Tx,
  type WriteMethod,
  type Source,
  type Decision,
} from "@/lib/model";
type Preflight = {
  checkedAt: string;
  ready: boolean;
  documents: {
    url: string;
    available: boolean;
    text?: string;
    bytes?: number;
    status?: number;
    reason?: string;
  }[];
};
const terminal = (t: Tx) => ["success", "error", "rollback"].includes(t.phase);
const short = (s: string) => s.slice(0, 6) + "…" + s.slice(-4);
const timestamp = (s: string) =>
  new Date(s).toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
function CopyId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copy-id"
      title={"Copy " + value}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      <code>{value}</code>
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
export function Workspace() {
  const [mode, setMode] = useState<Mode>("recorded"),
    [data, setData] = useState<Case>(recorded),
    [selected, setSelected] = useState("S:report-a"),
    [section, setSection] = useState<
      "case" | "register" | "notice" | "reassess" | "proof" | "about"
    >("case"),
    [list, setList] = useState(false),
    [wallet, setWallet] = useState<`0x${string}`>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [checkedAt, setCheckedAt] = useState(""),
    [txs, setTxs] = useState<Tx[]>([]),
    [tracked, setTracked] = useState({
      sources: caseManifest.sourceIds,
      decisions: caseManifest.decisionIds,
    }),
    [preflight, setPreflight] = useState<Preflight>(),
    [inspectId, setInspectId] = useState(""),
    [inspectKind, setInspectKind] = useState<"source" | "decision">("source");
  const lock = useRef(false),
    mounted = useRef(false),
    txRef = useRef(txs),
    modeRef = useRef(mode),
    trackedRef = useRef(tracked);
  txRef.current = txs;
  modeRef.current = mode;
  trackedRef.current = tracked;
  const [pollRun, setPollRun] = useState(0);
  const currentKey = selected.startsWith("S:");
  const record = currentKey
    ? data.sources.find((s) => "S:" + s.source_id === selected)
    : data.decisions.find((d) => "D:" + d.decision_id === selected);
  const affected = descendants(data, selected);
  function changeSection(value: typeof section) {
    setSection(value);
    setError("");
    setMessage("");
  }
  function changeMode(value: Mode) {
    setMode(value);
    setError("");
    setMessage("");
    if (value === "recorded") {
      setData(recorded);
      setCheckedAt("");
    }
    if (value === "rehearsal") {
      setData(rehearsalCase());
      setCheckedAt("");
    }
    if (value === "live") {
      setData(recorded);
      setCheckedAt("");
      void refresh();
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const r = await fetchLive(
        trackedRef.current.sources,
        trackedRef.current.decisions,
      );
      setData(r.data);
      setCheckedAt(r.checkedAt);
      if (r.errors.length)
        setError(
          "Some tracked records could not be read: " +
            r.errors.map((e: { id: string }) => e.id).join(", "),
        );
      return r.data as Case;
    } catch (e) {
      setError(humanError(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    mounted.current = true;
    try {
      const stored = JSON.parse(
        localStorage.getItem("recall-transactions-v1") ?? "[]",
      ) as Tx[];
      setTxs(stored.filter((t) => /^0x[0-9a-f]{64}$/i.test(t.hash)).slice(-20));
      const t = JSON.parse(
        localStorage.getItem("recall-manifest-v1") ?? "null",
      );
      if (t?.sources && t?.decisions) setTracked(t);
    } catch {
      setError(
        "Saved browser records could not be loaded. The recorded case is still available.",
      );
    }
    const provider = window.ethereum;
    const changed = () => {
      setWallet(undefined);
      setMessage(
        "Wallet account or network changed. Reconnect before signing.",
      );
    };
    provider?.on?.("accountsChanged", changed);
    provider?.on?.("chainChanged", changed);
    return () => {
      provider?.removeListener?.("accountsChanged", changed);
      provider?.removeListener?.("chainChanged", changed);
    };
  }, []);
  useEffect(() => {
    if (mounted.current) {
      try {
        localStorage.setItem("recall-transactions-v1", JSON.stringify(txs));
      } catch {
        setError(
          "Browser storage is unavailable. Copy submitted transaction IDs before leaving this page.",
        );
      }
    }
  }, [txs]);
  useEffect(() => {
    if (mounted.current) {
      try {
        localStorage.setItem("recall-manifest-v1", JSON.stringify(tracked));
      } catch {
        /* The manifest remains in memory. */
      }
    }
  }, [tracked]);
  useEffect(() => {
    let canceled = false;
    let timeout: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function tick() {
      const pending = txRef.current.filter((t) => !terminal(t));
      if (pending.length && attempts < 40) {
        const tx = pending[0];
        try {
          let result = await pollTransaction(tx);
          if (result.phase === "success") {
            const live = await fetchLive(
              trackedRef.current.sources,
              trackedRef.current.decisions,
              true,
            );
            const rows =
              result.method === "register_source"
                ? live.data.sources
                : live.data.decisions;
            result = {
              ...result,
              readback:
                rows.find(
                  (r: Source & Decision) =>
                    (r.source_id ?? r.decision_id) === result.recordId,
                ) ?? live.data,
            };
            result.readbackVerified = verifyWriteReadback(result, live.data);
            result.error = result.readbackVerified
              ? undefined
              : "Execution finalized successfully, but the expected record transition was not observed. Check this ID again; do not resubmit.";
            if (modeRef.current === "live") {
              setData(live.data);
              setCheckedAt(live.checkedAt);
            }
          }
          if (!canceled)
            setTxs((old) =>
              old.map((t) => (t.hash === result.hash ? result : t)),
            );
        } catch (e) {
          if (!canceled)
            setTxs((old) =>
              old.map((t) =>
                t.hash === tx.hash ? { ...t, error: humanError(e) } : t,
              ),
            );
        }
        attempts++;
      } else if (attempts >= 40 && pending.length) {
        setTxs((old) =>
          old.map((t) =>
            !terminal(t)
              ? {
                  ...t,
                  phase: "stalled",
                  error:
                    "Polling paused after 40 checks. Resume checking this ID; confirmation time is not guaranteed.",
                }
              : t,
          ),
        );
        return;
      }
      if (!canceled) timeout = setTimeout(tick, 20000);
    }
    timeout = setTimeout(tick, 1500);
    return () => {
      canceled = true;
      clearTimeout(timeout);
    };
  }, [txs.length, pollRun]);
  async function connect() {
    setBusy(true);
    setError("");
    try {
      setWallet(await connectWallet());
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }
  function track(kind: "sources" | "decisions", id: string) {
    setTracked((old) => ({ ...old, [kind]: [...new Set([...old[kind], id])] }));
  }
  async function write(
    method: WriteMethod,
    args: (string | number)[],
    recordId: string,
  ) {
    if (lock.current || txRef.current.some((t) => !terminal(t)))
      throw new Error(
        "A transaction is still being tracked. Finish checking its result before submitting another.",
      );
    if (mode === "recorded")
      throw new Error(
        "Switch to live network or local rehearsal before changing records.",
      );
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "rehearsal") {
        rehearse(method, args);
        setMessage(
          "Local rehearsal updated. No transaction, wallet signature, or GenLayer judgment was created.",
        );
        return;
      }
      if (!wallet) throw new Error("Connect your wallet before submitting.");
      const fresh = await fetchLive(
        trackedRef.current.sources,
        trackedRef.current.decisions,
        true,
      );
      const d = fresh.data as Case;
      if (fresh.errors.length)
        throw new Error(
          "Some manifest records could not be read. Resolve the live read errors before signing.",
        );
      if (
        method === "register_source" &&
        (d.sources.some((s) => s.source_id === recordId) ||
          d.sources.length >= 12)
      )
        throw new Error(
          "Source ID exists or the known registry is full. Choose another unique ID.",
        );
      if (
        method === "register_decision" &&
        (d.decisions.some((p) => p.decision_id === recordId) ||
          d.decisions.length >= 24)
      )
        throw new Error(
          "Decision ID exists or the known registry is full. Choose another unique ID.",
        );
      if (method === "submit_notice" && d.notices.length >= 16)
        throw new Error("Notice registry is full.");
      if (
        method === "reassess_decision" &&
        (d.decisions.find((p) => p.decision_id === recordId)?.version ?? 0) >= 8
      )
        throw new Error("Decision version history is full.");
      if (method === "register_decision" || method === "reassess_decision") {
        const parents = [
          ...JSON.parse(String(args[2])).map((id: string) => ({
            kind: "source",
            id,
          })),
          ...JSON.parse(String(args[3])).map((id: string) => ({
            kind: "decision",
            id,
          })),
        ];
        for (const parent of parents) {
          const previous =
            parent.kind === "source"
              ? data.sources.find((s) => s.source_id === parent.id)
              : data.decisions.find((p) => p.decision_id === parent.id);
          const current =
            parent.kind === "source"
              ? d.sources.find((s) => s.source_id === parent.id)
              : d.decisions.find((p) => p.decision_id === parent.id);
          if (
            !previous ||
            !current ||
            previous.version !== current.version ||
            previous.status !== current.status
          ) {
            setData(d);
            setCheckedAt(fresh.checkedAt);
            throw new Error(
              "An upstream dependency changed. Review the refreshed current evidence before signing.",
            );
          }
        }
      }
      if (method === "submit_notice") {
        const s = d.sources.find((s) => s.source_id === recordId);
        if (!s || s.version !== args[1] || s.status === "RETRACTED")
          throw new Error(
            "The source is stale or retracted. Refresh and select its current version.",
          );
      }
      if (method === "reassess_decision") {
        const decision = d.decisions.find((d) => d.decision_id === recordId);
        if (
          !decision ||
          decision.version !== args[1] ||
          decision.status !== "BLOCKED_REASSESSMENT"
        )
          throw new Error(
            "Decision version is stale or it is no longer blocked.",
          );
        if (decision.owner.toLowerCase() !== wallet.toLowerCase())
          throw new Error("Only this decision’s owner can reassess it.");
      }
      const hash = await submitWrite(wallet, method, args);
      const tx: Tx = {
        hash,
        method,
        recordId,
        createdAt: new Date().toISOString(),
        status: "SUBMITTED",
        execution: "UNKNOWN",
        phase: "submitted",
        expectedVersion: typeof args[1] === "number" ? args[1] : undefined,
        expectedNoticeId:
          method === "submit_notice"
            ? "N-" + String(d.notices.length + 1).padStart(6, "0")
            : undefined,
      };
      const next = [...txRef.current, tx].slice(-20);
      setTxs(next);
      try {
        localStorage.setItem("recall-transactions-v1", JSON.stringify(next));
      } catch {
        setError(
          "Submitted successfully, but browser storage is unavailable. Copy this transaction ID now: " +
            hash,
        );
      }
      if (method === "register_source") track("sources", recordId);
      if (method === "register_decision") track("decisions", recordId);
      setMessage(
        "Submitted. Track the transaction below; acceptance is provisional.",
      );
    } catch (e) {
      setError(humanError(e));
      throw e;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function rehearse(method: WriteMethod, args: (string | number)[]) {
    const next = structuredClone(data);
    const id = String(args[0]);
    if (method === "register_source") {
      if (
        next.sources.length >= 12 ||
        next.sources.some((s) => s.source_id === id)
      )
        throw new Error(
          "Source ID already exists or the local registry is full.",
        );
      next.sources.push({
        source_id: id,
        publisher_label: String(args[2]),
        registered_by: "local-rehearsal-owner",
        version: 1,
        status: "ACTIVE",
        current_refs: [String(args[1])],
        versions: [
          { version: 1, status: "ACTIVE", references: [String(args[1])] },
        ],
      });
    }
    if (method === "register_decision") {
      if (
        next.decisions.length >= 24 ||
        next.decisions.some((d) => d.decision_id === id)
      )
        throw new Error(
          "Decision ID already exists or the local registry is full.",
        );
      const parents = [
        ...JSON.parse(String(args[2])).map((s: string) => "S:" + s),
        ...JSON.parse(String(args[3])).map((s: string) => "D:" + s),
      ];
      next.decisions.push({
        decision_id: id,
        purpose: String(args[1]),
        owner: "local-rehearsal-owner",
        sequence: Math.max(0, ...next.decisions.map((d) => d.sequence)) + 1,
        version: 1,
        status: "ACTIVE",
        authorization_enabled: true,
        dependencies: parents,
        parent_versions: parents.map((p: string) => ({
          parent_key: p,
          version: p.startsWith("S:")
            ? next.sources.find((s) => s.source_id === p.slice(2))!.version
            : next.decisions.find((d) => d.decision_id === p.slice(2))!.version,
        })),
        last_validity: "LOCAL_REHEARSAL",
        last_snapshot_digest: "",
      });
    }
    if (method === "submit_notice") {
      const source = next.sources.find((s) => s.source_id === id)!;
      if (source.status === "RETRACTED" || source.version !== args[1])
        throw new Error("Source version is stale or retracted.");
      const keys = descendants(next, "S:" + id);
      source.version++;
      source.status = "RETRACTED";
      source.current_refs = [];
      source.versions.push({
        version: source.version,
        status: "RETRACTED",
        references: [],
      });
      next.decisions = next.decisions.map((d) =>
        keys.includes("D:" + d.decision_id)
          ? {
              ...d,
              status: "BLOCKED_REASSESSMENT",
              authorization_enabled: false,
              blocked_by_source: id,
              blocked_by_notice: "local-rehearsal",
            }
          : d,
      );
    }
    if (method === "reassess_decision") {
      const decision = next.decisions.find((d) => d.decision_id === id)!;
      decision.version++;
      decision.status = "ACTIVE";
      decision.authorization_enabled = true;
      decision.dependencies = [
        ...JSON.parse(String(args[2])).map((s: string) => "S:" + s),
        ...JSON.parse(String(args[3])).map((s: string) => "D:" + s),
      ];
      decision.last_validity = "LOCAL_REHEARSAL_SUPPORTED";
      next.history.push({
        decision_id: id,
        version: decision.version,
        validity: "LOCAL_REHEARSAL_SUPPORTED",
        status: "ACTIVE",
      });
    }
    setData(next);
  }
  async function preflightNotice() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/preflight", { cache: "no-store" });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error);
      setPreflight(p);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }
  async function inspect() {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$/.test(inspectId)) {
      setError("Enter a valid source or decision ID.");
      return;
    }
    const next = {
      ...tracked,
      [inspectKind === "source" ? "sources" : "decisions"]: [
        ...new Set([
          ...tracked[inspectKind === "source" ? "sources" : "decisions"],
          inspectId,
        ]),
      ],
    };
    if (next.sources.length > 12 || next.decisions.length > 24) {
      setError(
        "This browser manifest reached its 12-source / 24-decision bound.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const live = await fetchLive(next.sources, next.decisions, true);
      if (live.errors.some((e: { id: string }) => e.id === inspectId))
        throw new Error(
          "That record was not readable. It was not saved to the manifest. Check its ID and try again.",
        );
      setTracked(next);
      trackedRef.current = next;
      setData(live.data);
      setCheckedAt(live.checkedAt);
      setSelected((inspectKind === "source" ? "S:" : "D:") + inspectId);
    } catch (e) {
      setError(humanError(e));
    } finally {
      setBusy(false);
    }
  }
  function exportProof() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            contract: CONTRACT,
            chainId: CHAIN_ID,
            mode,
            checkedAt,
            data,
            transactions: txs,
            historicalTransactions: recordedTransactions,
            scope:
              "Bounded case manifest; local rehearsal is not consensus proof.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recall-proof.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  const nav = [
    { key: "case", label: "Evidence workspace", icon: Layers },
    { key: "register", label: "Register & connect", icon: Plus },
    { key: "notice", label: "Submit a notice", icon: FileText },
    { key: "reassess", label: "Reassess decisions", icon: RotateCcw },
    { key: "proof", label: "Proof & history", icon: History },
    { key: "about", label: "How Recall works", icon: Info },
  ] as const;
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Recall home">
          <span className="brand-mark">
            <RotateCcw size={23} />
          </span>
          Recall<span className="brand-period">.</span>
        </a>
        <p className="brand-caption">
          Evidence changes.
          <br />
          Decisions follow.
        </p>
        <nav aria-label="Workspace navigation">
          {nav.map((n) => (
            <button
              key={n.key}
              className={section === n.key ? "nav-active" : ""}
              onClick={() => changeSection(n.key)}
              aria-current={section === n.key ? "page" : undefined}
            >
              <n.icon size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="network-dot" /> StudioNet{" "}
          <small>Hosted development · 61999</small>
          <a href={REPOSITORY} target="_blank" rel="noreferrer">
            View the implementation <ExternalLink size={13} />
          </a>
        </div>
      </aside>
      <div className="shell">
        <header className="topbar">
          <span>
            Research grants <ChevronRight size={14} /> Case 001
          </span>
          <button className="wallet-button" onClick={connect} disabled={busy}>
            <Wallet size={16} />
            {wallet ? short(wallet) : "Connect wallet"}
          </button>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <h1>
                {section === "case"
                  ? "When evidence changes."
                  : section === "register"
                    ? "Make the dependency explicit."
                    : section === "notice"
                      ? "Review a publication change."
                      : section === "reassess"
                        ? "Recovery requires a new review."
                        : section === "proof"
                          ? "A trail you can inspect."
                          : "Evidence is part of the decision."}
              </h1>
              <p>
                {section === "case"
                  ? "Trace what needs reviewing, and what can keep moving."
                  : section === "register"
                    ? "Register evidence, then freeze an authorization’s purpose and its parents."
                    : section === "notice"
                      ? "Independent validators read the publications. The registry applies the finding."
                      : section === "reassess"
                        ? "Only the decision owner can reassess against current evidence."
                        : section === "proof"
                          ? "Recorded execution, current state, and your submitted transactions."
                          : "Semantic review meets deterministic dependency tracking."}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Download proof manifest"
              onClick={exportProof}
            >
              <ArrowDownToLine size={19} />
            </button>
          </div>
          <div className="mode-bar">
            <div className="segmented" aria-label="Data provenance">
              {(["recorded", "live", "rehearsal"] as Mode[]).map((m) => (
                <button
                  key={m}
                  className={mode === m ? "selected" : ""}
                  aria-pressed={mode === m}
                  onClick={() => changeMode(m)}
                  disabled={busy}
                >
                  {m === "recorded"
                    ? "Recorded case"
                    : m === "live"
                      ? "Live network"
                      : "Local rehearsal"}
                </button>
              ))}
            </div>
            <span className="provenance">
              {mode === "recorded"
                ? "Snapshot · 28 Sep 2026"
                : mode === "rehearsal"
                  ? "In this browser · no consensus"
                  : checkedAt
                    ? "Read " + timestamp(checkedAt) + " WAT"
                    : busy
                      ? "Fetching finalized state… · recorded snapshot shown"
                      : "Live read unavailable · recorded snapshot shown"}
            </span>
            {mode === "live" && (
              <button
                className="text-button"
                onClick={() => void refresh()}
                disabled={busy}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            )}
          </div>
          {mode === "rehearsal" && (
            <div className="notice-strip neutral">
              <Info size={18} />
              <span>
                Local rehearsal uses scripted retraction and supported recovery.
                It creates no transaction or GenLayer judgment.
              </span>
              <button
                className="text-button"
                onClick={() => {
                  setData(rehearsalCase());
                  setMessage("Rehearsal reset.");
                }}
              >
                Reset
              </button>
            </div>
          )}
          {error && (
            <div className="alert error" role="alert">
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {message && (
            <div className="alert success" role="status">
              {message}
            </div>
          )}
          {section === "case" && (
            <>
              <section className="case-intro">
                <div>
                  <h2>
                    A withdrawn study.
                    <br />
                    <em>A visible chain of consequences.</em>
                  </h2>
                  <p>
                    {mode === "recorded"
                      ? "A real PubMed retraction was linked to the registered clinical study. Two synthetic authorizations were blocked; the independent review stayed active."
                      : mode === "rehearsal"
                        ? "Try a scripted retraction, trace its effects, then explicitly recover a parent. The child requires its own review."
                        : "Current finalized registry state for this bounded case manifest. The original case and the new synthetic grant branch can be inspected independently."}
                  </p>
                </div>
                {mode !== "rehearsal" && (
                  <div className="case-facts">
                    <span>
                      <ShieldOff size={16} /> Retraction recorded
                    </span>
                    <span>
                      <GitBranch size={16} /> Direct + transitive propagation
                    </span>
                    <span>
                      <ShieldCheck size={16} /> Independent branch preserved
                    </span>
                  </div>
                )}
              </section>
              <section className="workspace-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Evidence & dependencies</h2>
                    <p>Select a record to trace its dependents.</p>
                  </div>
                  <div className="segmented small">
                    <button
                      aria-label="Diagram view"
                      aria-pressed={!list}
                      className={!list ? "selected" : ""}
                      onClick={() => setList(false)}
                    >
                      <GitBranch size={15} />
                    </button>
                    <button
                      aria-label="List view"
                      aria-pressed={list}
                      className={list ? "selected" : ""}
                      onClick={() => setList(true)}
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
                <div className="workspace-body">
                  <div className="graph-area">
                    <Graph
                      data={data}
                      selected={selected}
                      onSelect={setSelected}
                      list={list}
                    />
                    <div className="graph-footer">
                      <span>
                        <i className="legend changed" />
                        Changed or review required
                      </span>
                      <span>
                        <i className="legend good" />
                        Active registry state
                      </span>
                    </div>
                  </div>
                  <aside className="inspector" aria-label="Selected record">
                    <span
                      className={
                        "state " +
                        (record?.status === "ACTIVE" ? "good" : "changed")
                      }
                    >
                      {record?.status === "BLOCKED_REASSESSMENT"
                        ? "Review required"
                        : (record?.status.toLowerCase() ?? "Not loaded")}
                    </span>
                    <h3>{labels[selected] ?? selected.slice(2)}</h3>
                    <p className="record-id">
                      {selected.slice(2)} · version {record?.version ?? "—"}
                    </p>
                    {record &&
                      ("source_id" in record ? (
                        <>
                          <p>{record.publisher_label}</p>
                          <h4>Publication references</h4>
                          {(record.current_refs.length
                            ? record.current_refs
                            : record.versions[0].references
                          ).map((url) => (
                            <a
                              className="source-link"
                              href={url}
                              key={url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {new URL(url).hostname}
                              <ExternalLink size={13} />
                            </a>
                          ))}
                          {record.status === "RETRACTED" && (
                            <p className="explanation">
                              Withdrawn evidence cannot support a new active
                              authorization.
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <h4>Frozen purpose</h4>
                          <p>{record.purpose}</p>
                          <h4>Why this state</h4>
                          <p>
                            {record.authorization_enabled
                              ? "This authorization is enabled in the registry."
                              : record.blocked_by_source
                                ? "Source " +
                                  record.blocked_by_source +
                                  " changed. Its dependent authorizations require explicit review."
                                : "The reassessment did not support this purpose."}
                          </p>
                          <h4>Decision owner</h4>
                          <CopyId value={record.owner} />
                          <h4>Last validity judgment</h4>
                          <p>{record.last_validity.replaceAll("_", " ")}</p>
                          {record.last_citations?.map((url) => (
                            <a
                              className="source-link"
                              href={url}
                              key={url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {new URL(url).hostname}
                              <ExternalLink size={13} />
                            </a>
                          ))}
                          <button
                            className="primary compact"
                            onClick={() => changeSection("reassess")}
                            disabled={record.authorization_enabled}
                          >
                            Reassess this decision <ArrowRight size={14} />
                          </button>
                        </>
                      ))}
                    <h4>
                      {affected.length} dependent{" "}
                      {affected.length === 1 ? "decision" : "decisions"}
                    </h4>
                    {affected.length ? (
                      <ul className="dependent-names">
                        {affected.map((k) => (
                          <li key={k}>
                            <button onClick={() => setSelected(k)}>
                              {labels[k] ?? k.slice(2)}
                              <span>
                                {data.decisions
                                  .find((d) => "D:" + d.decision_id === k)
                                  ?.dependencies.includes(selected)
                                  ? "Direct"
                                  : "Transitive"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No downstream records in this manifest.</p>
                    )}
                    <p className="fine-print">
                      Labels describe registry state. They do not certify
                      publication authenticity or scientific truth.
                    </p>
                  </aside>
                </div>
              </section>
              <div className="below-canvas">
                <p>
                  <Info size={16} /> Bounded case: {data.sources.length} sources
                  and {data.decisions.length} decisions. The contract has no
                  global listing endpoint.
                </p>
                <button
                  className="text-button"
                  onClick={() => changeSection("proof")}
                >
                  Inspect the proof <ArrowRight size={14} />
                </button>
              </div>
              {mode === "live" && (
                <div className="inspect-record">
                  <label htmlFor="inspect-id">
                    Add a known record to this browser’s manifest
                  </label>
                  <div>
                    <select
                      aria-label="Record kind"
                      value={inspectKind}
                      onChange={(e) =>
                        setInspectKind(e.target.value as typeof inspectKind)
                      }
                    >
                      <option value="source">Source</option>
                      <option value="decision">Decision</option>
                    </select>
                    <input
                      id="inspect-id"
                      value={inspectId}
                      onChange={(e) => setInspectId(e.target.value)}
                      placeholder="Known record ID"
                      maxLength={48}
                    />
                    <button
                      className="secondary"
                      onClick={() => void inspect()}
                      disabled={busy}
                    >
                      Read record
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {(section === "register" ||
            section === "notice" ||
            section === "reassess") && (
            <ActionForm
              key={section + mode}
              section={section}
              data={data}
              selected={selected}
              mode={mode}
              wallet={wallet}
              busy={busy || txs.some((t) => !terminal(t))}
              write={write}
              preflight={preflight}
              preflightNotice={preflightNotice}
            />
          )}
          {section === "proof" && (
            <Proof data={data} txs={txs} mode={mode} checkedAt={checkedAt} />
          )}
          {section === "about" && (
            <section className="prose">
              <h2>One semantic judgment. A bounded consequence.</h2>
              <p>
                Recall answers a specific question: when registered evidence is
                materially corrected or withdrawn, which recorded authorizations
                now need reviewing?
              </p>
              <ol>
                <li>
                  <strong>Record the basis.</strong> Anyone can register a
                  source and an authorization with explicit parents. The
                  registering wallet owns the decision. The purpose is frozen.
                </li>
                <li>
                  <strong>Judge the relationship.</strong> Validators
                  independently fetch current publications and a submitted
                  notice. A strict schema binds the finding, source, version,
                  citations, and digests.
                </li>
                <li>
                  <strong>Apply the consequence.</strong> A material correction
                  or retraction versions the source and atomically disables
                  every reachable authorization. No material change and
                  uncertainty leave source and decision states unchanged.
                </li>
                <li>
                  <strong>Review explicitly.</strong> The owner reassesses
                  against current sources and earlier active decisions.
                  Supported recovery creates a new version. Children require
                  their own reassessment.
                </li>
              </ol>
              <h2>A research grant demonstration</h2>
              <p>
                The publications are real. Grants, owners, and authorization
                decisions are synthetic fixtures. The original recorded purposes
                are displayed verbatim; the grant framing illustrates a workflow
                rather than institutional activity.
              </p>
              <h2>What the registry can prove</h2>
              <p>
                It stores findings, exact cited URLs, evidence digests, source
                versions, explicit edges, owners, and reassessment history. It
                does not authenticate publishers or establish scientific truth.
                It does not undo completed payments or external decisions.
              </p>
              <h2>Bounds and evidence limits</h2>
              <p>
                12 sources, 24 decisions, 16 notices, four source plus four
                decision parents, eight versions per record, three notice
                references, and 5,000-byte UTF-8 fetched bodies. Redirects, DNS
                resolution, identity, signatures, freshness, and continued
                availability are not verified by the contract. This app’s
                preflight measurements are off-chain observations.
              </p>
              <p>
                StudioNet is hosted development infrastructure. Recall’s
                deployed app uses its real contract execution, but this release
                is not a production blockchain deployment. Read-only exploration
                requires no wallet; writes use your connected wallet and no
                privileged signing server.
              </p>
              <a
                href={REPOSITORY + "/blob/main/docs/TUTORIAL.md"}
                target="_blank"
                rel="noreferrer"
              >
                Read the implementation tutorial <ExternalLink size={14} />
              </a>
            </section>
          )}
          {txs.length > 0 && (
            <section
              className="transaction-tracker"
              aria-label="Your transaction tracking"
            >
              <h2>Your transactions</h2>
              {txs
                .slice()
                .reverse()
                .map((t) => (
                  <div key={t.hash}>
                    <div>
                      <strong>{t.method.replaceAll("_", " ")}</strong>
                      <span
                        className={
                          "state " +
                          (t.phase === "success" ? "good" : "changed")
                        }
                      >
                        {t.phase === "success"
                          ? "Finalized · successful"
                          : t.phase === "provisional"
                            ? "Accepted · provisional"
                            : t.phase === "error"
                              ? "Execution or consensus error"
                              : t.phase === "rollback"
                                ? "Finalized · rollback"
                                : t.phase === "stalled"
                                  ? "Checking paused"
                                  : t.status}
                      </span>
                    </div>
                    <CopyId value={t.hash} />
                    <p>
                      {t.execution}
                      {t.readbackVerified
                        ? " · Expected state transition verified"
                        : t.readback
                          ? " · State read back; transition not yet verified"
                          : ""}
                    </p>
                    {t.error && <p>{t.error}</p>}
                    {(!terminal(t) ||
                      (t.phase === "success" && !t.readbackVerified)) && (
                      <button
                        className="text-button"
                        onClick={async () => {
                          try {
                            const result = await pollTransaction(t);
                            if (result.phase === "success") {
                              const live = await fetchLive(
                                tracked.sources,
                                tracked.decisions,
                                true,
                              );
                              result.readback = live.data;
                              result.readbackVerified = verifyWriteReadback(
                                result,
                                live.data,
                              );
                              result.error = result.readbackVerified
                                ? undefined
                                : "Execution finalized, but the expected state transition is not verified. Do not resubmit this transaction.";
                              if (mode === "live") {
                                setData(live.data);
                                setCheckedAt(live.checkedAt);
                              }
                            }
                            setTxs((old) =>
                              old.map((x) => (x.hash === t.hash ? result : x)),
                            );
                            setPollRun((run) => run + 1);
                          } catch (e) {
                            setError(humanError(e));
                          }
                        }}
                      >
                        Check existing transaction <RefreshCw size={13} />
                      </button>
                    )}
                  </div>
                ))}
            </section>
          )}
          <footer className="page-footer">
            <span>Recall · evidence-dependent authorizations</span>
            <span>
              GenLayer StudioNet · synthetic decisions, published evidence
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
function ActionForm({
  section,
  data,
  selected,
  mode,
  wallet,
  busy,
  write,
  preflight,
  preflightNotice,
}: {
  section: "register" | "notice" | "reassess";
  data: Case;
  selected: string;
  mode: Mode;
  wallet?: string;
  busy: boolean;
  write: (
    method: WriteMethod,
    args: (string | number)[],
    recordId: string,
  ) => Promise<void>;
  preflight?: Preflight;
  preflightNotice: () => Promise<void>;
}) {
  const [kind, setKind] = useState<"source" | "decision">("source"),
    [id, setId] = useState(""),
    [url, setUrl] = useState(""),
    [publisher, setPublisher] = useState(""),
    [purpose, setPurpose] = useState(""),
    [sourceIds, setSourceIds] = useState<string[]>([]),
    [decisionIds, setDecisionIds] = useState<string[]>([]),
    [source, setSource] = useState(
      data.sources.find((s) => s.status !== "RETRACTED")?.source_id ?? "",
    ),
    [notice, setNotice] = useState(noticeReference),
    [decision, setDecision] = useState(
      data.decisions.find(
        (d) =>
          "D:" + d.decision_id === selected &&
          d.status === "BLOCKED_REASSESSMENT",
      )?.decision_id ??
        data.decisions.find((d) => d.status === "BLOCKED_REASSESSMENT")
          ?.decision_id ??
        "",
    ),
    [formError, setFormError] = useState("");
  const d = data.decisions.find((d) => d.decision_id === decision),
    s = data.sources.find((s) => s.source_id === source);
  const readonly = mode === "recorded";
  const owned =
    mode === "rehearsal" ||
    (!!wallet && d?.owner.toLowerCase() === wallet.toLowerCase());
  const toggle = (
    value: string,
    items: string[],
    set: (items: string[]) => void,
  ) =>
    set(
      items.includes(value)
        ? items.filter((i) => i !== value)
        : [...items, value],
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    try {
      if (section === "register") {
        if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,47}$/.test(id))
          throw new Error(
            "Use a unique ID: letters, numbers, dashes, or underscores; at most 48 characters.",
          );
        if (kind === "source") {
          validateReference(url);
          if (!publisher.trim() || publisher.trim().length > 120)
            throw new Error(
              "Enter a publisher label of at most 120 characters.",
            );
          await write("register_source", [id, url, publisher], id);
        } else {
          validateIds(sourceIds);
          validateIds(decisionIds);
          if (!sourceIds.length && !decisionIds.length)
            throw new Error("Select at least one dependency.");
          if (purpose.trim().length < 20 || purpose.length > 1200)
            throw new Error(
              "The frozen purpose must have 20–1,200 characters.",
            );
          await write(
            "register_decision",
            [
              id,
              purpose,
              JSON.stringify(sourceIds),
              JSON.stringify(decisionIds),
            ],
            id,
          );
        }
      }
      if (section === "notice") {
        if (!s || s.status === "RETRACTED")
          throw new Error(
            "Choose a current source that has not been retracted.",
          );
        validateReference(notice);
        if (
          mode === "live" &&
          (!preflight?.ready ||
            Date.now() - Date.parse(preflight.checkedAt) > 300000)
        )
          throw new Error(
            "Run the example preflight again; it must be available and less than five minutes old.",
          );
        await write(
          "submit_notice",
          [source, s.version, JSON.stringify([notice])],
          source,
        );
      }
      if (section === "reassess") {
        if (!d || d.status !== "BLOCKED_REASSESSMENT")
          throw new Error("Choose a blocked decision.");
        if (!owned)
          throw new Error("Connect the wallet that owns this decision.");
        validateIds(sourceIds);
        validateIds(decisionIds);
        if (!sourceIds.length && !decisionIds.length)
          throw new Error(
            "Select current evidence or an earlier active decision.",
          );
        await write(
          "reassess_decision",
          [
            decision,
            d.version,
            JSON.stringify(sourceIds),
            JSON.stringify(decisionIds),
          ],
          decision,
        );
      }
    } catch (e) {
      setFormError(humanError(e));
    }
  }
  const choices = (
    <fieldset>
      <legend>Current dependencies</legend>
      <p>
        At most four sources and four decisions. Earlier active decisions
        prevent cycles.
      </p>
      <div className="dependency-choices">
        {data.sources.map((s) => (
          <label key={s.source_id}>
            <input
              type="checkbox"
              disabled={s.status === "RETRACTED" || busy}
              checked={sourceIds.includes(s.source_id)}
              onChange={() => toggle(s.source_id, sourceIds, setSourceIds)}
            />
            <span>
              {s.source_id}
              <small>
                v{s.version} · {s.status.toLowerCase()}
              </small>
            </span>
          </label>
        ))}
        {data.decisions
          .filter(
            (p) => section !== "reassess" || (!!d && p.sequence < d.sequence),
          )
          .map((p) => (
            <label key={p.decision_id}>
              <input
                type="checkbox"
                disabled={!p.authorization_enabled || busy}
                checked={decisionIds.includes(p.decision_id)}
                onChange={() =>
                  toggle(p.decision_id, decisionIds, setDecisionIds)
                }
              />
              <span>
                {p.decision_id}
                <small>
                  v{p.version} ·{" "}
                  {p.authorization_enabled ? "active" : "blocked"}
                </small>
              </span>
            </label>
          ))}
      </div>
    </fieldset>
  );
  return (
    <div className="action-layout">
      <form className="action-form" onSubmit={submit}>
        {readonly && (
          <div className="alert neutral">
            Recorded proof is an inspection snapshot. Switch to live network to
            sign, or local rehearsal to try the mechanism.
          </div>
        )}
        {section === "register" && (
          <>
            <div className="segmented">
              <button
                type="button"
                className={kind === "source" ? "selected" : ""}
                onClick={() => setKind("source")}
              >
                Evidence source
              </button>
              <button
                type="button"
                className={kind === "decision" ? "selected" : ""}
                onClick={() => setKind("decision")}
              >
                Authorization decision
              </button>
            </div>
            <label htmlFor="record-id">
              {kind === "source" ? "Source" : "Decision"} ID
            </label>
            <input
              id="record-id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              maxLength={48}
              placeholder={
                kind === "source" ? "grant-study-01" : "grant-review-01"
              }
              required
            />
            {kind === "source" ? (
              <>
                <label htmlFor="source-url">Publication URL</label>
                <input
                  id="source-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  maxLength={500}
                  required
                />
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setUrl(originalReference);
                    setPublisher("Crossref DOI metadata for 10.11607/prd.476");
                  }}
                >
                  Use the published study example
                </button>
                <label htmlFor="publisher">Publisher label</label>
                <input
                  id="publisher"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  maxLength={120}
                  required
                />
                <p className="form-help">
                  A descriptive label is not verified publisher identity. Anyone
                  may register a source.
                </p>
              </>
            ) : (
              <>
                <label htmlFor="purpose">Frozen authorization purpose</label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  minLength={20}
                  maxLength={1200}
                  required
                  placeholder="Synthetic research grant review: authorize…"
                />
                <p className="form-help">
                  This purpose cannot be edited later. Your connected wallet
                  becomes the decision owner.
                </p>
                {choices}
              </>
            )}
          </>
        )}
        {section === "notice" && (
          <>
            <h2>Published retraction example</h2>
            <p>
              The PubMed notice concerns DOI 10.11607/prd.476. Select a newly
              registered copy of that study for another live demonstration. The
              original case source is already retracted.
            </p>
            <label htmlFor="notice-source">Target source</label>
            <select
              id="notice-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            >
              <option value="">Select current source</option>
              {data.sources.map((s) => (
                <option
                  key={s.source_id}
                  value={s.source_id}
                  disabled={s.status === "RETRACTED"}
                >
                  {s.source_id} · v{s.version} · {s.status.toLowerCase()}
                </option>
              ))}
            </select>
            <p className="version-note">
              Expected source version:{" "}
              <strong>{s?.version ?? "Select a source"}</strong>
            </p>
            <label htmlFor="notice-url">Notice publication</label>
            <input id="notice-url" value={notice} readOnly />
            <a
              className="source-link"
              href={notice}
              target="_blank"
              rel="noreferrer"
            >
              Open PubMed notice <ExternalLink size={13} />
            </a>
            {s && !s.current_refs.includes(originalReference) && (
              <p className="alert neutral">
                This source does not use the example’s original study URL. A
                relationship is not established; choose the matching study for
                this preflighted example.
              </p>
            )}
            <button
              className="secondary"
              type="button"
              onClick={() => void preflightNotice()}
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle size={15} className="spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              Check publication availability
            </button>
            {preflight && (
              <div className="preflight">
                <p>
                  Off-chain preflight · {timestamp(preflight.checkedAt)} WAT
                </p>
                {preflight.documents.map((doc) => (
                  <details key={doc.url}>
                    <summary>
                      {doc.available ? "Available" : "Unavailable"} ·{" "}
                      {new URL(doc.url).hostname} · {doc.bytes ?? "—"} bytes
                    </summary>
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      Open publication
                    </a>
                    <pre>{doc.text ?? doc.reason}</pre>
                  </details>
                ))}
              </div>
            )}
            <p className="form-help">
              Preflight is an availability measurement. Validators fetch
              independently. Unavailable evidence produces uncertainty;
              malformed results or disagreement can prevent consensus.
            </p>
          </>
        )}
        {section === "reassess" && (
          <>
            <label htmlFor="reassess-id">Blocked decision</label>
            <select
              id="reassess-id"
              value={decision}
              onChange={(e) => {
                setDecision(e.target.value);
                setSourceIds([]);
                setDecisionIds([]);
              }}
              required
            >
              <option value="">Select a decision</option>
              {data.decisions
                .filter((d) => !d.authorization_enabled)
                .map((d) => (
                  <option value={d.decision_id} key={d.decision_id}>
                    {d.decision_id} · v{d.version}
                  </option>
                ))}
            </select>
            {d && (
              <>
                <h3>Frozen purpose</h3>
                <p className="frozen-purpose">{d.purpose}</p>
                <p className="version-note">
                  Expected version <strong>{d.version}</strong> → new version{" "}
                  <strong>{d.version + 1}</strong>
                </p>
                <label>Decision owner</label>
                <CopyId value={d.owner} />
                {!owned && mode === "live" && (
                  <p className="alert neutral">
                    Only the recorded owner can submit. Connected wallet:{" "}
                    {wallet ? short(wallet) : "none"}.
                  </p>
                )}
              </>
            )}
            {choices}
            <p className="form-help">
              Supported review enables this decision. Unsupported or uncertain
              review still creates a new blocked version. Downstream decisions
              require their own reassessment.
            </p>
          </>
        )}
        {formError && (
          <p className="alert error" role="alert">
            {formError}
          </p>
        )}
        <button
          className="primary"
          type="submit"
          disabled={
            busy ||
            readonly ||
            (mode === "live" && !wallet) ||
            (section === "reassess" && (!d || !owned || d.version >= 8)) ||
            (section === "notice" &&
              (!s ||
                !s.current_refs.includes(originalReference) ||
                (mode === "live" && !preflight?.ready)))
          }
        >
          {busy ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <ArrowRight size={16} />
          )}{" "}
          {mode === "rehearsal"
            ? "Apply in local rehearsal"
            : section === "register"
              ? kind === "source"
                ? "Sign source registration"
                : "Sign decision registration"
              : section === "notice"
                ? "Sign notice submission"
                : "Sign owner reassessment"}
        </button>
        {mode === "live" && (
          <p className="fine-print">
            StudioNet · chain 61999 · wallet signature required. Submission does
            not mean successful execution.
          </p>
        )}
      </form>
      <aside className="action-guide">
        <h2>
          {section === "register"
            ? "Every edge has a purpose."
            : section === "notice"
              ? "Four possible findings."
              : "A new version, a new basis."}
        </h2>
        {section === "notice" ? (
          <dl>
            <dt>Material correction</dt>
            <dd>
              Versions the source, replaces references, and blocks all reachable
              decisions.
            </dd>
            <dt>Retraction</dt>
            <dd>
              Versions the source, makes it unusable, and blocks its dependents.
            </dd>
            <dt>No material change</dt>
            <dd>Stores the notice. Authorizations remain unchanged.</dd>
            <dt>Uncertain</dt>
            <dd>
              Stores uncertainty. Source and authorization states remain
              unchanged.
            </dd>
          </dl>
        ) : (
          <>
            <p>
              {section === "register"
                ? "Decisions have explicit dependencies on evidence or earlier active decisions. Registration records your declaration; it does not certify that the evidence supports the purpose."
                : "Recovery is explicit. The owner chooses the replacement basis, and validators assess the unchanged purpose."}
            </p>
            <p>
              {section === "register"
                ? "The registry is bounded to 12 sources and 24 decisions. This case manifest does not enumerate the entire registry."
                : "Recover the parent first, then review each child. No automatic cascade restores authorization."}
            </p>
          </>
        )}
        <div className="guide-contract">
          <h3>Target registry</h3>
          <CopyId value={CONTRACT} />
          <p>GenLayer StudioNet · hosted development</p>
        </div>
      </aside>
    </div>
  );
}
function Proof({
  data,
  txs,
  mode,
  checkedAt,
}: {
  data: Case;
  txs: Tx[];
  mode: Mode;
  checkedAt: string;
}) {
  return (
    <section className="proof">
      <div className="proof-context">
        <h2>Execution context</h2>
        <dl>
          <dt>Network</dt>
          <dd>GenLayer StudioNet · chain 61999 · hosted development</dd>
          <dt>Contract</dt>
          <dd>
            <CopyId value={CONTRACT} />
          </dd>
          <dt>Displayed state</dt>
          <dd>
            {mode === "recorded"
              ? "Historical finalized snapshot · 28 September 2026"
              : mode === "live"
                ? checkedAt
                  ? "Fresh finalized-state read · " +
                    timestamp(checkedAt) +
                    " WAT"
                  : "Historical snapshot shown; live state has not been loaded."
                : "Scripted local rehearsal · no consensus or transaction"}
          </dd>
          <dt>Discovery boundary</dt>
          <dd>
            An explicit manifest of the original case and fresh grant fixtures,
            plus IDs registered or added in this browser. Source and decision
            records outside the manifest are not globally listed. Sequential
            notice IDs are scanned up to the contract limit.
          </dd>
        </dl>
      </div>
      <h2>Stored notice finding</h2>
      {data.notices.map((n) => (
        <article className="finding" key={n.notice_id}>
          <div>
            <h3>{n.finding.replaceAll("_", " ")}</h3>
            <span>
              {n.notice_id} · source {n.source_id} · base version{" "}
              {n.base_version}
            </span>
          </div>
          <p>Affected decisions: {n.affected_decisions.join(", ") || "none"}</p>
          <h4>Citations</h4>
          {n.citations.map((url) => (
            <a
              className="source-link"
              href={url}
              key={url}
              target="_blank"
              rel="noreferrer"
            >
              {url}
              <ExternalLink size={13} />
            </a>
          ))}
          <h4>Fetched evidence digest</h4>
          <CopyId value={n.evidence_digest} />
          <h4>Judgment snapshot digest</h4>
          <CopyId value={n.snapshot_digest} />
          <h4>Frozen input digest</h4>
          <CopyId value={n.input_snapshot_digest} />
        </article>
      ))}
      {!data.notices.length && (
        <p>No contract notice is represented in this rehearsal state.</p>
      )}
      <h2>Source version history</h2>
      {data.sources.map((s) => (
        <details key={s.source_id}>
          <summary>
            {s.source_id} · version {s.version} · {s.status.toLowerCase()}
          </summary>
          {s.versions.map((v) => (
            <p key={v.version}>
              v{v.version} · {v.status} {v.notice_id ? "· " + v.notice_id : ""}
              <br />
              {v.references.map((url) => (
                <a
                  className="source-link"
                  href={url}
                  key={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {url}
                </a>
              ))}
            </p>
          ))}
        </details>
      ))}
      <h2>Reassessment history</h2>
      {data.decisions.map((d) => (
        <details key={d.decision_id}>
          <summary>
            {d.decision_id} · v{d.version} · {d.last_validity}
          </summary>
          <pre>{JSON.stringify(d, null, 2)}</pre>
        </details>
      ))}
      {data.history.length ? (
        data.history.map((row, i) => (
          <pre key={i}>{JSON.stringify(row, null, 2)}</pre>
        ))
      ) : (
        <p>
          The recorded 28 September case contains no reassessment. Live reads
          show the contract’s current reassessment history.
        </p>
      )}
      <h2>Recorded finalized transactions</h2>
      <article className="finding">
        <h3>Owner recovery · verified 4 October 2026</h3>
        <p>
          Recorded release proof: grant-policy-review recovered to active v2;
          grant-release-review stayed blocked at v1. This snapshot is separate
          from live reads.
        </p>
        <p>
          Checked {timestamp(releaseProof.checkedAt)} WAT. Frozen purpose and
          new supporting citations:
        </p>
        <pre>{JSON.stringify(releaseProof.parent, null, 2)}</pre>
        {releaseProof.transactions.map((t) => (
          <details key={t.hash}>
            <summary>
              {t.method.replaceAll("_", " ")} · {t.status} · {t.execution}
            </summary>
            <CopyId value={t.hash} />
            <p>Execution result: {t.result}</p>
          </details>
        ))}
        <h4>Material correction gap</h4>
        <p>{releaseProof.correction.finding}</p>
        <CopyId value={releaseProof.correction.hash} />
        <a
          className="source-link"
          href={
            REPOSITORY +
            "/blob/main/deployments/recall-live-release-2026-10-04.json"
          }
          target="_blank"
          rel="noreferrer"
        >
          Fresh release record
          <ExternalLink size={13} />
        </a>
      </article>
      <p>
        Historical release evidence, 28 September 2026. These values are not
        fresh receipt reads. Explorer routing is not verified; copy an ID to
        inspect it with the GenLayer CLI.
      </p>
      <div className="proof-transactions">
        {recordedTransactions.map((t) => (
          <details key={t.hash}>
            <summary>
              <span>{t.operation.replaceAll("_", " ")}</span>
              <span
                className={"state " + (t.expected_failure ? "changed" : "good")}
              >
                {t.expected_failure ? "Expected rollback" : "Finalized success"}
              </span>
            </summary>
            <CopyId value={t.hash} />
            <pre>{JSON.stringify(t, null, 2)}</pre>
          </details>
        ))}
      </div>
      <p>
        <a
          href={
            REPOSITORY +
            "/blob/main/deployments/recall-network-verification-2026-10-04.json"
          }
          target="_blank"
          rel="noreferrer"
        >
          Dated network revalidation <ExternalLink size={13} />
        </a>
      </p>
      <p>
        {txs.length} transaction(s) tracked by this browser. Inspect live
        execution status above before treating them as proof.
      </p>
    </section>
  );
}
