# Data- och analysportalen Work Item Metadata Contract

## Purpose

This document defines the machine-readable contract used by the Project
Administration CLI (Worksmith) to create and validate work items, allocate
identifiers and synchronize lifecycle state with the work queue, without interpreting
free-form Markdown.

## Scope And Versioning

The initial contract version is `1`.

- Producers shall emit `schema_version: 1`.
- Consumers shall reject unsupported versions and unknown fields.
- A breaking field or behavior change requires a new schema version.
- Existing completed work items are legacy records and are not migrated to this
  contract.

## Work Item Metadata Block

New machine-managed work items shall contain exactly one metadata block directly
after the level-one title, using fixed, case-sensitive sentinels defined in
`scripts/project-administration/configuration.ts` (unchanged from the Worksmith kit):

```markdown
# AB-001 - Example Work Item

<!-- ARMBASE_WORK_ITEM_METADATA_START
{
  "schema_version": 1,
  "id": "AB-001",
  "prefix": "AB",
  "title": "Example Work Item",
  "status": "ready",
  "created_on": "2026-07-04",
  "completed_on": null
}
ARMBASE_WORK_ITEM_METADATA_END -->
```

The sentinel text (`ARMBASE_WORK_ITEM_METADATA_START` / `_END`) is inherited verbatim
from the copied Worksmith core and is not project-specific branding — it is a fixed
machine marker the validator and CLI look for. Do not change it; doing so would
require also changing `scripts/project-administration/configuration.ts` and the
copied regression test suite, which is deliberately kept byte-identical to the
distributed kit (see `docs/development/PROJECT_ADMINISTRATION.md`).

The content between the sentinels is strict JSON: comments, trailing commas,
duplicate keys and additional prose are invalid.

### Required Fields

| Field | Type | Rules |
| --- | --- | --- |
| `schema_version` | integer | Must be `1`. |
| `id` | string | `PREFIX` plus 3-5 digits, e.g. `AB-001`. |
| `prefix` | string | Must be `AB`, `AN` or `IM` and match `id`. |
| `title` | string | A trimmed single-line value matching the level-one title. |
| `status` | string | One supported lifecycle status. |
| `created_on` | string | ISO date in `YYYY-MM-DD`, using the `Europe/Stockholm` project timezone. |
| `completed_on` | string or null | Must be null before completion and an ISO date when status is `done`. |

## Prefixes

| Prefix | Purpose |
| --- | --- |
| `AB` | Implementation, including approved documentation implementation. |
| `AN` | Analysis, design and investigations that produce findings and recommendations only. |
| `IM` | Reserved for future infrastructure/environment or import/migration-type work. Not currently in active use. |

## Lifecycle Statuses

The current Worksmith engine ships with this fixed seven-state model; changing it is a
behavioral change requiring its own approved work, not a per-project configuration
choice for the first bootstrap version:

| Status | Meaning |
| --- | --- |
| `inbox` | Captured but not classified or prioritized. |
| `backlog` | Valid future work that is not ready to start. |
| `parking_lot` | Deferred work without an active schedule. |
| `ready` | Approved and sufficiently specified for execution. |
| `in_progress` | The single work item currently being executed. |
| `needs_review` | Implementation is complete and awaiting review or approval. |
| `done` | Approved and completed; terminal and immutable. |

Only one metadata-enabled item may be `in_progress` at a time.

## Manifest Contract For `npm run project -- create`

A creation manifest (passed as a file path to `create`) must be strict JSON with
exactly these top-level fields:

```json
{
  "schema_version": 1,
  "operation": "create_work_item",
  "work_item": {
    "id": "auto",
    "prefix": "AB",
    "title": "Example Work Item",
    "initial_status": "ready",
    "created_on": "2026-07-04",
    "sections": {
      "background": ["..."],
      "goal": ["..."],
      "scope": ["..."],
      "requirements": ["..."],
      "verification": ["..."],
      "acceptance_criteria": ["..."],
      "out_of_scope": ["..."],
      "deliverables": ["..."]
    }
  },
  "documentation": { "changes": [] },
  "git": { "commit_message": "...", "commit": false, "push": false }
}
```

`sections.background` and `sections.goal` are rendered as paragraphs (joined with a
blank line); every other section is rendered as a Markdown bullet list. All eight
sections are required and each must be a non-empty array of non-empty, trimmed
strings. `git.commit` and `git.push` must both be `false` — the CLI never commits,
pushes or deploys; Git operations remain a manual, owner-approved step.

## Legacy Work Items

A work item without the fixed metadata sentinels is a legacy work item:

- Completed legacy items remain immutable project history.
- Metadata shall not be retrofitted into completed items.
- Historical identifiers shall never be reused or renumbered.
- Validators may report legacy inconsistencies but shall not repair them.

## Manual Responsibilities

The project owner remains responsible for: selecting the prefix, title, priority and
intended lifecycle destination; approving work-item scope and implementation results;
authorizing the transition to `done`; resolving ambiguous document classification; and
authorizing Git commit, push, deployment and external-system changes. A planning
assistant may prepare a manifest and review results, but shall not claim project-owner
approval or synchronization that has not been confirmed.
