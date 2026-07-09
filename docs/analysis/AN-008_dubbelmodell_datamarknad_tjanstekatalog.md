# AN-008: Dubbelmodell mellan Datamarknad och fristående datatjänster i tjänstekatalogen

## 1. Sammanfattning

**Ja, nuläget är en verklig dubbelmodell**, inte bara en teoretisk risk. Tjänsterna
"Hitta datamängder" (`service-find-datasets`) och "Begär åtkomst till datamängd"
(`service-request-dataset-access`) existerar som egna, fristående `ServiceOffering`-poster
parallellt med att Datamarknad (`service-data-market`) redan erbjuder samma två behov som
åtgärder ("Utforska data" → `/data`, "Begär åtkomst till data" →
`/bestall/order-type-access-group"). De två fristående posterna länkas inte från
Datamarknad, och Datamarknads eget `relatedServiceIds`-fält som pekar på dem renderas
aldrig eftersom Datamarknad använder en egen, dedikerad komponent i stället för den
generiska tjänstedetaljen som annars visar relaterade tjänster.

Allvarligast: den **globala sökfunktionen** (start- och toppsök) indexerar alla
`ServiceOffering`-poster oavsett `featured`-flagga. En användare som söker på
"datamängd" eller "åtkomst" möter idag Datamarknad **och** de två äldre tjänsterna som
konkurrerande, obesläktade sökträffar av typen "Tjänst" – inte bara i den sällan använda
"Alla tjänster"-vyn i `/tjanster`.

Rekommendation: fäll in båda behoven i Datamarknad som de redan är byggda att göra, och
avveckla de fristående tjänsternas roll som självständiga, sökbara ingångar. Detta kräver
ingen informationsmodell- eller ADR-ändring – det är ett mockdata-, relations- och
katalogsynlighetsproblem.

## 2. Nuläge (verifierat i fas 2)

### 2.1 De tre inblandade `ServiceOffering`-posterna

Kontrollerat direkt i `frontend/public/assets/mock/services.mock.json`:

- **`service-data-market` (Datamarknad)** — `featured: true`, `detailRoute: ["/tjanster", "datamarknad"]`.
  `relatedServiceIds` inkluderar redan `service-find-datasets`,
  `service-request-dataset-access` och `service-combine-datasets-report`.
- **`service-find-datasets` (Hitta datamängder)** — inget `featured`-fält (alltså falsy),
  ingen `detailRoute`, `orderTypeIds: []`. Beskriver att "vägleda dig till datakatalogen".
- **`service-request-dataset-access` (Begär åtkomst till datamängd)** — inget `featured`,
  ingen `detailRoute`, `orderTypeIds: ["order-type-access-group"]`.

### 2.2 Vad Datamarknad faktiskt länkar till idag

Kontrollerat i `frontend/src/app/features/data-market/data-market.component.ts`: av
Datamarknads sex åtgärdskort länkar två direkt till samma mål som de fristående
tjänsterna representerar, men **utan att referera tjänsterna själva**:

- "Utforska data" → `['/data']` (samma mål som "Hitta datamängder" beskriver i ord).
- "Begär åtkomst till data" → `['/bestall', 'order-type-access-group']` (exakt samma
  `OrderType` som "Begär åtkomst till datamängd" pekar på via sitt `orderTypeIds`).

### 2.3 Varför Datamarknads egen `relatedServiceIds` inte löser något

Kontrollerat i `frontend/src/app/features/services/service-detail/service-detail.component.ts`:
`relatedServices$` (byggt från `relatedServiceIds`) renderas bara av den **generiska**
`ServiceDetailComponent`. Datamarknad har en egen `detailRoute` till en dedikerad
komponent (`DataMarketComponent`), som varken injicerar `ServiceOfferingService` eller
visar relaterade tjänster. Fältet `relatedServiceIds` på `service-data-market` är alltså
satt men **aldrig renderat för användaren** — dokumenterad avsikt utan faktisk effekt.

### 2.4 `/tjanster`-katalogens fokusläge

Kontrollerat i `frontend/src/app/features/services/service-catalog/service-catalog.component.ts`:
katalogen har ett `focusMode`-fält (`'featured' | 'all'`), standard `'featured'`. Kodkommentaren
beskriver `'all'` som avsett för "övriga spår och idéer som inte ska tappas bort" — dvs. ett
säkerhetsnät för produktbacklog, inte en avsedd, jämbördig andra katalogvy för
slutanvändare. I `'featured'`-läge (standard) syns varken "Hitta datamängder" eller
"Begär åtkomst till datamängd"; i `'all'`-läge syns båda som fullvärdiga tjänstekort.

### 2.5 Global sökning inkluderar alla tjänster oavsett `featured`

Kontrollerat i `frontend/src/app/services/search.service.ts`: `SearchService.index$`
byggs från `serviceOfferings.getAll()` **utan** filtrering på `featured`. Sökbar text per
tjänst är `title + shortDescription + type + signals.join(' ')` — **inte** `tags`.

Konkret, verifierad konsekvens: Datamarknads `shortDescription` är "Utforska, förstå och
få tillgång till dataprodukter, datamängder och datatjänster." — ordet **"åtkomst"**
förekommer inte där (bara "tillgång"). En sökning på "åtkomst" i den globala sökrutan
matchar därför idag **"Begär åtkomst till datamängd" men inte Datamarknad**. Om den
fristående tjänsten togs bort utan vidare åtgärd skulle sökning på "åtkomst" ge noll
tjänsteträffar, trots att Datamarknad faktiskt täcker behovet. Detta är ett konkret,
verifierat gap som nästa AB måste hantera, inte bara en teoretisk risk.

### 2.6 Guiders relationer till de fristående tjänsterna

Kontrollerat i `frontend/public/assets/mock/guides.mock.json`:

- `guide-find-datasets.relatedServiceIds` = `["service-find-datasets", "service-request-dataset-access"]`
- `guide-request-access.relatedServiceIds` = `["service-request-dataset-access"]`

Ingen guide refererar `service-data-market`. En ren borttagning av de två fristående
tjänsterna skulle alltså göra dessa guiders tjänstekopplingar oanvändbara om
referenserna inte flyttas till Datamarknad samtidigt.

### 2.7 Angränsande, ej fördjupat granskad observation

`service-combine-datasets-report` ("Kombinera datamängder till rapport") är en tredje,
strukturellt likartad icke-prioriterad tjänst som redan täcks av Datamarknads "Använd
data i rapport eller dashboard" och av tjänsten Rapporter och dashboards. Den ingår inte
i denna analys frågeställning (som gäller specifikt "Hitta datamängder" och "Begär
åtkomst till datamängd") men bör noteras som ett sannolikt liknande, framtida
konsolideringsfall.

## 3. Prövning av analysfrågorna

### 3.1 Är nuläget en dubbelmodell i `/tjanster`?

**Ja, bekräftad.** Se avsnitt 2.1–2.5. Dubbleringen är starkast i den globala sökningen
(alltid synlig) och i `/tjanster`s `'all'`-läge (en knapptryckning bort), svagast i
`/tjanster`s standardvy (döljs av `featured`-filtret).

### 3.2 Ska "Hitta datamängder" vara egen `ServiceOffering`, katalogpost eller åtgärd/katalogingång inom Datamarknad?

**Åtgärd/katalogingång inom Datamarknad — inte egen `ServiceOffering`.** Tjänsten har
inget eget beställningsflöde (`orderTypeIds: []`) och beskriver ordagrant samma resa som
Datamarknads redan byggda "Utforska data"-kort och AN-006:s godkända
utforskningsyta. Den tillför inget som Datamarknad inte redan gör, bara en konkurrerande
ingång till samma mål (`/data`).

### 3.3 Ska "Begär åtkomst till datamängd" vara egen `ServiceOffering`, beställningspost eller åtkomstflöde under Datamarknad?

**Åtkomstflöde under Datamarknad, med `order-type-access-group` som den faktiska
processen — inte egen `ServiceOffering`.** Dess enda substans (`orderTypeIds:
["order-type-access-group"]`) är redan exakt den `OrderType` Datamarknads "Begär åtkomst
till data"-kort länkar till. Den bör också, i linje med AN-006:s roadmap-punkt 3
("Förbättra objektkontext i åtgärder"), på sikt kunna startas direkt från ett specifikt
`/data/:id`- eller `/data/dataprodukt/:id`-objekt, inte bara generiskt.

### 3.4 Hur bör `/tjanster`, `/tjanster/datamarknad` och `/data` förhålla sig till varandra?

Ingen ändring av redan fattade beslut föreslås — denna analys bygger vidare på och
bekräftar dem:

- **`/tjanster`** (ADR-0005) är den primära, behovsstyrda starten och ska visa *tjänster*
  — Datamarknad, Rapporter och dashboards, etc. — inte konkurrerande underflöden till
  samma tjänst.
- **`/tjanster/datamarknad`** (AB-017, AN-006) är den kuraterade tjänste- och
  självbetjäningsingången som äger resan Hitta → Förstå → Bedöm → Begär åtkomst →
  Använd.
- **`/data`** (AN-006) förblir den bredare, canonical katalogen och detaljytan.

Den nya, konkreta tillämpningen denna analys tillför: de två fristående tjänsterna bryter
`/tjanster`s roll genom att duplicera Datamarknads redan byggda ingångar till `/data` och
`order-type-access-group`, inte genom att erbjuda något eget.

### 3.5 Hur bör användaren gå från att hitta data till att begära åtkomst?

Rekommenderad resa: `/data` (eller Datamarknads utforskningsyta, AB-018) → välj ett
specifikt dataset/dataprodukt → kontextuell CTA "Begär åtkomst" → `order-type-access-group`
under `/bestall`, med objektets id förifyllt när det byggs. Denna kontextöverföring finns
inte än (bekräftat av AN-006, roadmap-punkt 3) — det är en redan känd, godkänd
brist som nästa steg efter konsolideringen bör åtgärda, inte en ny upptäckt.

### 3.6 Vilka befintliga modeller bör användas utan att skapa parallella begrepp?

- `ServiceOffering` — endast `service-data-market` som tjänsteingång för dessa två behov.
- `Dataset` / `InformationMart` — oförändrade, canonical under `/data`.
- `OrderType` / `OrderFlow` — `order-type-access-group` som den faktiska åtkomstprocessen.
- `Guide` — `guide-find-datasets` och `guide-request-access`, med `relatedServiceIds`
  omdirigerade till `service-data-market`.

Inget nytt objekt (t.ex. en egen "DataAccessRequest") behövs.

### 3.7 Krävs informationsmodelländring, eller räcker justering av mockdata, presentation, länkar och navigation?

**Ingen informationsmodell- eller ADR-ändring krävs.** Det är ett katalog- och
sökbarhetsproblem på mockdatanivå:

- Omdirigera `guide-find-datasets` och `guide-request-access`s `relatedServiceIds` till
  `service-data-market`.
- Avgör (projektägarbeslut, se avsnitt 6) hur `service-find-datasets` och
  `service-request-dataset-access` ska sluta vara självständigt sökbara/synliga
  tjänstekort, utan att bara sätta `featured: false` (de är redan `false` i praktiken och
  problemet kvarstår ändå i global sökning, se 2.5).
- Säkerställ att Datamarknads sökbara text (`shortDescription`/`tags`, eller
  `SearchService`s indexeringslogik) faktiskt täcker ord som "åtkomst", så att
  konsolideringen inte skapar en sökbarhetsregression (se 2.5).

### 3.8 Vilket första lilla AB bör föreslås efter analysen?

Se avsnitt 5 för fullständigt scope och acceptance criteria.

## 4. Rekommenderad modell (sammanfattning)

| Behov | Idag | Rekommenderas |
| --- | --- | --- |
| Hitta/utforska data | Egen `ServiceOffering` (`service-find-datasets`) **och** Datamarknad-kort "Utforska data" | Endast Datamarknads åtgärd; fristående tjänst avvecklas som sökbar/synlig ingång |
| Begära åtkomst | Egen `ServiceOffering` (`service-request-dataset-access`) **och** Datamarknad-kort "Begär åtkomst till data" | Endast Datamarknads åtgärd, med framtida objektkontext; fristående tjänst avvecklas som sökbar/synlig ingång |
| Kombinera datamängder till rapport | Egen `ServiceOffering`, delvis analogt fall | Ej i scope för denna analys; sannolikt liknande framtida fall |

## 5. Föreslaget första AB

**Titel:** `AB: Konsolidera Hitta datamängder och Begär åtkomst till datamängd i Datamarknad`

**Scope:**

- Uppdatera `guide-find-datasets.relatedServiceIds` och `guide-request-access.relatedServiceIds`
  i `guides.mock.json` så att de refererar `service-data-market` (utöver eller i stället
  för de nuvarande referenserna, enligt projektägarens beslut om exakt mekanism nedan).
- Säkerställ att `service-find-datasets` och `service-request-dataset-access` inte längre
  visas som egna, sökbara tjänstekort — vare sig i `/tjanster`s `'all'`-läge eller i den
  globala sökningen — utan att ta bort dem på ett sätt som bryter befintliga länkar eller
  historik. Exakt mekanism (t.ex. explicit avvecklings-/dold synlighet, eller att
  `SearchService` filtrerar bort icke-`featured` tjänster) är en öppen fråga för
  projektägaren, se avsnitt 6.
- Justera Datamarknads sökbara text (`shortDescription` och/eller hur `SearchService`
  indexerar tjänster) så att sökning på "åtkomst" och andra ord som idag bara matchar de
  fristående tjänsterna fortsätter ge en relevant träff (Datamarknad) efter
  konsolideringen.
- Ingen ny route och ingen ny informationsmodell.

**Acceptance criteria:**

- Sökning på "datamängd" och "åtkomst" i den globala sökrutan ger inte längre två
  konkurrerande, obesläktade tjänsteträffar utöver Datamarknad för samma behov.
- `/tjanster` visar inte "Hitta datamängder" eller "Begär åtkomst till datamängd" som
  egna tjänstekort, i varken `'featured'`- eller `'all'`-läge.
- `guide-find-datasets` och `guide-request-access` visar korrekt relaterad tjänst
  (Datamarknad) på sina guidekort och i tjänstedetaljen.
- Inga trasiga länkar eller tomma vyer uppstår för tidigare bokmärkta
  `/tjanster/service-find-datasets` eller `/tjanster/service-request-dataset-access`
  (t.ex. genom en enkel redirect till `/tjanster/datamarknad`, i linje med ADR-0002:s
  princip att gamla vägar ska omdirigeras, inte bara sluta fungera).
- `npm run build` och `npm test` i `frontend/` är gröna.
- Ingen informationsmodell, ADR eller permanent styrande dokumentation ändras.

## 6. Öppna frågor för projektägaren

1. Ska `service-find-datasets` och `service-request-dataset-access` tas bort helt ur
   `services.mock.json`, eller behållas som icke-synliga/avvecklade poster (i linje med
   AB-017:s tidigare princip att konsolidera utan borttagning)? Detta avgör om
   `/tjanster/service-find-datasets` ska ge 404/tomt läge, redirecta, eller fortsätta
   existera dolt.
2. Ska `SearchService` ändras generellt till att exkludera icke-`featured` tjänster ur
   global sökning (en bredare policyändring som skulle påverka fler framtida
   "bakgrundstjänster"), eller ska just dessa två poster hanteras som ett specialfall?
3. Ska Datamarknads sökbara text utökas via `shortDescription`, eller ska
   `SearchService` ändras till att även matcha på `tags` (vilket skulle vara en
   bredare, konsekvent ändring som även påverkar andra tjänster)?

## 7. Risker och avgränsningar

- Att bara sätta tjänsterna till `featured: false` (redan fallet) löser inte
  huvudproblemet, eftersom global sökning inte filtrerar på `featured` (avsnitt 2.5).
- En ren borttagning utan redirect eller uppdaterade guide-referenser bryter länkar och
  strider mot ADR-0002:s princip om att gamla vägar ska omdirigeras.
- Konsolidering får inte skapa en sökbarhetsregression: om Datamarknad inte täcker
  samma sökord som de fristående tjänsterna gjorde, försämras upptäckbarheten snarare
  än förbättras.
- Analysen omfattar inte `service-combine-datasets-report`, som är ett strukturellt
  likartat men separat fall (avsnitt 2.7).
- Analysen bygger på repositoryts arbetskopia 2026-07-09. Den är en generisk
  informationsarkitekturbedömning, inte en verksamhetsvalidering med riktiga användare.

## 8. Granskat underlag (fas 2, verifierat)

- Styrning och arbetssätt: `AGENTS.md`, `docs/project/PROJECT_RULES.md`,
  `docs/project/DOCUMENT_INDEX.md`, `docs/project/DECISIONS.md`, `docs/WORK_QUEUE.md`,
  `docs/project/PROJECT_WORKFLOW.md`, `docs/development/PROJECT_ADMINISTRATION.md`,
  `docs/project/WORK_ITEM_SCHEMA.md`.
- ADR:er (öppnade på nytt i fas 2): `docs/adr/0002-canonical-url-struktur-tjanster.md`,
  `docs/adr/0004-route-komponentprincip-delade-tjansteflode.md`,
  `docs/adr/0005-namespace-livscykelprincip-portalfloden.md`.
- Analyser/work items (öppnade på nytt i fas 2):
  `docs/analysis/AN-006_malbild_datamarknad_anvandarupplevelse.md`,
  `docs/work-items/AB-017.md`, `docs/work-items/AB-018.md`, `docs/work-items/AB-020.md`.
- Mockdata: `frontend/public/assets/mock/services.mock.json` (utdrag för
  `service-data-market`, `service-find-datasets`, `service-request-dataset-access`,
  `service-combine-datasets-report`), `frontend/public/assets/mock/guides.mock.json`
  (`relatedServiceIds`-fält).
- Kod: `frontend/src/app/app.routes.ts`,
  `frontend/src/app/features/services/service-catalog/service-catalog.component.ts`,
  `frontend/src/app/features/data-market/data-market.component.ts`,
  `frontend/src/app/features/data-market/data-market.component.html`,
  `frontend/src/app/features/services/service-detail/service-detail.component.ts`,
  `frontend/src/app/services/search.service.ts`.
- `docs/project/OBSERVATION_LOG.md` genomsöktes (grep) efter omnämnanden av
  Datamarknad/dubbelmodell; inga relevanta observationer för denna specifika
  frågeställning hittades.

Ingen källkod, mockdata, route, informationsmodell, ADR eller permanent styrande
dokumentation ändrades av AN-008.
