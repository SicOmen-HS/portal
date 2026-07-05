<!--
Non-authoritative template. Copy into your project as docs/project/PROJECT_WORKFLOW.md
(or an equivalent path), replace every <PLACEHOLDER>, remove sections that do not
apply, and delete this comment block.
-->

# <PROJECT_NAME> Project Workflow

## Purpose And Authority

This document owns the operational checklist for planning, work-item administration,
execution, review and delivery. `<GOVERNANCE_DOCUMENT_PATH>` owns durable governance.
`<SCHEMA_DOCUMENT_PATH>` owns metadata and manifest contracts.
`<ADMINISTRATION_DOCUMENT_PATH>` owns detailed CLI behavior.

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
investigation may be a durable `<ANALYSIS_PREFIX>` work item. Analysis produces
findings and recommendations only; later implementation uses a separately approved
`<IMPLEMENTATION_PREFIX>` item when required.

## Lightweight Task Policy

<PROJECT_NAME> may choose to allow small, low-risk changes to skip the full work-item
cycle. **This is project-owned policy, not a Worksmith default** — decide and document
your own risk-category matrix here if you want this. At minimum, decide and record:

- which task types need **no work item** at all (e.g. generated files);
- which task types may use **lightweight handling** (e.g. typo/copy fixes, tiny
  non-behavioral polish);
- which task types **always require a standard work item** (e.g. anything touching
  schema, security, deployment, or durable product behavior);
- the **traceability rule** for lightweight work (e.g. a scoped, descriptive commit
  message; reuse of an existing related item rather than a new untracked record);
- the **escalation rule**: if a lightweight change grows in scope, risk or durable
  impact while in progress, stop and create a normal work item before continuing.

Never invent a second, parallel, untracked task-tracking system as a shortcut around
this policy.

## Missing Requested Context Gate

If a planning assistant requested required documents, files or context before
preparing a work-item manifest, **it must not prepare the manifest until that context
is provided, or the project owner explicitly approves proceeding without it.**

## 2. Preflight New Work

Before preparing a creation manifest, the planning assistant:

1. reads the current queue;
2. performs a focused search for duplicate, related, dependent or completed work;
3. reads `<DOCUMENT_INDEX_PATH>` and identifies the permanent topic owners;
4. requests any relevant document that is unavailable and could change scope,
   architecture, constraints or acceptance criteria (see the gate above);
5. stops rather than guessing when missing authoritative context is material;
6. agrees purpose, deliverables, verification and explicit out-of-scope limits with
   the project owner.

## 3. Create And Start The Work Item

The planning assistant prepares one strict manifest following
`<SCHEMA_DOCUMENT_PATH>` with `"id": "auto"`. The project owner approves the proposal;
no assistant calculates or reserves the identifier.

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

## Topic Classification And Disposition (Optional)

<OPTIONAL: if you adopt a topic/disposition convention (see `.worksmith/topics.json`
and the `topics`/`disposition-report`/`handoff` commands), document your own
`Primary topic:`, `Secondary topics:`, `Disposition:`, `Disposition note:` and
`Follow-up:` label convention here, following the same workflow-only, forward-only
shape ArmBase uses. This is entirely optional — omit this section if you do not adopt
topic classification.>

## 7. Complete, Commit And Deliver

```bash
npm run project -- complete <id> --approved --dry-run
npm run project -- complete <id> --approved
```

The CLI marks the item `done` but does not commit, push, deploy or upload. Git
operations remain manual and scoped. When permanent documentation changed, refresh any
active external assistant contexts per your own external-context policy.

## Definition Of Delivered

Work is fully delivered when approved scope and verification are complete, review and
owner approval are recorded, lifecycle state is synchronized, and applicable Git,
deployment, production verification and external-context handoff have been performed
or explicitly reported as pending.
