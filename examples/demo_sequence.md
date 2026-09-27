# Complete demo sequence

Run the executable direct-mode scenario:

```powershell
python -m pytest tests/test_registry.py::test_retraction_blocks_only_transitive_dependents_and_reassessment_versions_do_not_restore_children
```

1. Register `report-a` and an unrelated `report-unrelated` source.
2. Alice registers `decision-a` using `report-a`. Bob registers `decision-b` using `decision-a`. The owner registers `decision-c` using only the unrelated source.
3. Submit a notice for `report-a` at version 1. The mocked independent judgment says the new publication retracts it.
4. The source moves to version 2 and status `RETRACTED`. The traversal blocks `decision-a` and then `decision-b`; `decision-c` remains active.
5. Register a replacement source. Alice reassesses `decision-a` against it. The successful review creates decision version 2 and activates that record.
6. `decision-b` remains blocked. It requires a separate reassessment against the now-active version 2 parent.

The test mocks publication contents and consensus outputs. It does not show reversal of any external payment or transaction.
