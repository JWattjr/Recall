# Mechanism differentiation

## Nearest comparison

The closest local projects are ClaimNet Semantic Exposure Graph and Source-Conflict Resolution Kernel. ClaimNet classifies semantic relationships; Source-Conflict resolves a conflict among competing claims. This registry records explicit evidence and decision dependencies, then changes the authorization state of all downstream records when a registered source version is corrected or retracted.

## New state transition

The important operation is `source version N → corrected/retracted version N+1 → bounded dependency traversal → all reachable decisions BLOCKED_REASSESSMENT`. The traversal follows explicit source-to-decision and decision-to-decision edges. It runs completely in one bounded transaction; no subset of the known affected branch remains active between stages.

Reassessment is an explicit new decision version with a new parent-version snapshot. A recovered upstream decision does not restore its descendants. Each affected owner must re-evaluate their own authorization record.

## Limits

This is an on-chain dependency and authorization registry. It cannot undo an external payment, transfer, or finalized transaction. Local comparisons do not establish ecosystem-wide originality or Portal outcomes.
