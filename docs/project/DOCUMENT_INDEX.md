# Data- och analysportalen Documentation Index

Last reviewed: `2026-07-05`

## Read First

Start with [PROJECT_RULES.md](PROJECT_RULES.md). Read the active work record when one
exists (`docs/WORK_QUEUE.md`, `docs/work-items/`). Use this index to select only the
additional documents needed for the current task.

Repository documents are authoritative. External copies are discovery aids.

## Why This Index Exists

`docs/` contains 15 detailed reference documents (`00_Projektprinciper.md` through
`14_Rekommenderade_extensions.md`), totaling roughly 280 KB of Swedish-language
governing text. Reading all of it for every small change would be disproportionate
context load for a routine task. This index is the lightweight routing layer: it says
which reference document owns which topic, and — critically — **which documents to
read for which kind of change**, so an assistant or developer reads only what the task
actually needs.

The reference documents themselves are **not** shortened, removed or replaced by this
index or by anything under `docs/project/`. They remain the durable, detailed source
of truth. `docs/project/` and `docs/development/PROJECT_ADMINISTRATION.md` are a
lighter, operational layer that routes to them.

## Governance And Ownership

| Concern | Authoritative document | Notes |
| --- | --- | --- |
| Project governance | [PROJECT_RULES.md](PROJECT_RULES.md) | Compact, durable rules; summarizes `docs/00_Projektprinciper.md`. |
| Current project state | [PROJECT_STATUS.md](PROJECT_STATUS.md) | What phase and priorities are true right now. |
| Decisions | [DECISIONS.md](DECISIONS.md) | Durable product/architecture/documentation-strategy decisions. |
| Operational workflow | [PROJECT_WORKFLOW.md](PROJECT_WORKFLOW.md) | How to create, run and close a Worksmith work item. |
| Worksmith CLI reference | [../development/PROJECT_ADMINISTRATION.md](../development/PROJECT_ADMINISTRATION.md) | Full command list, safety rules, known bootstrap limitations. |

## Situation Guide

Use this table to decide **what to read before making a change**. Always read
`PROJECT_RULES.md` first (it is short); then add only the rows that match the change.

| Situation | Read | Related context |
| --- | --- | --- |
| Any frontend/UI change (new page, component, styling) | [`docs/06_Utvecklingsprinciper.md`](../06_Utvecklingsprinciper.md), [`docs/12_Designsystem_och_UI.md`](../12_Designsystem_och_UI.md), [`docs/13_Utvecklarguide.md`](../13_Utvecklarguide.md) | `frontend/README.md` |
| Change to the information model (a new/changed object, field, or relation) | [`docs/03_Informationsmodell.md`](../03_Informationsmodell.md), [`docs/11_ADR_mall.md`](../11_ADR_mall.md) | `frontend/src/app/models/` |
| New or changed mockdata (service, system, guide, order, dataset...) | [`frontend/public/assets/mock/README.md`](../../frontend/public/assets/mock/README.md), [`docs/03_Informationsmodell.md`](../03_Informationsmodell.md) | `docs/13_Utvecklarguide.md#lägga-till-ny-tjänst` |
| New systemlänk / documentation link / `urlKey` | [`docs/13_Utvecklarguide.md`](../13_Utvecklarguide.md), [`frontend/public/assets/config/README.md`](../../frontend/public/assets/config/README.md) | `docs/05_Konfiguration.md` |
| Configuration or runtime-config change | [`docs/05_Konfiguration.md`](../05_Konfiguration.md), [`docs/08_Lokal_utvecklingsmiljö.md`](../08_Lokal_utvecklingsmiljö.md) | `config/README.md` |
| Architecture change (new framework, backend, database, integration principle) | [`docs/04_Systemarkitektur.md`](../04_Systemarkitektur.md), [`docs/11_ADR_mall.md`](../11_ADR_mall.md) | Requires an ADR — see `docs/project/PROJECT_RULES.md` |
| Concept/information-model or user-terminology change (e.g. what a user-facing type is called) | [`docs/11_ADR_mall.md`](../11_ADR_mall.md), existing records under `docs/adr/`, [`docs/03_Informationsmodell.md`](../03_Informationsmodell.md) | Requires an ADR under `docs/adr/` — see ADR-0001 for the pattern |
| AI-assisted development, what an AI agent may/may not do | [`docs/07_AI_Instruktioner.md`](../07_AI_Instruktioner.md), `AGENTS.md` | `docs/project/PROJECT_RULES.md` |
| Local development environment setup | [`docs/08_Lokal_utvecklingsmiljö.md`](../08_Lokal_utvecklingsmiljö.md) | `frontend/README.md`, root `README.md` |
| Testing strategy or new tests | [`docs/09_Teststrategi.md`](../09_Teststrategi.md) | `docs/13_Utvecklarguide.md#test-och-verifiering` |
| Release or deployment | [`docs/10_Release_och_deployment.md`](../10_Release_och_deployment.md) | — |
| Recommended editor/tooling extensions | [`docs/14_Rekommenderade_extensions.md`](../14_Rekommenderade_extensions.md) | `.vscode/extensions.json` |
| Worksmith / work-item process itself | [`PROJECT_WORKFLOW.md`](PROJECT_WORKFLOW.md), [`WORK_ITEM_SCHEMA.md`](WORK_ITEM_SCHEMA.md), [`../development/PROJECT_ADMINISTRATION.md`](../development/PROJECT_ADMINISTRATION.md) | — |

