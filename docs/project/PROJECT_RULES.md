# Data- och analysportalen Project Rules

## Purpose And Scope

This document is the compact normative governance entrypoint for Data- och
analysportalen. It contains durable authority boundaries, project invariants,
work-item principles and documentation governance.

It should contain rules that apply across many tasks and remain valid over time. It
should not contain detailed CLI command reference, step-by-step lifecycle instructions,
deployment procedures or schema field definitions — those belong respectively in
`docs/project/PROJECT_WORKFLOW.md`, `docs/development/PROJECT_ADMINISTRATION.md` and
`docs/project/WORK_ITEM_SCHEMA.md`.

When documents conflict, this file governs project policy; the detailed reference
documentation in `docs/00_Projektprinciper.md` through `docs/14_Rekommenderade_extensions.md`
is the authoritative source this file summarizes; `docs/project/WORK_ITEM_SCHEMA.md`
governs the work-item machine contract; implemented code governs current tool
behavior. A conflict must be reported and resolved through approved work, not
interpreted silently.

## Documentation Discovery

Documentation is a navigation and decision aid, not an implementation dependency. Read
only what the current task requires.

1. Read this governance entrypoint.
2. Read the active work item when one exists.
3. Use `docs/project/DOCUMENT_INDEX.md` to locate the owner of the relevant topic
   (which routes to a specific `docs/0X_*.md` reference document when needed).
4. Read `docs/project/PROJECT_STATUS.md` when current phase, capability or priority
   affects the task.
5. For administration or delivery, follow `docs/project/PROJECT_WORKFLOW.md` and
   consult detailed CLI or schema documents only when needed.

Do not preload documentation "just in case." Stop discovery once sufficient
authoritative context exists. If required context is unavailable, request the
applicable document before relying on its content — never guess what it says.

## Project Direction

Data- och analysportalen builds an internal portal that is the natural entry point to
the "Data- och analysportalen" delivery: a single, needs-driven place to find
services, systems, documentation, datasets, order flows and contact paths, without
requiring the user to know the underlying organization or technology
(`docs/01_Projektvision.md`, `docs/02_Verksamhetsbeskrivning.md`).

Priority order:

1. Säkerhet först (security first) — the repository must stay generic and free of
   secrets, internal URLs, certificates, connection strings, real AD groups,
   personal data or production data (`docs/00_Projektprinciper.md`, principle 1).
2. Konfiguration före kod (configuration before code) — environment-dependent values
   are never hardcoded; they flow through runtime configuration and content keys
   (`docs/00_Projektprinciper.md`, principle 2; `docs/05_Konfiguration.md`;
   `docs/13_Utvecklarguide.md`).
3. Innehåll före implementation (content before implementation) — adding a new
   service, guide, system link or order type should normally be a content/mockdata
   change, not new application code (`docs/00_Projektprinciper.md`, principle 3).

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

- Organize work into small, reviewable work items with explicit scope
  (`docs/06_Utvecklingsprinciper.md`).
- Avoid unrelated changes and finish an approved work package before expanding its
  scope.
- The current CLI permits only one metadata-enabled `in_progress` item, so related
  items remain sequential unless separately approved tooling changes that constraint.
- Prefer small commits and pull requests, clear names, reuse and consistent patterns.
- Do not convert anticipated edge cases into permanent rules without observed need.

## Git And Branches

- Active repository development normally takes place on a separate branch, not
  directly on `main`.
- Use one branch per Worksmith work item or other clearly bounded and reviewable unit
  of work. Branches are not permanent personal development branches.
- When a work item exists, its identifier must appear in the branch name.
- Changes normally reach `main` through a pull request and review before merge.
  `main` represents the latest approved and verified version.
- Keep branches small and short-lived, and remove them after an approved merge.
- Commit, push, rebase, merge, force-push and other Git operations are manual and
  project-owner controlled. Worksmith neither performs nor approves them.

## Copyable Deliveries

A finished prompt, handoff, manifest text, instruction or coherent command sequence
must be delivered as one complete, self-contained and easily copyable block. Put any
explanation before or after the block, never inside it. Instructions belonging to the
same delivery must not be spread across comments or separate blocks, and a coherent
delivery must not be split into several blocks merely for visual readability. The
block must contain all context the recipient needs without manually joining multiple
parts. This applies especially to content copied to Codex, Claude Code or other
implementation agents.

## Architecture And Code Principles

Current state (see `docs/project/PROJECT_STATUS.md` and `docs/04_Systemarkitektur.md`
for full detail):

