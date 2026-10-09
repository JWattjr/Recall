"""Run the contract's exact pure evidence helpers before a live notice write."""
import ast
import hashlib
import json
from pathlib import Path
import re
import sys
from urllib.error import HTTPError
from urllib.request import Request, urlopen


def contract_helpers():
    path = Path(__file__).resolve().parents[1] / "contracts/evidence_retraction_registry.py"
    tree = ast.parse(path.read_text(encoding="utf-8"))
    names = {"_canonical", "_digest", "_url", "_host", "_normalize_publication", "_publication_text", "_identifier_matches"}
    constants = {"MAX_URL_LENGTH", "MAX_SOURCE_BYTES", "EUROPE_PMC_FIELDS"}
    nodes = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in names
             or isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id in constants for target in node.targets)]
    scope = {"json": json, "hashlib": hashlib, "re": re}
    exec(compile(ast.Module(body=nodes, type_ignores=[]), str(path), "exec"), scope)
    return scope


def check(urls, identifier):
    helpers = contract_helpers()
    results = []
    for url in urls:
        attempts = []
        for sample in range(3):
            for retry in range(2):
                try:
                    with urlopen(Request(url, headers={"User-Agent": "Recall-evidence-preflight/3"}), timeout=30) as response:
                        status = response.status
                        body = response.read(helpers["MAX_SOURCE_BYTES"] + 1)
                except HTTPError as error:
                    status = error.code
                    body = b""
                if retry == 0 and (status == 429 or 500 <= status <= 599):
                    continue
                break
            if status != 200 or not 0 < len(body) <= helpers["MAX_SOURCE_BYTES"]:
                raise ValueError(f"Evidence preflight failed: sample {sample + 1}, HTTP {status}, bytes {len(body)}")
            text = helpers["_publication_text"](url, body.decode("utf-8"))
            matches = helpers["_identifier_matches"](identifier, text)
            if not matches:
                raise ValueError(f"Evidence identifier preflight failed: sample {sample + 1}")
            attempts.append({"status": status, "bytes": len(body), "raw_sha256": hashlib.sha256(body).hexdigest(),
                             "canonical_digest": helpers["_digest"](text), "identifier_match": matches})
        if len({attempt["canonical_digest"] for attempt in attempts}) != 1:
            raise ValueError("Evidence canonical digest changed across three fetches")
        results.append({"url": url, "identifier": identifier, "samples": attempts, "stable": True})
    return results


if __name__ == "__main__":
    try:
        payload = json.load(sys.stdin)
        print(json.dumps({"documents": check(payload["urls"], payload["identifier"]), "passed": True}))
    except Exception as error:
        print(json.dumps({"passed": False, "error": str(error)}))
        sys.exit(1)
