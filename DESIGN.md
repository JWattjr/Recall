---
name: Recall
description: An evidence desk for focused daytime review.
colors:
  paper: "#f7f7f2"
  surface: "#fff"
  ink: "#233d34"
  muted: "#596b62"
  line: "#e1e6dd"
  forest: "#234e3b"
  green: "#356348"
  green-bg: "#edf4eb"
  copper: "#9c492e"
  copper-bg: "#fcf0e8"
  focus: "#1b7558"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  editorial:
    fontFamily: "Newsreader, serif"
    fontSize: "33px"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.65
rounded:
  status: "4px"
  field: "6px"
  control: "7px"
  record: "10px"
  surface: "12px"
spacing:
  "8": "8px"
  "10": "10px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "28": "28px"
  "32": "32px"
  "40": "40px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
  button-text:
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    padding: "4px 0"
  input:
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 11px"
  state-changed:
    backgroundColor: "{colors.copper-bg}"
    textColor: "{colors.copper}"
    rounded: "{rounded.status}"
    padding: "3px 7px"
  state-active:
    backgroundColor: "{colors.green-bg}"
    textColor: "{colors.green}"
    rounded: "{rounded.status}"
    padding: "3px 7px"
  record:
    textColor: "{colors.ink}"
    rounded: "{rounded.record}"
    padding: "13px 15px"
    width: "230px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
---

# Design System: Recall

## Overview

**Creative North Star: "The Evidence Desk"**

Recall is an evidence desk for focused daytime review. Warm archival paper, forest ink, fine rules, and restrained state colors frame readable source records. Newsreader gives the case title an editorial voice; Manrope keeps controls and records precise.

The implemented workspace is compact and task-oriented. A left rail frames the dependency canvas and selected-record inspector. Selecting a record emphasizes its reachable branch while keeping unrelated records legible. Provenance and versions stay beside the data they qualify; direct and transitive relationships are named. Forms retain native controls, persistent labels, actionable errors, and explicit wallet-signing actions.

**Key Characteristics:**

- Warm paper and white work surfaces with forest text.
- Copper identifies changed evidence or required review; muted green identifies active registry state.
- Editorial case headings paired with compact task typography.
- Fine borders organize records, forms, and proof without heavy elevation.
- Keyboard focus and a dependency-list alternative support inspection.

## Colors

Quiet paper neutrals and forest ink carry the interface, with two restrained semantic state families. Frontmatter is normative; the names below explain application.

### Primary

- **Forest** (`forest`): primary actions, source links, navigation cues, and caret color.
- **Forest Ink** (`ink`): main text, record titles, and page headings.
- **Focus Green** (`focus`): visible keyboard outlines, independent of selected state.

### Secondary

- **Active Green** (`green`, `green-bg`): active authorizations and usable records, with explicit state text.

### Tertiary

- **Review Copper** (`copper`, `copper-bg`): withdrawn evidence, required review, and related explanations. Warm variations distinguish selected records and reachable graph paths.

### Neutral

- **Archival Paper** (`paper`): application background.
- **White Surface** (`surface`): panels, inspector, forms, and outlined controls.
- **Muted Ink** (`muted`): descriptions and supporting copy.
- **Paper Rule** (`line`): dividers and panel boundaries.

**The State Has Words Rule.** Pair state color with a readable state label; graph nodes also carry a status icon. Color alone must not carry the finding.

## Typography

**Display Font:** Manrope with sans-serif fallback.
**Editorial Font:** Newsreader with serif fallback.
**Body Font:** Manrope with sans-serif fallback.

Newsreader is reserved for case and explanatory action headings. Manrope supplies page hierarchy, forms, navigation, and records. Numeric provenance and IDs use tabular numerals where declared; copyable identifiers use the browser's code face.

### Hierarchy

- **Display:** the frontmatter display role marks page titles; mobile titles reduce to (28px).
- **Editorial:** the case title uses the editorial role, reducing to (29px) below the compact desktop breakpoint. Related guide and form headings vary from (27px) to (31px), retaining weight (400).
- **Title:** section headings use the title role. Inspector titles use (20px), increasing to (21px) on phones; panel headings use (16px).
- **Body:** the body role sets global copy. Explanatory prose uses (13px), line height (1.9), and maximum measure (75ch). Inspector descriptions use line height (1.8).
- **Label:** the label role covers task buttons and form labels. Sentence case is the default; state labels use capitalized text.

**The Editorial Assignment Rule.** Use Newsreader for case narrative and explanatory headings; keep operational labels and records in Manrope.

The source also contains metadata at (9–10px). Those compact values are an existing readability limitation, not a normative type role to propagate.

## Layout

The desktop shell uses a fixed left rail (230px), top bar (76px), and centered content region with maximum width (1450px). Main horizontal padding is (40px). At widths up to (1250px), the rail contracts to (205px), main padding to (25px), and inspector insets contract.