- **Frontend (built):** Angular (standalone components, signals), TypeScript,
  Bootstrap 5 + SCSS design tokens. Lives entirely under `frontend/`.
- **Backend (target, not yet implemented):** .NET Web API, C#, REST APIs.
- **Application database (target, not yet implemented):** PostgreSQL, used only for
  the portal's own content — never the organization's data platform.
- **Current mockup:** no backend, no database and no real integrations exist yet.
  All content is fictional mockdata under `frontend/public/assets/mock/`, and all
  external links are resolved through the `urlKey`/`systemUrls` mechanism described in
  `docs/13_Utvecklarguide.md` — never hardcoded.
- Code is written in English; UI text and project documentation are written in
  Swedish (`docs/06_Utvecklingsprinciper.md`).
- New or materially changed UI must work on mobile, tablet and desktop, must not
  depend on hover for core functionality, and must be reviewed at roughly 375px,
  768px and desktop width (`docs/12_Designsystem_och_UI.md`).

Introducing a new framework, a database strategy, an authentication solution, a new
integration principle or a deployment model requires an ADR
(`docs/11_ADR_mall.md`).

## Data Integrity And Domain Principles

- The information model (`docs/03_Informationsmodell.md`) is the single source of
  concepts (`ServiceOffering`, `System`, `SystemLink`, `Guide`, `OrderType`,
  `Dataset`, `ContactPoint`, `StatusItem`, etc.). Do not invent a parallel concept
  when an existing one already covers the need.
- All mockdata is fictional. It must never contain real internal URLs, real AD
  groups, personal data or production data
  (`docs/05_Konfiguration.md`, `frontend/public/assets/mock/README.md`).
- System, guide, order and Information Mart links are always expressed as a content
  key (`urlKey` / `documentationUrlKey` / `linkKey`), resolved against
  `frontend/public/assets/config/runtime-config.json`'s `systemUrls` map — never as a
  literal URL in a component or mock file (`docs/13_Utvecklarguide.md`).

## Work-Item Governance

Project Administration CLI (Worksmith) is the production administration workflow for
new work items. Changes to its behavior, schema, lifecycle or validation require an
explicitly approved work item.

Work-item prefixes describe the primary deliverable:

- `AB` — implementation, including approved documentation implementation;
- `AN` — analysis, design and investigations producing findings and recommendations
  only;
- `IM` — reserved for future infrastructure/environment or import/migration-type work
  (for example, a future integration adapter or data-import batch). Not currently in
  active use; do not repurpose it for ordinary implementation work — use `AB` instead.

Identifiers are unique and never reused or renumbered. Completed work items are
immutable project history except for an explicitly approved correction of an obvious
spelling or formatting error. New knowledge or follow-up implementation requires a new
work item.

New work items use the metadata contract in `docs/project/WORK_ITEM_SCHEMA.md`.
Existing items without metadata are legacy records and must not be retrofitted. The
current CLI permits only one metadata-enabled `in_progress` item.

## Definition Of Done

Approved scope is not fully delivered until its deliverables and verification are
complete, the result is reviewed and approved, lifecycle state is synchronized, and
applicable Git, deployment, production verification, documentation-index and
external-context handoff has been addressed. This aligns with the broader Definition
of Done in `docs/00_Projektprinciper.md` and `docs/06_Utvecklingsprinciper.md`: the
change must meet the actual need, follow project principles, be secure, be
configuration-driven where relevant, contain no secrets or company-specific
information, be tested to a relevant extent, be documented where needed, build
locally, and avoid unnecessary complexity.

## Documentation Governance

Permanent documentation is manually maintained, reusable project knowledge that
remains relevant beyond one work item. Every permanent document must be listed
individually in `docs/project/DOCUMENT_INDEX.md`.

The following are excluded from the permanent-document catalog unless the project
owner explicitly adopts them: the work queue, files under the work-items directory,
temporary notes, manifests, experiments and disposable artifacts, and generated
output.

The pre-existing reference documentation (`docs/00_Projektprinciper.md` through
`docs/14_Rekommenderade_extensions.md`) remains the durable, detailed source of
project principles, vision, information model, architecture, configuration,
development, AI, local-environment, testing, release, ADR, design-system and
developer-guide policy. This document and the rest of `docs/project/` never replace
or override it — they route to it and summarize only what recurring, small-task work
needs on a given day.

## External Project-Context Synchronization

No external assistant context (ChatGPT Projects, Claude Projects or similar) is
currently adopted for this project. If one is adopted later, list here which
documents must be kept synchronized there ("Required Maintained Copies"), which are
provided on demand, and which remain repository-only by default. The repository
always remains authoritative regardless of upload state.