Add a row only when it materially improves discovery. One topic should have one clear
owner; related documents must not silently compete with it.

## Folder Map

| Folder | Contents | Authority |
| --- | --- | --- |
| `docs/` | Detailed reference documentation (`00`–`14`), always the durable source. | Authoritative reference. |
| `docs/adr/` | Architecture Decision Records, numbered sequentially per `docs/11_ADR_mall.md`. | Authoritative record of an individual accepted/proposed decision; never renumbered or silently rewritten. |
| `docs/project/` | Lightweight operational governance (this index and its siblings). | Summarizes and routes; never contradicts `docs/`. |
| `docs/development/` | Worksmith CLI reference (`PROJECT_ADMINISTRATION.md`). | Authoritative for CLI behavior/commands. |
| `docs/work-items/` | Individual Worksmith work items (created by `npm run project -- create`). | Historical/operational record, not policy. |
| `docs/WORK_QUEUE.md` | The Worksmith work queue (created by `npm run project -- init`). | Operational record, not policy. |
| `config/` | Example/template configuration for a future backend and for the frontend runtime config. | Templates only; see `config/README.md`. |
| `frontend/` | The Angular mockup application. | `frontend/README.md`, `docs/13_Utvecklarguide.md`. |
| `scripts/` | Worksmith Project Administration CLI (copied from `tools/worksmith/core/`). | `docs/development/PROJECT_ADMINISTRATION.md`. |
| `tools/worksmith/` | The Worksmith distribution kit itself (installation material). | `tools/worksmith/README.md`; not consulted again after install except for future core updates. |

## Permanent Documents

### Reference (durable, detailed)

| Document | Purpose | Read when | Dependencies |
| --- | --- | --- | --- |
| [`docs/00_Projektprinciper.md`](../00_Projektprinciper.md) | Foundational project principles | Any non-trivial decision | — |
| [`docs/01_Projektvision.md`](../01_Projektvision.md) | Why the portal exists | Onboarding, scoping new services | — |
| [`docs/02_Verksamhetsbeskrivning.md`](../02_Verksamhetsbeskrivning.md) | Business/domain description | Onboarding, new domain content | — |
| [`docs/03_Informationsmodell.md`](../03_Informationsmodell.md) | Information model / core objects | Model or mockdata change | — |
| [`docs/04_Systemarkitektur.md`](../04_Systemarkitektur.md) | System architecture | Architecture change, ADR | `docs/11_ADR_mall.md` |
| [`docs/05_Konfiguration.md`](../05_Konfiguration.md) | Configuration principles | Config or secrets-adjacent change | `docs/13_Utvecklarguide.md` |
| [`docs/06_Utvecklingsprinciper.md`](../06_Utvecklingsprinciper.md) | Development principles | Any code change | — |
| [`docs/07_AI_Instruktioner.md`](../07_AI_Instruktioner.md) | AI usage rules | Any AI-assisted change | `AGENTS.md` |
| [`docs/08_Lokal_utvecklingsmiljö.md`](../08_Lokal_utvecklingsmiljö.md) | Local dev environment | Environment/setup change | — |
| [`docs/09_Teststrategi.md`](../09_Teststrategi.md) | Test strategy | New tests, test policy change | — |
| [`docs/10_Release_och_deployment.md`](../10_Release_och_deployment.md) | Release/deployment | Deployment-related change | — |
| [`docs/11_ADR_mall.md`](../11_ADR_mall.md) | ADR template and process | Any architecture decision | — |
| [`docs/12_Designsystem_och_UI.md`](../12_Designsystem_och_UI.md) | Design system and UI rules | Any UI/visual change | — |
| [`docs/13_Utvecklarguide.md`](../13_Utvecklarguide.md) | Practical developer guide | Adding a page/service/component/link | `docs/03`, `docs/12` |
| [`docs/14_Rekommenderade_extensions.md`](../14_Rekommenderade_extensions.md) | Recommended editor extensions | Onboarding | — |

