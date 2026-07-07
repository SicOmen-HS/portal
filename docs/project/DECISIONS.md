# Data- och analysportalen Decisions

## Decision Statuses

- `proposed`: under consideration and not approved.
- `approved`: current direction.
- `superseded`: replaced by another identified decision.
- `rejected`: considered and explicitly not selected.

## DEC-001 - Adopt Worksmith As The Project Administration Workflow

- **Status:** `approved`
- **Date:** `2026-07-04`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

The project needed a lightweight, traceable way to create, track, document and
validate work items, and a clear split between durable reference documentation and
day-to-day operational documentation that an AI agent or new developer can read
without loading the entire `docs/` tree. `tools/worksmith/` provides a self-contained
kit (`core/`, `scaffold/`, `examples/`) designed for exactly this adoption.

### Decision

Adopt Worksmith as the project's work-item lifecycle and documentation-routing
workflow:

- `tools/worksmith/core/` is copied verbatim into `scripts/` and remains the
  updateable, generated mirror of the Worksmith engine (never hand-edited).
- `tools/worksmith/scaffold/` is copied once into active project documentation
  (`AGENTS.md`, `docs/project/*.md`, `docs/development/PROJECT_ADMINISTRATION.md`)
  and filled in for Data- och analysportalen. `tools/worksmith/scaffold/` itself is
  now one-time installation material and is not read again.
- `.worksmith/topics.json` and `.worksmith.json` are project-owned configuration,
  populated with Data- och analysportalen's own vocabulary and presentation settings
  (Swedish CLI output).
- `scripts/project-administration/configuration.ts` (prefixes `AB`/`AN`/`IM`, work-item
  paths, metadata sentinels, `applicationName`) is kept byte-identical to the
  distributed kit, explicitly *not* rewritten to remove residual ArmBase-specific
  values, because the copied regression test suite
  (`scripts/project-administration/tests/project-administration.test.ts`) asserts
  against those exact values. See "Alternatives Considered" below.

This is not approved as a replacement for the existing `docs/00`–`docs/14` reference
documentation — see DEC-002.

### Consequences

- Positive: work is now traceable through a deterministic CLI (create, transition,
  complete, validate, show, handoff) instead of ad hoc notes.
