<!--
Non-authoritative template. Copy into your project as docs/project/PROJECT_RULES.md
(or an equivalent path), replace every <PLACEHOLDER>, remove sections that do not
apply, and delete this comment block. This file must become your project's own
governing document — do not leave placeholder text in an active copy.
-->

# <PROJECT_NAME> Project Rules

## Purpose And Scope

This document is the compact normative governance entrypoint for <PROJECT_NAME>. It
contains durable authority boundaries, project invariants, work-item principles and
documentation governance.

It should contain rules that apply across many tasks and remain valid over time. It
should not contain detailed CLI command reference, step-by-step lifecycle instructions,
deployment procedures or schema field definitions — those belong respectively in
`<WORKFLOW_DOCUMENT_PATH>`, `<ADMINISTRATION_DOCUMENT_PATH>` and
`<SCHEMA_DOCUMENT_PATH>`.

When documents conflict, this file governs project policy; `<SCHEMA_DOCUMENT_PATH>`
governs its machine contract; implemented code governs current tool behavior. A
conflict must be reported and resolved through approved work, not interpreted silently.

## Documentation Discovery

Documentation is a navigation and decision aid, not an implementation dependency. Read
only what the current task requires.

1. Read this governance entrypoint.
2. Read the active work item when one exists.
3. Use `<DOCUMENT_INDEX_PATH>` to locate the owner of the relevant topic.
4. Read `<PROJECT_STATUS_PATH>` when current phase, capability or priority affects the
   task.
5. For administration or delivery, follow `<WORKFLOW_DOCUMENT_PATH>` and consult
   detailed CLI or schema documents only when needed.

Do not preload documentation "just in case." Stop discovery once sufficient
authoritative context exists. If required context is unavailable, request the
applicable document before relying on its content — never guess what it says.

## Project Direction

<PROJECT_NAME> builds <ONE_OR_TWO_SENTENCE_PRODUCT_SUMMARY>.

Priority order:

1. <PRIORITY_1>
2. <PRIORITY_2>
3. <PRIORITY_3>

## Authority Boundaries

- The project owner approves priorities, scope, completion, Git operations,
  deployment and external-context changes.
- A planning assistant may prepare work items, prompts and reviews but may not claim
  project-owner approval, invent allocated identifiers or authorize external actions.
- An implementation agent may change only the approved scope and must report
  verification, deviations and unresolved risks.
- The Project Administration CLI (Worksmith) owns deterministic metadata-enabled
  work-item allocation and lifecycle synchronization. Manual edits must not compete
  with a successful CLI transaction.

The repository is the source of truth. Copies supplied to external assistant contexts
are synchronized discovery aids and never override the repository.

## Working Principles

- Organize work into small, reviewable work items with explicit scope.
- Avoid unrelated changes and finish an approved work package before expanding its
  scope.
- The current CLI permits only one metadata-enabled `in_progress` item, so related
  items remain sequential unless separately approved tooling changes that constraint.
- Prefer small commits and pull requests, clear names, reuse and consistent patterns.
- Do not convert anticipated edge cases into permanent rules without observed need.

## Architecture And Code Principles

<OPTIONAL: list your current architecture/stack here, e.g. language, framework,
database, hosting. Keep it factual and current; this is the kind of content that must
never be copied from another project's version of this document.>

## Data Integrity And Domain Principles

<OPTIONAL: if your project has domain data with integrity rules (e.g. imported
evidence, immutable raw values, review workflows), describe them here. Delete this
section if it does not apply.>

## Work-Item Governance

Project Administration CLI (Worksmith) is the production administration workflow for
new work items. Changes to its behavior, schema, lifecycle or validation require an
explicitly approved work item.

Work-item prefixes describe the primary deliverable:

- `<IMPLEMENTATION_PREFIX>` — implementation, including approved documentation
  implementation;
- `<ANALYSIS_PREFIX>` — analysis, design and investigations producing findings and
  recommendations only;
- `<OTHER_PREFIX_IF_ANY>` — <PURPOSE>.

Identifiers are unique and never reused or renumbered. Completed work items are
immutable project history except for an explicitly approved correction of an obvious
spelling or formatting error. New knowledge or follow-up implementation requires a new
work item.

New work items use the metadata contract in `<SCHEMA_DOCUMENT_PATH>`. Existing items
without metadata are legacy records and must not be retrofitted. The current CLI
permits only one metadata-enabled `in_progress` item.

## Definition Of Done

Approved scope is not fully delivered until its deliverables and verification are
complete, the result is reviewed and approved, lifecycle state is synchronized, and
applicable Git, deployment, production verification, documentation-index and
external-context handoff has been addressed.

## Documentation Governance

Permanent documentation is manually maintained, reusable project knowledge that
remains relevant beyond one work item. Every permanent document must be listed
individually in `<DOCUMENT_INDEX_PATH>`.

The following are excluded from the permanent-document catalog unless the project
owner explicitly adopts them: the work queue, files under the work-items directory,
temporary notes, manifests, experiments and disposable artifacts, and generated
output.

## External Project-Context Synchronization

<OPTIONAL: if you use external assistant contexts (ChatGPT Projects, Claude Projects
or similar), list which documents must be kept synchronized there ("Required
Maintained Copies"), which are provided on demand, and which remain repository-only by
default. The repository always remains authoritative regardless of upload state.>
