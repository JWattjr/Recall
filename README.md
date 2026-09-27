# Evidence Retraction Registry

`EvidenceRetractionRegistry` records versioned evidence sources, authorization decisions, and explicit dependency edges. A GenLayer judgment evaluates whether a new publication materially corrects or retracts one registered source. An accepted correction or retraction advances that source version and synchronously walks the bounded dependency graph, disabling every affected authorization in the same transaction. Unaffected branches remain usable.

Decision owners must reassess a blocked record against current registered sources and active upstream decisions. Reassessment creates a new version. A recovered parent does not silently reactivate any dependent decision; each downstream owner must reassess its own record.

## Toolchain

The contract pins `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6`, accepted by the installed GenVM linter. The fallback runner finalized a trivial StudioNet deployment and write/read-back probe; this project contract has not yet been deployed. `requirements.txt` pins the locally installed v0.6 RC test toolchain.

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
genvm-lint lint contracts/evidence_retraction_registry.py
genvm-lint validate contracts/evidence_retraction_registry.py
genvm-lint schema contracts/evidence_retraction_registry.py --output contracts/abi.json
python -m pytest
```

Tests use mocked web and model responses in direct mode. They are not live consensus or finality tests.

## Lifecycle

1. Anyone may register a source ID, HTTPS URL, and publisher label. The record starts at version 1 with an active reference.
2. A decision owner records an authorization purpose and dependencies on registered sources and/or earlier active decisions. Dependency edges are explicit. Decision parents must precede their children, which prevents cycles by construction.
3. Anyone may submit a notice against the source's current version, with up to three new publication references. GenLayer independently fetches the current source references and notice references and classifies the relationship as material correction, retraction, no material change, or uncertain.
4. A correction or retraction increments the source version. A correction replaces its current references with the notice references; a retraction marks it unusable. A bounded breadth-first traversal follows source-to-decision and decision-to-decision edges and disables every reachable authorization atomically.
5. The owner of a blocked decision calls `reassess_decision` with an expected version and a new set of current source and/or active decision dependencies. GenLayer reassesses the frozen purpose. Supported reassessment creates a new active version; unsupported or uncertain reassessment creates a new blocked version. Dependents remain blocked and must be reviewed independently.

## API

The contract has no constructor parameters; see [examples/constructor.json](examples/constructor.json). Writes are `register_source`, `register_decision`, `submit_notice`, and `reassess_decision`. Views are `get_source`, `get_decision`, `get_notice`, `get_dependents`, and `get_history`. The generated ABI is [contracts/abi.json](contracts/abi.json).

## Bounds and failure behavior

The graph is capped at 12 sources, 24 decisions, 16 notices, eight dependency edges per decision, and eight versions per source or decision. Propagation is synchronous and bounded to the full graph, so there is no intermediate state where a known affected authorization remains enabled. An unavailable original or notice reference produces `UNCERTAIN`; a malformed or disagreeing consensus result reverts the transaction. No external transfer or finalized payment is reversed.

References must be HTTPS URLs with public-DNS hostname syntax. Fetched bodies are limited to 5,000 bytes and strict UTF-8. Publisher identity, signatures, redirects, DNS resolution, and freshness are not verified. Retrieved text and publisher labels are untrusted prompt input.

See [mechanism differentiation](docs/MECHANISM_DIFFERENTIATION.md), [test matrix](docs/TEST_MATRIX.md), [security notes](docs/SECURITY_NOTES.md), [demo sequence](examples/demo_sequence.md), and the [undeployed submission draft](SUBMISSION_DRAFT.md).
