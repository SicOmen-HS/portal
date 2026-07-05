# Data- och analysportalen Project Workflow

## Purpose And Authority

This document owns the operational checklist for planning, work-item administration,
execution, review and delivery. `docs/project/PROJECT_RULES.md` owns durable
governance. `docs/project/WORK_ITEM_SCHEMA.md` owns metadata and manifest contracts.
`docs/development/PROJECT_ADMINISTRATION.md` owns detailed CLI behavior.

## Roles

- **Project owner:** approves priorities, scope, completion, Git, deployment and
  external-context changes.
- **Planning assistant:** prepares scoped work, prompts and reviews; never invents an
  allocated identifier or claims unconfirmed approval.
- **Implementation agent:** performs only approved repository work, verifies it and
  reports evidence and documentation impact.
- **Reviewer:** compares the result with approved scope and checks verification,
  durable knowledge and delivery impact.
- **Automation/CLI:** applies deterministic allocation, metadata, queue, transition,
  validation and completion operations.

## 1. Route Analysis Before Creating Work

Use a planning or reasoning conversation first for a single supplied document, one
isolated idea, bounded reasoning or a solution discussion that does not require
repository evidence. Do not create a work item merely to formalize a small standalone
conversation.

Use a repository-capable implementation or coding agent for analysis when the answer
requires several documents, source code, repository structure, tooling, dependencies,
diffs, terminal commands or reproducible verification. A substantial cross-cutting
investigation may be a durable `AN` work item. Analysis produces findings and
recommendations only; later implementation uses a separately approved `AB` item when
required.

## Lightweight Task Policy

Data- och analysportalen is an early-stage mockup/prototype (see
`docs/project/PROJECT_STATUS.md`). To keep overhead proportionate to that stage:

- **No work item needed:** generated build output (`frontend/dist/`), typo fixes in
  prose that do not change meaning, and reformatting that changes no behavior.
- **Lightweight handling allowed:** small, low-risk mockdata additions that follow an
  existing pattern exactly (a new service/system/guide entry using an existing
  `urlKey` scheme), minor non-behavioral styling polish, and small documentation
  clarifications that do not change a governing principle. Traceability rule: use a
  scoped, descriptive commit message that names the change; do not invent a second,
  untracked tracking system.
- **Always requires a standard work item:** anything touching the information model
  (`docs/03_Informationsmodell.md`), the configuration model or `urlKey`/`systemUrls`
  mechanism (`docs/05_Konfiguration.md`, `docs/13_Utvecklarguide.md`), security
  posture, architecture (`docs/04_Systemarkitektur.md`), a new page or feature area,
  Worksmith tooling itself, or any change that would need an ADR.
- **Escalation rule:** if a lightweight change grows in scope, risk or durable impact
  while in progress, stop and create a normal work item before continuing.

Never invent a second, parallel, untracked task-tracking system as a shortcut around
this policy.

## Missing Requested Context Gate

If a planning assistant requested required documents, files or context before
preparing a work-item manifest, **it must not prepare the manifest until that context
is provided, or the project owner explicitly approves proceeding without it.**

## 2. Preflight New Work

Before preparing a creation manifest, the planning assistant:

1. reads the current queue (`npm run project -- queue`);
2. performs a focused search for duplicate, related, dependent or completed work
   (`docs/work-items/`, `docs/WORK_QUEUE.md`);
3. reads `docs/project/DOCUMENT_INDEX.md` and identifies the permanent topic owners;
4. requests any relevant document that is unavailable and could change scope,
   architecture, constraints or acceptance criteria (see the gate above);
5. stops rather than guessing when missing authoritative context is material;
6. agrees purpose, deliverables, verification and explicit out-of-scope limits with
   the project owner.

## 3. Create And Start The Work Item

The planning assistant prepares one strict manifest following
`docs/project/WORK_ITEM_SCHEMA.md` with `"id": "auto"`. The project owner approves the
proposal; no assistant calculates or reserves the identifier.

```bash
npm run project -- create manifest.json
```

Preview and apply the start transition:

```bash
npm run project -- transition <id> ready in_progress --dry-run
npm run project -- transition <id> ready in_progress
```

Only one metadata-enabled item may be `in_progress`.

## 4. Prepare The Task Prompt

Each prompt owns one stage and states: role and active work item; intended outcome and
approved repository scope; only the documents and paths required for the task;
explicit prohibitions and out-of-scope work; authority limits and required
verification; the expected handoff and any assigned lifecycle operation.

## 5. Execute, Verify And Hand Off

The implementation agent implements only approved scope, preserves unrelated
working-tree changes, avoids metadata and queue edits except assigned CLI operations,
runs verification proportionate to the change, and returns a concise handoff
containing: result and changed files; verification commands and outcomes; deviations,
risks and unresolved limitations; permanent documentation impact (`updated`, `none` or
`follow-up required`); current lifecycle state; and only owner-controlled next actions.

## 6. Review And Move To Needs Review

```bash
npm run project -- transition <id> in_progress needs_review --dry-run
npm run project -- transition <id> in_progress needs_review
```

The reviewer checks scope, changed files, verification and permanent-document impact,
and returns `Approved` or `Changes Requested`.

## Topic Classification And Disposition

Adopt the topic/disposition convention using the registered vocabulary in
`.worksmith/topics.json` (see `npm run project -- topics`). In a work item's Markdown
body, use these plain-text labels (matched literally, not fuzzy):

```text
Primary topic: worksmith
Secondary topics: documentation
Disposition: accepted_now
Disposition note: Optional short clarification.
Follow-up: Optional comma-separated follow-up notes.
```

`Disposition` values are one of: `accepted_now`, `accepted_later`, `rejected`,
`parked`, `no_action`, `needs_more_analysis`. This convention is workflow-only and
forward-only: it documents classification going forward, it does not retroactively
reclassify older work items.

## 7. Complete, Commit And Deliver

```bash
npm run project -- complete <id> --approved --dry-run
npm run project -- complete <id> --approved
```

The CLI marks the item `done` but does not commit, push, deploy or upload. Git
operations remain manual and scoped. When permanent documentation changed, refresh any
active external assistant contexts per `docs/project/PROJECT_RULES.md`'s External
Project-Context Synchronization section (currently: none adopted).

## Definition Of Delivered

Work is fully delivered when approved scope and verification are complete, review and
owner approval are recorded, lifecycle state is synchronized, and applicable Git,
deployment, production verification and external-context handoff have been performed
or explicitly reported as pending.
