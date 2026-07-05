# Data- och analysportalen Project Status

Last reviewed: `2026-07-04`

## Current Phase

**Version or phase:** Early mockup / prototype.

Data- och analysportalen is in an early, local, mockup stage. There is no backend, no
application database and no real integrations. The Angular frontend is a visual and
functional prototype driven entirely by fictional mockdata and a configuration-driven
link-resolution mechanism, so it can be cloned and run fully offline.

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

Not currently implemented or not yet production-ready:

- No backend (.NET Web API) and no application database (PostgreSQL) — see
  `docs/04_Systemarkitektur.md` for the target architecture.
- No real integrations with OpenMetadata, Qlik Sense, Grafana, the Generativ AI
  Chattportal, UiPath, Nintex or any other external system.
- No authentication/authorization implementation.
- No automated frontend test suite beyond the small `SystemUrlService` spec.

## Current Architecture

| Area | Current choice | Authoritative detail |
| --- | --- | --- |
| Application | Angular (standalone, signals) + Bootstrap 5/SCSS, no backend yet | `docs/04_Systemarkitektur.md`, `docs/13_Utvecklarguide.md` |
| Data | Fictional local mockdata (JSON), no database yet | `frontend/public/assets/mock/README.md` |
| Hosting | Local development only (`npm start` in `frontend/`); no deployment yet | `docs/10_Release_och_deployment.md` |

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

- Design and implement the .NET Web API backend and PostgreSQL application database
  (`docs/04_Systemarkitektur.md`), once approved via a work item and, if it changes
  architecture, an ADR.
- Introduce real (adapter-based, mockable) integrations incrementally, starting with
  the systems already represented as `System`/`SystemLink` mockdata.
- Grow automated test coverage per `docs/09_Teststrategi.md`.

## Project Guidance

- Governance: [PROJECT_RULES.md](PROJECT_RULES.md)
- Documentation routing: [DOCUMENT_INDEX.md](DOCUMENT_INDEX.md)
- Decisions: [DECISIONS.md](DECISIONS.md)
