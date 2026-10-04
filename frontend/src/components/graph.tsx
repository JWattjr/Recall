"use client";
import {
  ArrowRight,
  FileText,
  GitBranch,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { descendants, type Case } from "@/lib/model";
import { labels, descriptions } from "@/lib/case";
export function Graph({
  data,
  selected,
  onSelect,
  list,
}: {
  data: Case;
  selected: string;
  onSelect: (key: string) => void;
  list: boolean;
}) {
  const affected = descendants(data, selected);
  const nodes = [
    ...data.sources.map((s) => ({
      key: "S:" + s.source_id,
      id: s.source_id,
      status: s.status,
      version: s.version,
      parents: [] as string[],
      source: true,
    })),
    ...data.decisions.map((d) => ({
      key: "D:" + d.decision_id,
      id: d.decision_id,
      status: d.status,
      version: d.version,
      parents: d.dependencies,
      source: false,
    })),
  ];
  const levels = new Map<string, number>();
  for (const s of data.sources) levels.set("S:" + s.source_id, 0);
  for (const d of [...data.decisions].sort((a, b) => a.sequence - b.sequence))
    levels.set(
      "D:" + d.decision_id,
      1 + Math.max(0, ...d.dependencies.map((p) => levels.get(p) ?? 0)),
    );
  const rowCounts = new Map<number, number>();
  const positions = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    const col = levels.get(n.key) ?? 0,
      row = rowCounts.get(col) ?? 0;
    positions.set(n.key, { x: 32 + col * 285, y: 50 + row * 158 });
    rowCounts.set(col, row + 1);
  }
  const width = Math.max(880, (Math.max(0, ...levels.values()) + 1) * 285 + 40),
    height = Math.max(390, Math.max(0, ...rowCounts.values()) * 158 + 60);
  return (
    <>
      <div className={"graph-scroll " + (list ? "graph-hidden" : "")}>
        <div className="graph-canvas" style={{ width, height }}>
          <svg width={width} height={height} aria-hidden="true">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {nodes.flatMap((n) =>
              n.parents.map((p) => {
                const start = positions.get(p),
                  end = positions.get(n.key);
                if (!start || !end) return null;
                const focus =
                  (p === selected || affected.includes(p)) &&
                  affected.includes(n.key);
                return (
                  <path
                    key={p + n.key}
                    className={focus ? "edge edge-selected" : "edge"}
                    d={`M ${start.x + 230} ${start.y + 53} C ${start.x + 267} ${start.y + 53}, ${end.x - 37} ${end.y + 53}, ${end.x} ${end.y + 53}`}
                    markerEnd="url(#arrow)"
                  />
                );
              }),
            )}
          </svg>
          {nodes.map((n) => {
            const p = positions.get(n.key)!;
            const muted = selected !== n.key && !affected.includes(n.key);
            return (
              <button
                key={n.key}
                className={`graph-node ${n.status === "ACTIVE" ? "node-active" : "node-changed"} ${selected === n.key ? "node-selected" : ""} ${muted ? "node-muted" : ""}`}
                style={{ left: p.x, top: p.y }}
                onClick={() => onSelect(n.key)}
                aria-pressed={selected === n.key}
              >
                <span className="node-kind">
                  {n.source ? <FileText size={14} /> : <GitBranch size={14} />}{" "}
                  {n.source ? "Evidence source" : "Authorization"}{" "}
                  <span>v{n.version}</span>
                </span>
                <strong>{labels[n.key] ?? n.id}</strong>
                <span className="node-state">
                  {n.status === "ACTIVE" ? (
                    <ShieldCheck size={13} />
                  ) : (
                    <ShieldOff size={13} />
                  )}{" "}
                  {n.status === "BLOCKED_REASSESSMENT"
                    ? "Review required"
                    : n.status.toLowerCase()}
                </span>
              </button>
            );
          })}
          <div className="column-label" style={{ left: 32 }}>
            Published evidence
          </div>
          <div className="column-label" style={{ left: 317 }}>
            Direct decisions
          </div>
          <div className="column-label" style={{ left: 602 }}>
            Dependent decisions
          </div>
        </div>
      </div>
      <ul className={"dependency-list " + (!list ? "list-mobile-only" : "")}>
        {nodes.map((n) => (
          <li
            key={n.key}
            className={affected.includes(n.key) ? "dependent" : ""}
          >
            <button
              onClick={() => onSelect(n.key)}
              aria-pressed={selected === n.key}
            >
              <span>
                <strong>{labels[n.key] ?? n.id}</strong>
                <small>{descriptions[n.key] ?? n.id}</small>
                {affected.includes(n.key) && (
                  <small className="relationship">
                    {n.parents.includes(selected)
                      ? "Direct dependent"
                      : "Transitive dependent"}
                  </small>
                )}
              </span>
              <span
                className={
                  "state " + (n.status === "ACTIVE" ? "good" : "changed")
                }
              >
                {n.status === "BLOCKED_REASSESSMENT"
                  ? "Review required"
                  : n.status.toLowerCase()}
              </span>
            </button>
            {n.parents.length > 0 && (
              <p>
                <ArrowRight size={13} /> Relies on{" "}
                {n.parents.map((p) => labels[p] ?? p).join(", ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
