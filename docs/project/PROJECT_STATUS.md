# Data- och analysportalen Project Status

Last reviewed: `2026-08-19` (AB-034)

## Current Phase

**Version or phase:** Early mockup / prototype.

Data- och analysportalen is in an early, local stage. The Angular frontend is a visual
and functional prototype driven entirely by fictional mockdata and a
configuration-driven link-resolution mechanism, so it can be cloned and run fully
offline. A .NET Web API backend (`Portal.Api`) also exists as a local proof-of-concept
with a local SQL Server integration (AB-027, AB-030, AB-031, AB-032), but there is no
application database and no real integrations with other external systems. Frontend
runs as a verified persistent Hosting Lab interim instance (non-containerized);
`Portal.Api` has no persistent, deployed instance yet — see "Current Architecture"
below. ADR-0007 (accepted) defines the containerized target. The Portal-owned
container build contract for both frontend and `Portal.Api` is implemented in AB-034;
remaining Docker build/run smoke verification is pending before AB-034 is completed.

## Current Focus

Make the mockup easy to hand over and continue without verbal briefing: clear
structure, configuration-driven behavior, and lightweight but complete documentation
for both humans and AI agents.

Current priorities:

1. Keep the local mockup runnable, generic and free of company-specific information.
2. Keep configuration (`runtime-config.json`, `systemUrls`, feature flags) as the only
   place environment differences live — never in code or mockdata.
3. Keep documentation layered so an AI agent or new developer reads only what a given
   task needs (`docs/project/DOCUMENT_INDEX.md`), while the full reference
   documentation (`docs/00`–`docs/14`) remains intact and authoritative.

## Current Capabilities

Implemented and available:

- A full Angular mockup frontend (`frontend/`) covering Hem, Tjänster (catalog +
  detail), System & länkar, Data & katalog, Guider & dokumentation, Beställ & få
  tillgång (catalog + detail with steps/dependencies), Status & drift, Kontakt &
  support and Om portalen.
- En jämförbar behovsstyrd mockupiteration med tre hemvarianter (behovsstyrd,
  minimalistisk sökportal och datamarknad), samlad typad sökning, behovskatalog och
  progressiv datamängdsdetalj. Varianterna delar informationsmodell och fiktiv mockdata.
- A TypeScript information model (`frontend/src/app/models/`) mirroring
  `docs/03_Informationsmodell.md`.
