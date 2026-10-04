# Evidence Retraction Registry

EvidenceRetractionRegistry stores versioned evidence sources, authorization decisions, and explicit dependency edges. A GenLayer judgment evaluates whether a new publication materially corrects or retracts one registered source. An accepted correction or retraction advances that source version and synchronously walks the bounded dependency graph, disabling every affected authorization in the same transaction. Unaffected branches remain usable.

Decision owners must reassess a blocked record against current registered sources and active upstream decisions. Reassessment creates a new version. A recovered parent does not silently reactivate any dependent decision; each downstream owner must reassess its own record.

## StudioNet demonstration

- Network: GenLayer StudioNet, chain ID 61999.
- Contract: 0x432960e720542c0EAB68f76a4274fBf972A19a31.
- Deployed source: commit c0d00fc83477c6eaa69bcf001c5378212e7ac52a; the on-chain Git blob matches the source file.
- Result: the notice was classified as RETRACTION. Source report-a advanced from active version 1 to retracted version 2. Decision-a and its dependent decision-b became BLOCKED_REASSESSMENT with authorization disabled. Independent decision-c and its unrelated source remained active. Replaying the notice against the retracted source finalized as the expected rollback.
- Eight transactions finalized: seven leader executions succeeded and the stale replay produced one expected leader error with rollback.
- The release record contains all five public views, transaction finality and vote details, source references, and the preflight HTTP status and byte count for each evidence URL.

The source records are public Crossref and PubMed records. The authorization decisions and owners are synthetic demonstration fixtures. The contract does not verify publisher identity, signatures, redirects, DNS resolution, or source freshness, and it cannot reverse external actions or payments. The contract does not expose a separate on-chain fetch status or byte count; the stored finding, citation, and snapshot digest are visible, while URL preflight measurements are recorded in the release file.

See the StudioNet release record at deployments/studionet-release-2026-09-28.json and the submission draft at SUBMISSION_DRAFT.md. This project has not been submitted to the GenLayer Portal.

## Toolchain and local checks

The contract pins runner py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6, accepted by the installed GenVM linter. The direct-mode suite passed 10 parameter-expanded tests; GenVM lint passed 3 checks; SDK validation reported 9 methods (5 views and 4 writes); ABI schema extraction succeeded. Direct tests mock web and model responses and do not establish live consensus or finality.

The local setup uses Python 3.14 and requirements.txt. The checks are genvm-lint lint contracts/evidence_retraction_registry.py, genvm-lint validate contracts/evidence_retraction_registry.py, genvm-lint schema contracts/evidence_retraction_registry.py --output contracts/abi.json, and python -m pytest.

## Lifecycle

1. Anyone may register a source ID, HTTPS URL, and publisher label. The record starts at version 1 with an active reference.
2. A decision owner records an authorization purpose and dependencies on registered sources and/or earlier active decisions. Dependency edges are explicit. Decision parents must precede their children, which prevents cycles by construction.
3. Anyone may submit a notice against the source's current version, with up to three new publication references. GenLayer independently fetches the current source references and notice references and classifies the relationship as material correction, retraction, no material change, or uncertain.
4. A correction or retraction increments the source version. A correction replaces its current references with the notice references; a retraction marks it unusable. A bounded breadth-first traversal follows source-to-decision and decision-to-decision edges and disables every reachable authorization atomically.
5. The owner of a blocked decision calls reassess_decision with an expected version and a new set of current source and/or active decision dependencies. GenLayer reassesses the frozen purpose. Supported reassessment creates a new active version; unsupported or uncertain reassessment creates a new blocked version. Dependents remain blocked and must be reviewed independently.

## API

The contract has no constructor parameters; see examples/constructor.json. Writes are register_source, register_decision, submit_notice, and reassess_decision. Views are get_source, get_decision, get_notice, get_dependents, and get_history. The generated ABI is contracts/abi.json.

## Bounds and failure behavior

The graph is capped at 12 sources, 24 decisions, 16 notices, eight dependency edges per decision, and eight versions per source or decision. Propagation is synchronous and bounded to the full graph, so there is no intermediate state where a known affected authorization remains enabled. An unavailable original or notice reference produces UNCERTAIN; a malformed or disagreeing consensus result reverts the transaction. No external transfer or finalized payment is reversed.

References must be HTTPS URLs with public-DNS hostname syntax. Fetched bodies are limited to 5,000 bytes and strict UTF-8. Publisher identity, signatures, redirects, DNS resolution, and freshness are not verified. Retrieved text and publisher labels are untrusted prompt input.

See the mechanism differentiation, test matrix, security notes, and demo sequence for implementation and test details.
