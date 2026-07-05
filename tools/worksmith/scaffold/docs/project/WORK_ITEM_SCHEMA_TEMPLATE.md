<!--
Non-authoritative template. Copy into your project as
docs/project/WORK_ITEM_SCHEMA.md (or an equivalent path), replace every
<PLACEHOLDER>, and delete this comment block. Keep the values here consistent with
scripts/project-administration/configuration.ts in your copied codebase — this
document must describe the same contract the code actually enforces.
-->

# <PROJECT_NAME> Work Item Metadata Contract

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
after the level-one title, using fixed, case-sensitive sentinels
(`<METADATA_START_SENTINEL>` / `<METADATA_END_SENTINEL>`):

```markdown
# <IMPLEMENTATION_PREFIX>-200 - Example Work Item

<!-- <METADATA_START_SENTINEL>
{
  "schema_version": 1,
  "id": "<IMPLEMENTATION_PREFIX>-200",
  "prefix": "<IMPLEMENTATION_PREFIX>",
  "title": "Example Work Item",
  "status": "ready",
  "created_on": "<YYYY-MM-DD>",
  "completed_on": null
}
<METADATA_END_SENTINEL> -->
```

The content between the sentinels is strict JSON: comments, trailing commas,
duplicate keys and additional prose are invalid.

### Required Fields

| Field | Type | Rules |
| --- | --- | --- |
| `schema_version` | integer | Must be `1`. |
| `id` | string | `<PREFIX>` plus digits, per your configured identifier width. |
| `prefix` | string | Must match one of your configured prefixes and match `id`. |
| `title` | string | A trimmed single-line value matching the level-one title. |
| `status` | string | One supported lifecycle status. |
| `created_on` | string | ISO date in `YYYY-MM-DD` using your project timezone. |
| `completed_on` | string or null | Must be null before completion and an ISO date when status is `done`. |

## Prefixes

Choose your own prefixes; the following is an example, not a requirement:

| Prefix | Purpose |
| --- | --- |
| `<IMPLEMENTATION_PREFIX>` | Implementation, including approved documentation implementation. |
| `<ANALYSIS_PREFIX>` | Analysis, design and investigations that produce findings and recommendations only. |
| `<OTHER_PREFIX_IF_ANY>` | <PURPOSE, e.g. historical import batches> |

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