- Fictional mockdata for every information object (`frontend/public/assets/mock/`).
- A configuration-driven link mechanism (`urlKey` / `documentationUrlKey` / `linkKey`
  resolved via `SystemUrlService` against `runtime-config.json`'s `systemUrls`), so no
  component or mock file ever contains a real URL.
- Developer documentation (`docs/13_Utvecklarguide.md`,
  `docs/14_Rekommenderade_extensions.md`) and a working `.vscode/extensions.json`.
- Worksmith project administration (this adoption): work-item lifecycle, queue,
  validation, topic catalog, and layered project/operational documentation.
- A .NET Web API backend (`backend/Portal.Api/`) as a local proof-of-concept: dataset
  metadata/preview, declared origin and generic technical SQL Server asset discovery
  (AB-027, AB-030, AB-031, AB-032), plus a `/health` endpoint. See
  `backend/Portal.Api/README.md`. No persistent/deployed instance exists yet.
- Container build definitions for both frontend and backend (`frontend/Dockerfile`,
  `backend/Portal.Api/Dockerfile`), implementing Portal / Data Platform's side of
  ADR-0007's container contract (AB-034): reproducible, environment-independent
  images, an externally replaceable frontend runtime-config path, and a documented
  backend runtime-configuration contract. The underlying `dotnet publish`/`ng build`
  steps are verified locally; the Docker image build/run smoke tests themselves still
  require a container runtime to be executed (see `backend/Portal.Api/README.md` and
  `frontend/README.md` for the exact commands). No persistent instance is deployed in
  Hosting Lab.

Not currently implemented or not yet production-ready:

- No application database (PostgreSQL) — see `docs/04_Systemarkitektur.md` for the
  target architecture. The .NET Web API backend itself exists as a local
  proof-of-concept (see above) but has no persistent, deployed instance.
- No real integrations with OpenMetadata, Qlik Sense, Grafana, the Generativ AI
  Chattportal, UiPath, Nintex or any other external system.
- No authentication/authorization implementation.
- A small automated frontend test suite exists and covers application creation,
  configuration-driven URL resolution, data-classification validation and search
  behavior. It is not yet broad production-level coverage.
- A Portal-owned container build contract for ADR-0007's target deployment model
  is implemented in AB-034 for both frontend and `Portal.Api`. Remaining Docker
  build/run smoke verification is pending before review/completion; the
  containerized persistent portal instance is not yet deployed.

## Current Architecture

| Area | Current choice | Authoritative detail |
| --- | --- | --- |
| Application | Angular (standalone, signals) + Bootstrap 5/SCSS frontend; .NET Web API backend (`Portal.Api`) as a local proof-of-concept | `docs/04_Systemarkitektur.md`, `docs/13_Utvecklarguide.md`, `backend/Portal.Api/README.md` |
| Data | Fictional local frontend mockdata (JSON); local SQL Server proof-of-concept for backend datasets/discovery; no application database yet | `frontend/public/assets/mock/README.md`, `backend/Portal.Api/README.md` |
| Hosting | Target deployment model is decided (ADR-0007, `docs/adr/0007-containerbaserad-deployment-persistent-portalinstans.md`, status Accepterad: container-based). The Portal-owned container build contract for frontend and `Portal.Api` is implemented in AB-034; remaining Docker build/run smoke verification is pending and the containerized portal instance is not yet deployed. As an interim, Hosting Lab runs a verified persistent, non-containerized frontend instance with automatic restart; `Portal.Api` is not included in the interim. The actual persistent container runtime remains separate Hosting Lab-owned work | `docs/10_Release_och_deployment.md`, `backend/Portal.Api/README.md`, `frontend/README.md` |
Keep this summary factual. Record approved reasoning in `DECISIONS.md` and technical
detail in `docs/04_Systemarkitektur.md` or `docs/13_Utvecklarguide.md`.

## Active Risks Or Constraints

- The repository must remain generic: no internal URLs, secrets, certificates,
  connection strings, real AD groups, personal data or production data
  (`docs/00_Projektprinciper.md`, `docs/05_Konfiguration.md`).
- `scripts/project-administration/configuration.ts` mixes generic Worksmith shape
  with fixed values (paths, prefixes, the "ArmBase Project Administration CLI"
  banner string) that the copied regression test suite asserts against verbatim; see
  `docs/development/PROJECT_ADMINISTRATION.md`'s Known Bootstrap Limitations for why
  these were deliberately left unchanged.
- `npm run project:test` has exactly two expected failures (84/86 pass): one test
  imports `scripts/build-worksmith-kit.ts` and another references `scripts/project.ts`
  — both are the kit origin repository's own internal tooling and are intentionally
  not part of the distributed `tools/worksmith/core/`. See
  `docs/development/PROJECT_ADMINISTRATION.md`'s Known Bootstrap Limitations.

## Next Major Milestones

- Complete AB-034's remaining Docker build/run smoke verification, then move the
  container build contract through review/completion and merge.
- Hosting Lab-owned follow-up to ADR-0007/AB-034: establish the actual Compose
  composition, persistent runtime, reverse-proxy configuration for same-origin
  exposure and secrets injection for both frontend and `Portal.Api`, superseding the
  current non-container frontend interim instance. This is explicitly outside the
  Portal repository and outside AB-034's scope.
- Design and implement the PostgreSQL application database
  (`docs/04_Systemarkitektur.md`), once approved via a work item and, if it changes
  architecture, an ADR.
- Introduce real (adapter-based, mockable) integrations incrementally, starting with
  the systems already represented as `System`/`SystemLink` mockdata.
- Grow automated test coverage per `docs/09_Teststrategi.md`.

## Project Guidance

- Governance: [PROJECT_RULES.md](PROJECT_RULES.md)
- Documentation routing: [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md)
- Decisions: [DECISIONS.md](DECISIONS.md)