- Trade-off: the CLI's terminal banner and a few internal error messages still say
  "ArmBase" (the kit's origin project) rather than "Data- och analysportalen", because
  changing `configuration.ts`'s `applicationName` would break the copied test suite's
  hardcoded string assertions. This is cosmetic only — no secret, credential or
  internal system reference is involved — and `.worksmith.json`'s `project.name`
  already makes most interactive output (queue, config, handoff) show "Data- och
  analysportalen" instead.
- Required follow-up: none currently. If a future Worksmith core update splits
  `configuration.ts` into a generic loader plus a separate project-values file (see
  `tools/worksmith/README.md`'s "Known Limitations"), revisit this trade-off then.

### Alternatives Considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Rewrite `configuration.ts` values (paths, prefixes, app name) for this project | Rejected | Would break `npm run project:test`, which asserts against the exact copied values (paths `docs/work-items`/`docs/WORK_QUEUE.md`, prefixes `AB`/`AN`/`IM`, the `applicationName` banner string). The instruction to avoid changing core internal logic without necessity outweighs the cosmetic benefit. |
| Build a custom, from-scratch work-item tracker | Rejected | Worksmith already provides deterministic allocation, validation and lifecycle transitions; rebuilding this would duplicate proven logic without added value at this project stage. |

### Related Evidence

- `tools/worksmith/README.md`, `tools/worksmith/START_HERE_FOR_AI.md`
- `docs/work-items/AB-001.md` (first work item created under this adoption)

---

## DEC-002 - Two-Tier Documentation Strategy: Reference Vs. Operational

- **Status:** `approved`
- **Date:** `2026-07-04`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

`docs/` already contained 15 detailed, Swedish-language governing documents
(`00_Projektprinciper.md` through `14_Rekommenderade_extensions.md`), totaling roughly
280 KB. Reading all of it for every small task is disproportionate context load,
especially for an AI agent working across many short sessions. The documents
themselves are valuable, current and should not be shortened, merged or deleted — but
a lighter, task-routed layer was needed on top.

### Decision

Keep `docs/00_Projektprinciper.md` through `docs/14_Rekommenderade_extensions.md`
exactly as they are: the durable, detailed reference documentation and source of
truth for principles, vision, domain, information model, architecture, configuration,
development, AI usage, local environment, testing, release, ADRs, design system, the
developer guide and recommended extensions.

Add a second, lightweight operational layer that never redefines or contradicts the
reference layer, only summarizes and routes to it:

- `AGENTS.md` (repository root) — the short AI-agent discovery entrypoint.
- `docs/project/PROJECT_RULES.md` — compact durable governance, summarizing
  `docs/00_Projektprinciper.md` and pointing to the rest.
- `docs/project/PROJECT_WORKFLOW.md` — the operational Worksmith work-item checklist.
- `docs/project/WORK_ITEM_SCHEMA.md` — the work-item metadata/manifest contract.
- `docs/project/DOCUMENT_INDEX.md` — the reading-strategy document: which document to
  read for which kind of change, and which documents are reference vs. operational.
- `docs/project/PROJECT_STATUS.md` — current phase, capabilities and priorities.
- `docs/project/DECISIONS.md` — this decision log.
- `docs/project/PROJECT_CONTEXT.md` — a one-page orientation for a new session.
- `docs/development/PROJECT_ADMINISTRATION.md` — the Worksmith CLI command reference.

State what is the default: an AI agent or developer starting a task reads
`AGENTS.md` → `docs/project/PROJECT_RULES.md` → `docs/project/DOCUMENT_INDEX.md`, and
loads only the specific `docs/0X_*.md` reference document(s) the Situation Guide in
`DOCUMENT_INDEX.md` names for that kind of change. Preloading the entire `docs/` tree
for a routine change is explicitly not required and not expected.

What is explicitly not approved: shortening, merging, deleting or forking the content
of `docs/00_Projektprinciper.md` through `docs/14_Rekommenderade_extensions.md`.
Any future change to that reasoning requires a new decision here, not a silent edit.

### Consequences

- Positive: routine tasks (a new mockdata entry, a small UI fix, a new systemlänk)
  need only `PROJECT_RULES.md` plus one or two routed reference documents, not the
  full 280 KB reference set.
- Positive: the detailed reference documentation remains fully intact for audits,
  onboarding, and non-trivial architecture or information-model work.
- Trade-off: two layers must be kept consistent. `DOCUMENT_INDEX.md`'s Maintenance
  Checklist exists specifically to catch drift when a reference document changes.
- Required follow-up: none currently.

### Alternatives Considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Shorten or consolidate `docs/00`–`docs/14` into fewer files | Rejected | Would lose detail and history that the project explicitly wants preserved as reference material; also contradicts the explicit instruction to preserve existing governing documents unchanged. |
| No operational layer; require reading all of `docs/` every session | Rejected | Disproportionate context load for small, routine tasks; does not scale across many short AI-assisted sessions. |
| Operational layer duplicates reference content instead of routing to it | Rejected | Creates two competing sources of truth and drift risk; the index-and-route approach keeps a single source of truth per topic. |

### Related Evidence

- `docs/project/DOCUMENT_INDEX.md` (the resulting routing document)
- `docs/work-items/AB-001.md`

---

## DEC-003 - Dataprodukt As The Primary User Term For Information Mart

- **Status:** `approved`
- **Date:** `2026-07-05`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

The mockup used "Information Mart" — a Data Vault 2.0 delivery-layer term — as a
user-facing label in search results, filters, the preview panel and the Data & katalog
page. The project owner judged this too technical for the portal's broader audiences
and directed a concept change: introduce "Dataprodukt" as the primary user term, keep
"Datamängd" for broader discoverable data assets/building blocks, and keep "Information
Mart" as secondary technical/architecture metadata.

### Decision

Adopt the concept model and UI-language change documented in full in
`docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`: "Dataprodukt" is now the primary
user-facing term in search, filters, preview and detail pages; "Information Mart" is
shown only as secondary technical implementation metadata. The underlying
`InformationMart` TypeScript interface, model filename and mock filename are
deliberately kept unchanged — this is a UI/metadata-level change, not a data-model
rename.

### Consequences

- Positive: search results, filters and detail pages are understandable without prior
  Data Vault knowledge, while technical users can still see the actual implementation.
- Trade-off: the codebase now has a naming gap between the internal `InformationMart`
  identifier and the user-facing "Dataprodukt" label; this is intentional and explained
  in ADR-0001 rather than hidden.
- Required follow-up: none currently. A future, fully separate `DataProduct` model is
  documented in ADR-0001 as a possible next step, not adopted now.

### Alternatives Considered

See `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md` for the full alternatives
analysis (keeping "Information Mart" visible vs. a full `DataProduct` model rewrite vs.
the adopted minimal UI/metadata change).

### Related Evidence

- `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`
- `docs/03_Informationsmodell.md` (Dataprodukt and InformationMart sections)
- `docs/work-items/AB-003.md`

---

## DEC-004 - Operational Needs Use An Action-Led Service Path

- **Status:** `approved`
- **Date:** `2026-07-06`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

The report need page presented services, datasets, data products, guides and orders as
equivalent results. That made the user interpret the portal's information model before
they could answer the simpler question: what do I want to do with my report or dashboard?

### Decision

For operational service needs, the portal shall primarily present an action-led service
path: choose a concrete action, understand its prerequisites and process, and continue
with a specific next action. Related data, guides and status remain available as
contextual support, not as equivalent primary choices. AB-004 applies this to
`Rapporter och dashboards` while retaining `/behov/rapport` for link compatibility.

This iteration uses the existing page component and conceptual `ServiceOffering`,
`OrderType` and `OrderFlow` structures. It does not introduce a new `ServiceAction`
information object; that can be reconsidered if several services need reusable,
content-managed actions.

### Consequences

- Positive: users start from intent rather than resource type or technical platform.
- Positive: calls to action can name the actual task instead of using a generic
  "Visa nästa steg" label.
- Trade-off: the six actions are local mockup content until a reusable content model
  is justified.
- Required follow-up: assess a reusable `ServiceAction` model only after the pattern
  is used by additional service pages.

### Related Evidence

- `docs/work-items/AB-004.md`
- `frontend/src/app/features/needs-catalog/`

---

## DEC-005 - Rapportera Problem Ska Vara Ett Generellt Portalflöde

- **Status:** `approved`
- **Date:** `2026-07-06`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

Tjänsten "Rapporter och dashboards" visar åtgärden "Rapportera problem" tillsammans
med rapportspecifika åtgärder. Analys av åtgärdsflödena (`AN-003`) visar att
problemrapportering inte bör modelleras som ett unikt rapport-/dashboardflöde. Behovet
kan uppstå för flera tjänster, system, dataprodukter och framtida processer.

Det finns ännu inget generellt ärende- eller incidentkoncept i informationsmodellen,
och den befintliga supportytan (`SupportComponent`, `/kontakt`) pekar redan mot ett
framtida generellt ticketing-/supportflöde – den har redan en avsiktligt osatt
`TICKETING_SYSTEM_URL`-konfigurationsnyckel – snarare än ett tjänstespecifikt
formulär.

### Decision

"Rapportera problem" ska hanteras som ett generellt portalövergripande formulär eller
ärendeflöde, inte som ett unikt flöde för "Rapporter och dashboards".

Rapporter och dashboards får visa en åtgärd eller länk för problemrapportering, men den
ska senare leda till samma generella problem-/supportflöde som andra tjänster kan
använda.

### Consequences

- Positivt: vi undviker duplicerade problemformulär per tjänst.
- Positivt: framtida ärendestatus, support och ticketing kan byggas en gång och
  återanvändas.
- Trade-off: "Rapportera problem" byggs inte som nästa rapportspecifika åtgärd.
- Nästa fokus inom "Rapporter och dashboards" bör vara åtgärder som är genuint
  tjänstespecifika, i första hand "Lägg till eller ändra data".
- Required follow-up: bedöm ett generellt problem-/ärendeflöde (informationsmodell,
  UI, eventuell koppling till `TICKETING_SYSTEM_URL`) som ett eget, separat AB-item när
  det prioriteras, inte som en förlängning av Rapporter och dashboards-serien.

### Alternatives Considered

| Alternative | Outcome | Reason |
| --- | --- | --- |
| Bygg "Rapportera problem" som ett rapportspecifikt formulär nu, i samma serie som övriga åtgärder | Rejected | Skulle sannolikt behöva göras om eller leva kvar som en inkonsekvent specialvariant när ett generellt ärendeflöde senare byggs, eftersom `SupportComponent` redan är förberedd för exakt det generella flödet. |
| Skjut upp all problemrapportering tills ett fullständigt ärendesystem finns | Rejected | Onödigt restriktivt – tjänsten kan fortsätta visa en åtgärd/länk för problemrapportering, den ska bara peka mot det framtida generella flödet istället för ett eget formulär. |

### Related Evidence

- `docs/analysis/AN-003_atgardsflode_atervandning_rapporter_dashboards.md`
- `docs/work-items/AN-003.md`
- `frontend/src/app/features/support/support.component.ts`

---

## DEC-006 - Route- Och Komponentprincip För Tjänstespecifika, Återanvändbara Och Generiska Flöden

- **Status:** `approved`
- **Date:** `2026-07-07`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

AB-012 länkade "Skapa ny rapport eller dashboard" och "Ändra behörighet" till
befintliga `OrderType`-poster under `/bestall`, vilket löste kortsiktig
återanvändning men skapade en oavsiktlig funktionsskillnad mellan tjänstespecifika
formulär i portalen (`/tjanster/rapporter-och-dashboards/...`) och den läsande
`/bestall/<order-type>`-katalogsidan. `AN-004` analyserade detta och rekommenderade en
uttalad klassificering (tjänstespecifikt flöde, återanvändbart domänflöde, generiskt
portalflöde) och en princip för var varje typ ska renderas.

### Decision

Anta route- och komponentprincipen dokumenterad i fullständig form i
`docs/adr/0004-route-komponentprincip-delade-tjansteflode.md`: tjänstespecifika
åtgärder får en egen route och komponent under sin tjänst (redan `ADR-0002`);
återanvändbara domänflöden (t.ex. "Ändra behörighet") byggs som en enda, delad
formulärkomponent monterad i respektive tjänsts egen route med kontext via
input-signaler, inte via omdirigering till en kontextlös sida; genuint generiska
portalflöden (t.ex. "Rapportera problem", `DEC-005`) får en enda, portalägd route som
flera tjänster länkar till.

`order-type-new-bi-app`s nuvarande länkning via `/bestall` (`AB-012`) är uttryckligen
en känd, tillfällig kompromiss – ordertypen är tjänstespecifik för Rapporter och
dashboards, inte generisk eller återanvändbar, och bör på sikt få en egen, fördjupad
väg under tjänsten istället.

### Consequences

- Positive: nya åtgärder/flöden har en tydlig regel för var de ska implementeras,
  istället för att varje AB-item uppfinner sin egen lösning.
- Positive: återanvändbara domänflöden kan delas mellan tjänster utan att användaren
  möter en annan interaktionsnivå eller tappar sin tjänstekontext.
- Trade-off: tills en delad domänflödeskomponent faktiskt byggs fortsätter "Skapa ny
  rapport eller dashboard" och "Ändra behörighet" att peka på den generiska
  `/bestall`-katalogen – en dokumenterad, avsiktlig avvikelse, inte ett brott mot
  principen.
- Required follow-up: bygg en delad "Ändra behörighet"-komponent monterad under
  tjänstens egen route; ge "Skapa ny rapport eller dashboard" en egen, fördjupad väg;
  bedöm `OrderType.relatedServiceId` → `relatedServiceIds` när ett andra konkret
  delat-formulär-fall bekräftar behovet (se `ADR-0004` och `AN-004` för detaljer).

### Alternatives Considered

Se `docs/adr/0004-route-komponentprincip-delade-tjansteflode.md` för den fullständiga
avvägningen mot att fortsätta länka till `/bestall` permanent, kontra att bygga en
separat kopia av formuläret per tjänst.

### Related Evidence

- `docs/adr/0004-route-komponentprincip-delade-tjansteflode.md`
- `docs/analysis/AN-004_tjansteatgarder_ordertyper_atervandbara_formular.md`
- `docs/work-items/AB-012.md`

---

## DEC-007 - Namespace Och Livscykel För Portalflöden

- **Status:** `approved`
- **Date:** `2026-07-07`
- **Owner:** Project owner
- **Supersedes:** None
- **Superseded by:** None

### Context

AN-005 visade behovet av en permanent gräns mellan att hitta en tjänst, initiera en
begäran eller felanmälan, få support, följa ett inskickat ärende och se driftstatus.

### Decision

Anta namespace- och livscykelprincipen i
`docs/adr/0005-namespace-livscykelprincip-portalfloden.md`: `/tjanster` är primär
kontextstyrd start; `/bestall` är sekundär katalog, inte hem för alla formulär;
`/kontakt/rapportera-problem` är canonical route för det framtida generella
problemflödet; `/arenden` är en framtida uppföljningsyta efter inskick; och `/status`
reserveras för driftstatus. `/gemensamma-tjanster` ska inte införas som synlig
kategori eller teknisk lösning för delade formulär.

Beslutet dokumenterar målbild och routeansvar. Det implementerar inga nya routes,
sidor, modeller eller navigationsetiketter.

### Consequences

- Positive: varje portalflöde får ett tydligt namespace utifrån användarens avsikt
  och var i livscykeln användaren befinner sig.
- Positive: ärendeuppföljning hålls skild från både driftstatus och supportstart.
- Trade-off: `/kontakt/rapportera-problem` och `/arenden` förblir framtida tills
  separat godkända implementations- och modellitems genomförs.
- Required follow-up: dokumentera och genomför dessa framtida ytor endast genom egna
  Worksmith-items; analysera informationsmodellen före `/arenden`.

### Related Evidence

- `docs/adr/0005-namespace-livscykelprincip-portalfloden.md`
- `docs/analysis/AN-005_bestall_arenden_generella_portalfloden.md`
- `docs/adr/0004-route-komponentprincip-delade-tjansteflode.md`