### Architecture Decision Records (`docs/adr/`)

| Document | Purpose | Read when | Dependencies |
| --- | --- | --- | --- |
| [`docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`](../adr/0001-dataprodukt-som-anvandarbegrepp.md) | Decision: "Dataprodukt" is the primary user term; "Information Mart" is secondary technical metadata | Any change touching Dataprodukt/Information Mart language or the underlying model | `docs/03_Informationsmodell.md`, `docs/11_ADR_mall.md` |

### Operational (lightweight, frequently read)

| Document | Purpose | Read when | Dependencies |
| --- | --- | --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | AI-agent discovery entrypoint | Start of every AI-assisted session | This index |
| [`PROJECT_RULES.md`](PROJECT_RULES.md) | Compact governance rules | Start of most tasks | `docs/00_Projektprinciper.md` |
| [`PROJECT_WORKFLOW.md`](PROJECT_WORKFLOW.md) | Work-item lifecycle checklist | Creating/running/closing a work item | `WORK_ITEM_SCHEMA.md` |
| [`WORK_ITEM_SCHEMA.md`](WORK_ITEM_SCHEMA.md) | Work-item manifest/metadata contract | Preparing a creation manifest | `scripts/project-administration/configuration.ts` |
| [`PROJECT_STATUS.md`](PROJECT_STATUS.md) | Current phase and priorities | When current state affects the task | — |
| [`DECISIONS.md`](DECISIONS.md) | Durable decision log | Understanding why something is the way it is | — |
| [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | One-page orientation | New collaborator/session, fast orientation | Links to all of the above |
| [`../development/PROJECT_ADMINISTRATION.md`](../development/PROJECT_ADMINISTRATION.md) | Worksmith CLI command reference | Running any `npm run project -- ...` command | — |

## Templates And Examples

`tools/worksmith/` (kit: `scaffold/`, `examples/`, `core/`) is one-time installation
material, not active project documentation. It has already been applied — its
templates may be deleted or ignored; nothing in Worksmith reads them again except a
future core update. Treat any content there as non-authoritative for this project.

## Operational And Historical Records

- `docs/WORK_QUEUE.md` — the current work queue, grouped by lifecycle section. Created
  by `npm run project -- init`. Not policy; reflects current state only.
- `docs/work-items/*.md` — individual work items. Completed (`done`) items are
  immutable project history and must not be edited except for an explicitly approved
  correction of an obvious spelling/formatting error.
- `.worksmith/topics.json` — the registered topic vocabulary (project-owned
  configuration, not documentation).
- `.worksmith.json` — presentation configuration (language, output target, shell);
  project-owned configuration, not documentation.

## Maintenance Checklist

When a permanent document is created, changed, moved, renamed, removed or superseded:

1. verify its authority and classification (reference vs. operational);
2. update its catalog entry and Situation Guide route in this index;
3. verify links and dependencies;
4. remove or redirect obsolete competing guidance; and
5. report whether external project-context copies must be refreshed (currently: none
   adopted, see `PROJECT_RULES.md`).