The dependency panel combines a scrollable graph and adjacent inspector above (1350px). The inspector is normally (290px) wide and grows to (320px) from (1500px). At widths up to (1350px), the final stylesheet override stacks the inspector below the graph as a single-column block, superseding the earlier two-column inspector rule.

Records run left to right by dependency depth. Nodes are (230px) wide, with column spacing (285px) and row spacing (158px). The canvas expands with the bounded case and scrolls within its surface. Selection updates the inspector and emphasizes reachable edges. The dependency list mirrors selection and names direct and transitive dependents.

At widths up to (700px), the rail becomes horizontal scrolling navigation, main padding becomes (18px), the diagram is hidden, and the dependency list becomes the inspection surface. The inspector follows the list. Phones do not show a vertically rearranged diagram. Form text increases to (16px), while base body text reduces to (13px).

Action surfaces use a form-and-guide grid capped at (1050px), with a (650px) form column and gap (56px). They become one column at (980px). Frontmatter records repeated gaps and insets; alignment takes precedence over imposing an invented scale.

## Elevation & Depth

Recall is flat at rest. White surfaces, lightly tinted record backgrounds, and one-pixel rules create hierarchy. The selected segmented control alone receives a low shadow (`0 2px 4px #253c3210`). Graph selection uses a stronger border and state-aware background rather than lift.

**The Paper Boundary Rule.** Separate records and work surfaces with tonal contrast and fine rules. Reserve the existing small shadow for the active segmented control.

Button state transitions take (160ms); graph-node transitions take (250ms) and edges (300ms). Reduced-motion preferences remove transitions and animations. The rotating loading indicator is functional activity feedback.

## Shapes

Work surfaces use the largest recurring radius, records the record radius, buttons the control radius, fields and notices the field radius, and state tags the status radius. Borders remain thin and subdued; selected graph records use a two-pixel border with compensating padding to retain their footprint. State tags are small rectangles; legend and network markers are circles.

## Components

### Buttons

Primary actions are forest-filled with white text. Secondary actions are white with forest text and a subdued green border. Both use the control radius, label typography, recorded padding, and minimum height (42px). Text actions omit fill and border. Non-disabled hover slightly reduces brightness. Disabled controls use opacity (0.5) and a not-allowed cursor.

### Chips

State tags pair copper-on-pale-copper or green-on-pale-green with explicit text. They use compact rectangular silhouettes and capitalized labels to report registry state.

### Cards / Containers

Dependency panels, action forms, and proof context share white fill, a thin paper-rule border, and the surface radius. The graph has a near-white paper tint. The inspector separates by a left rule on wide screens and a top rule when stacked. Form padding is (28px), reducing on phones; proof padding is (24px). Ruled headers and footers remain divisions of one container.

### Inputs / Fields

Fields use near-white tinted fill, a thin green-gray stroke, field radius, recorded padding, and minimum height (43px). Labels remain visible above fields. Textareas start at (130px) and resize vertically. Native checkboxes use forest accent color. Errors use warm bordered alerts and actionable copy.

**The Visible Focus Rule.** Use an outline of (3px) in the focus color with offset (3px) for buttons, links, inputs, selects, textareas, and disclosure summaries. Selection borders do not replace keyboard focus.

### Navigation

The rail uses icon-and-label buttons with transparent default fill and subdued green active fill. Navigation buttons use the control radius and medium-weight Manrope. Phones move the same destinations into a scrolling row. Segmented controls use a tinted tray and a white selected button with the small shadow above.

### Dependency records

Selectable records show kind, version, readable title, and explicit state. Active records use pale green; changed records use pale copper. Selection strengthens the border and background in the record's state family. Unrelated records retain full opacity and switch to neutral paper, preserving legibility. Reachable edges become stronger warm paths. The inspector presents references or frozen purpose, owner, state explanation, and named dependents. The list includes dependency text and direct/transitive relationship labels.

## Do's and Don'ts

### Do:

- **Do** keep provenance, versions, and source links adjacent to the records they qualify.
- **Do** pair state colors with readable text and preserve status icons in graph nodes.
- **Do** use Newsreader for editorial case and guide headings, and Manrope for task controls.
- **Do** preserve the dependency-list alternative and visible keyboard focus.
- **Do** keep unrelated graph records legible while emphasizing reachable relationships.
- **Do** use fine rules and quiet surface tints to organize inspection.

### Don't:

- **Don't** imply scientific certification through status styling; labels describe registry state.
- **Don't** use copper as decoration disconnected from evidence change or review.
- **Don't** hide versions or provenance inside hover-only controls.
- **Don't** promote tiny metadata or the proof disclosure's text-glyph icon into reusable defaults.

Recorded from `frontend/src/app/globals.css`, `frontend/src/components/workspace.tsx`, `frontend/src/components/graph.tsx`, and `frontend/src/app/layout.tsx`; merged with incumbent visual decisions. Tiny metadata and the proof-summary plus glyph are intentionally not canonized.
