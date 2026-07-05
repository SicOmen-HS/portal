# Data- och analysportalen Project Context

Last reviewed: `2026-07-04`

## Purpose

Data- och analysportalen is an internal portal that will become the natural entry
point to the "Data- och analysportalen" delivery: a single, needs-driven place to
find services, systems, documentation, datasets, order flows, status and contact
paths, without requiring the user to already know the organization or technology
behind them. This repository currently contains a local, runnable Angular mockup of
that portal plus its full governing documentation.

## Current State

- Phase: early mockup / prototype (no backend, no database, no real integrations).
- Primary objective: a clear, generic, configuration-driven, handoff-ready mockup that
  demonstrates structure, navigation and content without needing the company's
  internal environment.
- Current capabilities: full Angular frontend (10 pages/areas), fictional mockdata for
  every information object, a `urlKey`-based link-resolution mechanism, layered
  documentation (reference + operational), Worksmith work-item tooling.
- Current limitations: no backend/.NET API, no PostgreSQL application database, no
  real system integrations, no authentication.

Authoritative current state: [PROJECT_STATUS.md](PROJECT_STATUS.md).

## Durable Boundaries

- The repository must stay generic: no internal URLs, secrets, certificates,
  connection strings, real AD groups, personal data or production data
  (`docs/00_Projektprinciper.md`, `docs/05_Konfiguration.md`).
- Frontend never connects directly to a database or internal system; when a backend
  exists, all such access goes through it (`docs/04_Systemarkitektur.md`).
- Every system, documentation and order-form link is resolved through a content key
  (`urlKey`/`documentationUrlKey`/`linkKey`) against runtime configuration — never
  hardcoded (`docs/13_Utvecklarguide.md`).
- Code is English; UI text and documentation are Swedish
  (`docs/06_Utvecklingsprinciper.md`).

Do not copy long policy text here. Link each boundary to its owner when the statement
cannot remain safely summarized.

## Technical Orientation

| Area | Current choice | Detail owner |
| --- | --- | --- |
| Application | Angular (standalone, signals) + Bootstrap 5/SCSS | `docs/04_Systemarkitektur.md`, `docs/13_Utvecklarguide.md` |
| Data | Fictional local mockdata (JSON); no database yet | `frontend/public/assets/mock/README.md` |
| Delivery | Local `npm start` only; no deployment pipeline yet | `docs/10_Release_och_deployment.md` |

## Authority And Discovery

- Governance: [PROJECT_RULES.md](PROJECT_RULES.md)
- Documentation index: [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md)
- Decisions: [DECISIONS.md](DECISIONS.md)
- Operational workflow: [PROJECT_WORKFLOW.md](PROJECT_WORKFLOW.md)
- Active work: `npm run project -- queue`, or browse `docs/WORK_QUEUE.md` /
  `docs/work-items/`

Repository documents are authoritative. Supplied external copies are discovery aids
and may be stale.

## Prompt Routing

- For planning: read `PROJECT_RULES.md` and `DOCUMENT_INDEX.md`.
- For implementation: read the active work item and whatever `DOCUMENT_INDEX.md`'s
  Situation Guide names for the change (e.g. `docs/13_Utvecklarguide.md` for a new
  page or component).
- For architecture or dependencies: read `docs/04_Systemarkitektur.md` and
  `DECISIONS.md`.
- For delivery: read `docs/10_Release_och_deployment.md` (not yet in active use — no
  deployment pipeline exists for this mockup).

Request missing authoritative context rather than guessing. Load only what the
current task needs.

## Maintenance

Update this orientation when its summary becomes materially false. Do not use it as a
second decision log, roadmap, status history or documentation index.
