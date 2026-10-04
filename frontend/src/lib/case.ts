import historical from "@/data/historical.json";
import type { Case, Source, Decision, Notice } from "./model";
export const CONTRACT = historical.contract_address as `0x${string}`;
export const CHAIN_ID = 61999;
export const RPC = "https://studio.genlayer.com/api";
export const REPOSITORY =
  "https://github.com/JWattjr/evidence-retraction-registry";
export const SOURCE_COMMIT = historical.project.source_commit;
export const CODE_SHA256 = historical.source_sha256;
export const caseManifest = {
  sourceIds: [
    "report-a",
    "report-unrelated",
    "correction-study",
  ],
  decisionIds: [
    "decision-a",
    "decision-b",
    "decision-c",
    "correction-parent",
    "correction-child",
  ],
  noticeIds: ["N-000001", "N-000002"],
};
export const recorded: Case = {
  sources: Object.values(historical.final_onchain_readback.sources) as Source[],
  decisions: Object.values(
    historical.final_onchain_readback.decisions,
  ) as Decision[],
  notices: historical.final_onchain_readback.notices as Notice[],
  history: historical.final_onchain_readback.history,
};
export const recordedCorrection: Case = {
  sources: historical.correction.sources as Source[],
  decisions: historical.correction.decisions as Decision[],
  notices: historical.correction.notices as Notice[],
  history: historical.correction.history,
};
export const recordedTransactions = historical.transactions;
export const noticeReference = recorded.notices[0].references[0];
export const originalReference = recorded.sources[0].versions[0].references[0];
export const labels: Record<string, string> = {
  "S:report-a": "Clinical study",
  "S:report-unrelated": "Retraction guidelines",
  "D:decision-a": "Evidence review",
  "D:decision-b": "Downstream authorization",
  "D:decision-c": "Independent review",
  "S:correction-study": "Genetic testing study",
  "D:correction-parent": "Correction evidence review",
  "D:correction-child": "Correction downstream authorization",
  "S:grant-study-20261004": "Grant study fixture",
  "D:grant-policy-review": "Grant policy review",
  "D:grant-release-review": "Grant downstream review",
  "S:mri-study-20261004": "MRI study",
  "D:mri-grant-review": "MRI evidence review",
  "D:mri-grant-followup": "MRI downstream review",
};
export const descriptions: Record<string, string> = {
  "S:report-a": "DOI 10.11607/prd.476",
  "S:report-unrelated": "COPE · PMID 20017220",
  "D:decision-a": "Synthetic research grant fixture",
  "D:decision-b": "Depends on the evidence review",
  "D:decision-c": "Separate evidence branch",
  "S:correction-study": "PMID 28664264 · reported percentages corrected",
  "D:correction-parent": "Relies on lifestyle and dietary percentages",
  "D:correction-child": "Depends on the correction evidence review",
};
export function rehearsalCase(): Case {
  const data = structuredClone(recorded);
  data.sources[0] = {
    ...data.sources[0],
    status: "ACTIVE",
    version: 1,
    current_refs: [originalReference],
    versions: [data.sources[0].versions[0]],
  };
  data.decisions = data.decisions.map((d) => ({
    ...d,
    status: "ACTIVE",
    authorization_enabled: true,
    blocked_by_notice: undefined,
    blocked_by_source: undefined,
  }));
  data.notices = [];
  data.history = [];
  return data;
}
