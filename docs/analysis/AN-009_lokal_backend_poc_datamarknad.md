# AN-009 — Avgränsa lokal backend-POC för Datamarknad

## Komplettering (begärd av projektägaren innan godkännande, 2026-07-12)

Den ursprungliga analysen tolkade POC:n som i första hand fokuserad på
hämtning av datasetmetadata (namn, beskrivning, fältbeskrivningar) från SQL
Server. Projektägaren har förtydligat att huvudmålet även omfattar att
praktiskt bevisa att portalen kan läsa **faktiska datarader** från en lokal
SQL Server-tabell eller vy via en riktig, begränsad `SELECT` — inte bara
metadata, och inte en klientderiverad eller hårdkodad rad.

Detta dokument är uppdaterat för att spegla det förtydligandet i följande
avsnitt: "Mål för POC", "Rekommenderad minsta API-yta" (ny endpoint
`GET /api/datasets/{id}/preview`), ett nytt avsnitt "Säker koppling mellan
dataset-id och tillåten datakälla", "Rekommenderade backendägda
API-kontrakt", "Rekommenderat adapterinterface på konceptnivå",
"Rekommenderad lokal SQL Server-struktur", "Mappning mellan API-DTO:er och
befintliga frontendmodeller", "Föreslagna framtida work items", "Risker",
"Öppna frågor" och "Slutsats och rekommendation". Övriga avsnitt är
oförändrade i sak. Ingen implementation har gjorts som del av denna
komplettering.

## Bakgrund

Datamarknad visar idag tjänster, datamängder, dataprodukter och fältmetadata
uteslutande via lokal, fiktiv mockdata under `frontend/public/assets/mock/`,
laddad genom `MockDataService` och domänspecifika tjänster som
`DataCatalogService`. AB-023 (klar 2026-07-11) lade nyligen till en
fältsektion och en syntetisk previewrad på datamängdsdetaljen
(`data-detail`), men uteslutande i mockdatalagret — `Dataset` fick ett
optional `sampleFields?: DatasetFieldPreview[]`.

Projektägaren vill nu avgränsa en första teknisk kedja för hur den
befintliga Angular-frontenden senare kan byta ut mock-JSON mot ett riktigt
lokalt API, utan att frontend någonsin får en direkt databasanslutning:

```
Angular -> .NET Web API -> metadataadapter -> lokal SQL Server (fiktiv data)
```

Detta är inte en bred analys av portalens hela framtida backendarkitektur
(`docs/04_Systemarkitektur.md` äger den frågan och pekar redan mot .NET Web
API + PostgreSQL + ett integrationsadapterlager). Det är en liten, avgränsad
POC-analys för exakt en kedja och ett användarflöde.

## Syfte

Ta fram ett litet, säkert och genomförbart analysunderlag som gör det
möjligt att senare — i separata, godkända AB-item — implementera en
proof-of-concept-kedja utan att behöva uppfinna avgränsningen under tiden.

## Mål för POC

- Bevisa att Angular kan hämta datamängdsmetadata (inklusive fältbeskrivningar)
  från ett lokalt .NET Web API istället för mock-JSON.
- **Bevisa, utöver metadata, att portalen kan läsa faktiska datarader från en
  lokal SQL Server-tabell eller vy via en riktig, begränsad `SELECT`** —
  raderna ska komma från SQL Server, aldrig från hårdkodad JSON eller en
  hårdkodad C#-lista — och att dessa fiktiva rader kan visas i Angular i den
  redan befintliga previewytan (`DatasetFieldsPreviewComponent`, AB-023).
- Bevisa att API:et i sin tur hämtar både metadata och datarader från en
  lokal, helt fiktiv SQL Server via ett tydligt adapterinterface — aldrig
  direkt från frontend.
- Hålla API-kontrakt, adapter och SQL-struktur backendägda, utan beroende
  till Angulars TypeScript-modeller.
- Säkerställa att dataset-id kopplas till en tillåten tabell/vy på ett sätt
  som inte accepterar godtyckliga tabellnamn eller SQL-fragment från
  frontend.
- Identifiera minsta möjliga tekniska yta som bevisar hela den vertikala
  kedjan end-to-end: Angular → .NET API → SQL Server-adapter → lokal SQL
  Server → fiktiva datarader → befintlig previewvy.

## Icke-mål / Out-of-scope

- Ingen implementation i detta AN: inga `.NET`-projekt, C#-filer,
  Angular-tjänster, TypeScript-modeller, SQL-script, migrations,
  databasfiler, `appsettings`-filer, runtime-konfiguration, feature flags
  eller container-/Docker-filer.
- Ingen autentisering eller auktorisering.
- Ingen deployment eller produktionskoppling.
- Ingen PostgreSQL — det är portalens egen, separata framtida
  applikationsdatabas (`docs/04_Systemarkitektur.md`, rad ~199–224), inte del
  av denna POC.
- Ingen ändring av informationsmodellen (`Dataset`/`DatasetFieldPreview`
  räcker som de är).
- Inget stöd för `InformationMart`/dataprodukt-detalj (samma avgränsning som
  AB-023).
- Ingen bred arkitekturanalys av hela portalens backend.
- Ingen Git commit, push, rebase, merge eller deploy.

## Antaganden

- `dataset-sales-transactions-demo` (redan i mock med `sampleFields`) är det
  naturliga referensobjektet för POC:ns konceptuella exempel, eftersom det
  redan har fält och preview.
- "Metadataadapter" avser ett applikationslager-interface i backend som
  isolerar SQL Server-åtkomst, i linje med den redan namngivna
  `SqlServerAdapter` i `docs/04_Systemarkitektur.md` (rad 363).
- POC:ns SQL Server representerar en framtida verklig extern datakälla
  (t.ex. en dataplattform/OpenMetadata-liknande källa), inte portalens egen
  applikationsdatabas — helt i linje med den avgränsning som redan är
  beslutad i `docs/04_Systemarkitektur.md` ("Portalens PostgreSQL-databas är
  inte leveransens dataplattform... Andra datalager och datakällor,
  exempelvis Microsoft SQL Server... ska hanteras som externa system eller
  integrationer").

## Nuläge i frontend

Datamängdsflödet går idag genom:

- `frontend/src/app/core/services/mock-data.service.ts` — generisk loader
  (`load<T>(fileName)`) som gör en `HttpClient.get` mot
  `assets/mock/<fil>.json`. Klassens egen kommentar säger uttryckligen att
  den är avsedd att senare bytas mot riktiga API-anrop på en enda plats.
- `frontend/src/app/services/data-catalog.service.ts` — kapslar
  `Dataset`/`InformationMart`/`DataService`/`BusinessApplication` och
  exponerar `getAllDatasets()`, `getDatasetById(id)`,
  `getDatasetsByIds(ids)`.
- `frontend/src/app/features/data-detail/data-detail.component.ts` —
  använder enbart `getDatasetById(id)` (via route-parametern `id`) och
  monterar `DatasetFieldsPreviewComponent` (från AB-023) i en sektion
  "Fält i datamängden".
- `getAllDatasets()` används betydligt bredare: sökning
  (`search.service.ts`), Datamarknadens utforskare
  (`data-market-explorer.component.ts`), katalogvyn
  (`data-catalog.component.ts`), behovskatalogen, rapportbeställning och
  behörighetsformuläret.

Frontendens konfigurationsmodell har redan de byggstenar en framtida
mock/API-växling behöver:

- `frontend/src/app/core/config/runtime-config.model.ts` — `RuntimeConfig`
  har redan `apiBaseUrl: string` och `features.useMockData: boolean`.
- `config/examples/appsettings.example.json` — en redan existerande, ej
  kopplad mall för en framtida .NET-backends konfiguration (connection
  string-platshållare, feature flags, `AllowedOrigins`).

Detta innebär att växlingsmekanismen mellan mock och API redan är
*modellerad* i repot — den är bara inte kopplad till någon faktisk HTTP-väg
ännu.

## Befintliga modeller och mockdataflöde

- `frontend/src/app/models/dataset.model.ts` — `Dataset` (id, name,
  description, dataDomain, owner, steward, source, accessModel,
  classification, updateFrequency, relaterade id-listor, metadataSource,
  lifecycleStatus, visibility, optional `sampleFields`).
- `frontend/src/app/models/dataset-field-preview.model.ts` —
  `DatasetFieldPreview` (name, dataType, description, exampleValue), tillagd
  i AB-023 som en liten, additiv delstruktur, inte en ny toppnivåentitet i
  informationsmodellen.
- `frontend/public/assets/mock/datasets.mock.json` — endast
  `dataset-sales-transactions-demo` har `sampleFields` med de fem fälten
  `transaktionsmanad`, `kundsegment`, `produktkategori`,
  `antal_transaktioner`, `beloppsintervall`.
- `frontend/src/app/shared/components/dataset-fields-preview/` —
  `DatasetFieldsPreviewComponent`, härleder den syntetiska previewraden
  direkt från fältlistan, med fast text om att exempeldata är syntetisk.

Denna struktur är exakt den POC:n behöver spegla i backend — ingen ny
informationsmodelländring krävs.

## Rekommenderad minsta API-yta

**Rekommendation (uppdaterad): två endpoints krävs för att bevisa den
vertikala kedjan — en för metadata, en för riktiga datarader.**

```
GET /api/datasets/{id}
GET /api/datasets/{id}/preview
```

`GET /api/datasets/{id}` — metadata och fältbeskrivningar (namn,
beskrivning, klassning, fält), hämtade av adaptern från dataset- och
fälttabellerna. Detta är exakt den yta `DataDetailComponent` konsumerar
idag via `getDatasetById(id)`.

`GET /api/datasets/{id}/preview` (**ny, tillagd i denna komplettering**) —
returnerar ett begränsat antal fiktiva datarader, hämtade av adaptern via en
riktig, parameteriserad `SELECT` mot en tillåten lokal SQL Server-tabell
eller vy för det angivna datasetet. Raderna får aldrig komma från en
hårdkodad JSON-fil eller en hårdkodad C#-lista i backend — poängen med
endpointen är just att bevisa den faktiska databasläsningen.

Motivering till att hålla detta som två separata endpoints snarare än att
väva in datarader i `/{id}`-svaret: metadatafrågan (dataset- och
fälttabeller) och dataradsfrågan (en tredje tabell/vy, se nedan) är två
skilda databasoperationer med olika risk- och prestandaprofil (den senare
kör en faktisk `SELECT` mot data, inte bara metadata), och en separat
endpoint gör det tydligt i loggar/granskning vilken kod som faktiskt rör
data kontra metadata.

`GET /api/datasets` (lista) används idag brett av flera komponenter (sök,
Datamarknadens utforskare, katalogvy, formulär), men är **fortsatt inte
nödvändig** för att bevisa den vertikala kedjan och kan fortsatt vara
utanför första POC:n. Den rekommenderas som en egen, snabb uppföljande AB
när/om fler komponenter faktiskt ska växla bort från mock.

## Rekommenderade backendägda API-kontrakt

Ett minimalt, backendägt DTO-par (engelska namn, kod skrivs i ett senare
AB):

- `DatasetDetailDto` — id, name, description, dataDomain, owner, steward,
  classification, updateFrequency, `fields: DatasetFieldDto[]`.
- `DatasetFieldDto` — fieldName, dataType, description, exampleValue.

Kontrakten:

- speglar strukturellt `Dataset` + `DatasetFieldPreview`, eftersom
  informationsmodellen redan är rätt avgränsad (AB-023) — men de är
  *backendens egna* typer, definierade i backendkoden, inte importerade
  från eller beroende av Angulars TypeScript-modeller;
- introducerar inget nytt parallellt verksamhetsbegrepp.

**Tillägg i denna komplettering — DTO för riktiga datarader:**

- `DatasetPreviewDto` — datasetId, `columns: string[]` (fältnamn, i samma
  ordning som fälttabellen), `rows: string[][]` (varje inre lista är en
  rad med värden i samma kolumnordning). Ett minimalt, generiskt kontrakt
  som gör att adaptern kan returnera valfritt antal fiktiva rader utan att
  API-kontraktet behöver kännas vid varje dataset unika kolumnnamn som
  egna DTO-fält.
- `DatasetPreviewDto` fylls av adaptern från en riktig `SELECT` mot den
  tillåtna previewtabellen/vyn (se "Rekommenderad lokal SQL
  Server-struktur" nedan) — den innehåller aldrig en klientderiverad eller
  hårdkodad rad.
- Denna DTO ersätter *inte* `DatasetFieldPreview` i informationsmodellen;
  den är backendens svar på `/preview`-endpointen och mappas i ett senare
  AB till samma UI-yta som `DatasetFieldsPreviewComponent` redan
  renderar.

## Rekommenderat adapterinterface på konceptnivå

Ett interface i backendens applikationslager, förslagsvis
`IDatasetMetadataAdapter` (namnform bör stämmas av mot den redan etablerade
`SqlServerAdapter`-konventionen i `docs/04_Systemarkitektur.md`):

- Ansvar (POC-omfång): hämta en datamängd med fältmetadata givet ett id,
  och returnera ett backendägt kontrakt (t.ex. `DatasetDetailDto`) eller en
  intern domänmodell som mappas till det i applikationslagret.
- **Tillägg i denna komplettering:** ett andra metodansvar, t.ex.
  `GetPreviewRowsAsync(datasetId, maxRows)`, som returnerar ett begränsat
  antal fiktiva rader (`DatasetPreviewDto` eller en intern motsvarighet)
  genom att köra en parameteriserad, radbegränsad `SELECT` mot den
  tillåtna previewtabellen/vyn för det angivna datasetet. Metoden accepterar
  **enbart** ett redan validerat dataset-id — aldrig ett tabellnamn,
  kolumnnamn eller SQL-fragment från anroparen (se nästa avsnitt).
- Möjligt utökat ansvar (senare, ej i denna POC): lista datamängder.
- Adaptern ska aldrig returnera SQL-specifika typer rakt upp och ner till
  API-kontrollagret, och aldrig Angulars TypeScript-modeller.
- Adaptern isolerar all SQL Server-åtkomst, så att ett framtida byte av
  datakälla (t.ex. till en riktig dataplattform) i första hand påverkar
  adaptern, inte API-kontraktet eller frontend — samma princip som
  `docs/04_Systemarkitektur.md` redan beskriver för adaptrar generellt.

## Säker koppling mellan dataset-id och tillåten tabell/vy (tillägg i denna komplettering)

Frontend och API-kontrollagret får aldrig skicka eller acceptera ett
tabellnamn, kolumnnamn eller SQL-fragment — enbart ett dataset-id (samma
id-rymd som redan finns i `Dataset`/mockdata). Rekommenderad princip:

- **Server-side allowlist, inte klientstyrd mappning.** Adaptern håller en
  hårdkodad (eller vid behov konfigurationsstyrd, men aldrig
  klientstyrd) mappning från kända dataset-id till en specifik
  tabell-/vyreferens, t.ex. en liten `Dictionary<string, string>` eller ett
  `switch`-uttryck i kod. I POC-omfånget (endast
  `dataset-sales-transactions-demo`) räcker en enda hårdkodad post.
- **Validera innan databasen nås.** Ett dataset-id som inte finns i
  allowlistan avvisas med 404 innan någon SQL körs — aldrig genom att
  försöka konstruera ett tabellnamn dynamiskt från id:t.
- **Alltid parameteriserade frågor.** Själva radhämtningen använder
  SQL-parametrar för eventuella filtervärden; tabell-/vynamnet i frågan är
  alltid en hårdkodad literal från allowlistan, aldrig strängsammanfogat
  från indata.
- **Radbegränsning styrs av backend, inte klienten.** Frågan begränsar
  antalet returnerade rader (t.ex. `SELECT TOP (5) ...`) som en fast del
  av den hårdkodade frågan, inte som en klientstyrd parameter.
- **Inga godtyckliga tabellnamn eller SQL-fragment accepteras** från
  frontend eller några query-parametrar utöver dataset-id — detta gäller
  även interna verktygsanrop eller framtida administrationsgränssnitt.
- En bredare, konfigurationsdriven allowlist-mekanism (t.ex. om fler
  dataset ska få previewstöd) lämnas som en möjlig framtida AB, inte en
  del av denna POC.

## Rekommenderad lokal SQL Server-struktur (konceptnivå)

**Rekommendation: separata tabeller för dataset och fält, inte en vy.**

Motivering: Det speglar tydligast den uppdelning som redan finns mellan
`Dataset` och `DatasetFieldPreview`, är enklast att fylla med helt fiktiv
data, och kräver ingen extra vylogik för en POC av denna storlek.

Minimal struktur (konceptnivå, inga SQL-script skapas i detta AN):

- **Dataset-tabell:** dataset-id, namn, beskrivning,
  informationssäkerhetsklassning.
- **Fält-tabell:** koppling till dataset-id, fältnamn, datatyp,
  fältbeskrivning, säkert exempelvärde.
- **Previewrad-tabell eller -vy (tillägg i denna komplettering):** en
  tredje, konkret tabell eller vy med typade kolumner som motsvarar de fem
  redan befintliga sample-fälten för `dataset-sales-transactions-demo`
  (`transaktionsmanad`, `kundsegment`, `produktkategori`,
  `antal_transaktioner`, `beloppsintervall`), innehållande ett fåtal (t.ex.
  3–5) helt fiktiva rader. Det är denna tabell/vy `/preview`-endpointen
  faktiskt läser via den riktiga `SELECT`:en, kopplad till dataset-id via
  den hårdkodade allowlistan i föregående avsnitt — inte via fritt
  tabellnamn.

Den tidigare planerade, klientderiverade "syntetiska previewraden" (härledd
i frontend från fältlistans exempelvärden, som `DatasetFieldsPreviewComponent`
gör idag) ersätts i den vertikala POC:n av denna riktiga databasläsning:
samma UI-yta ska visas, men datan bakom den kommer nu från SQL Server via
`/preview`, inte från klientlogik.

All data i denna struktur, inklusive previewradernas kolumnvärden, ska vara
fiktiv; ingen produktionsdata eller anonymiserad verklig data får användas,
i enlighet med projektets säkerhetsprincip och
`frontend/public/assets/mock/README.md`s grundprinciper.

## Mappning mellan API-DTO:er och befintliga frontendmodeller

| Backend-DTO (föreslagen)      | Frontend-modell (befintlig)                          |
| ------------------------------- | ------------------------------------------------------- |
| `DatasetDetailDto.id`          | `Dataset.id`                                            |
| `DatasetDetailDto.name`        | `Dataset.name`                                          |
| `DatasetDetailDto.description` | `Dataset.description`                                   |
| `DatasetDetailDto.dataDomain`  | `Dataset.dataDomain`                                     |
| `DatasetDetailDto.owner`       | `Dataset.owner`                                          |
| `DatasetDetailDto.steward`     | `Dataset.steward`                                        |
| `DatasetDetailDto.classification` | `Dataset.classification` (`InformationSecurityClassification`) |
| `DatasetDetailDto.updateFrequency` | `Dataset.updateFrequency`                           |
| `DatasetFieldDto.fieldName`    | `DatasetFieldPreview.name`                               |
| `DatasetFieldDto.dataType`     | `DatasetFieldPreview.dataType`                           |
| `DatasetFieldDto.description`  | `DatasetFieldPreview.description`                        |
| `DatasetFieldDto.exampleValue` | `DatasetFieldPreview.exampleValue`                       |

Mappningen är i huvudsak 1:1 eftersom informationsmodellen redan är rätt
avgränsad. Fält som inte behövs för denna POC (t.ex. `relatedSystemIds`,
`visibility`, `lifecycleStatus`) inkluderas inte i det minimala DTO:t utan
lämnas till en eventuell senare, bredare AB om det visar sig behövas.

**Tillägg i denna komplettering — preview-DTO:**

| Backend-DTO (föreslagen)   | Frontend-yta (befintlig)                                             |
| ---------------------------- | ------------------------------------------------------------------------ |
| `DatasetPreviewDto.columns` | Kolumnrubriker i `DatasetFieldsPreviewComponent`s previewtabell (idag härledda client-side från `fields()`-listans `name`) |
| `DatasetPreviewDto.rows`    | Previewradens värden i samma komponent (idag härledda client-side från `fields()`-listans `exampleValue`) |

I ett senare implementations-AB ersätts komponentens klientderiverade
previewrad med de rader `/preview`-endpointen faktiskt returnerar, utan att
komponentens publika kontrakt (`fields`, `objectLabel`) behöver ändras mer
än nödvändigt.

## Konfiguration och secrets-hantering

- Lokal connection string hanteras via **.NET user secrets** i det
  kommande implementations-AB:t — hålls helt utanför repot.
- `config/examples/appsettings.example.json` (redan existerande, ej kopplad
  till kod) beskriver rätt mönster för strukturen (platshållare, inga
  riktiga värden) och bör återanvändas som förebild, inte skrivas om i detta
  AN.
- Ingen verklig connection string, servernamn eller credential skrivs i
  denna rapport eller i repot.

## Frontend-växling mellan mock och API

Rekommendation: bygg vidare på det som redan finns istället för att
uppfinna en ny mekanism.

- `RuntimeConfig.features.useMockData` + `RuntimeConfig.apiBaseUrl`
  (befintliga fält i `runtime-config.model.ts`) är den naturliga
  konfigurationspunkten för att avgöra datakälla.
- Minsta möjliga lösning: en datakälla-strategi bakom
  `DataCatalogService` (eller ett syskon till `MockDataService`) som väljer
  mellan mock-JSON och ett API-anrop baserat på denna konfiguration, så att
  ingen konsumerande komponent (`data-detail`, sök, Datamarknadens
  utforskare m.fl.) behöver känna till varifrån datan kommer.
- Ingen ny feature-flagg-modell, inget nytt Angular environment-koncept och
  ingen implementation krävs eller föreslås i detta AN — endast att den
  redan existerande mekanismen är rätt växlingspunkt.

## Säkerhets- och repo-hygien

- Denna rapport innehåller inga interna URL:er, connection strings,
  servernamn, AD-grupper, credentials, produktionsdata eller
  personuppgifter.
- Rekommendationerna instruerar uttryckligen framtida AB-item att hålla
  SQL Server-data helt fiktiv och secrets utanför repot.
- Inga kod-, mockdata- eller konfigurationsfiler i `frontend/` eller
  `config/` har ändrats eller föreslås ändrade av detta AN.

## Verifieringsförslag för framtida AB

När POC:n implementeras i separata AB-item bör respektive AB minst
verifiera:

- `npm.cmd --prefix frontend run build` och
  `npm.cmd --prefix frontend test -- --watch=false` för alla
  frontendberörande AB.
- En backend-byggverifiering (t.ex. `dotnet build`) för alla
  backendberörande AB, definierad i det AB som etablerar
  .NET-projektstrukturen.
- Manuell end-to-end-kontroll: att `data-detail` för
  `dataset-sales-transactions-demo` visar samma fält och en previewrad
  via API som den idag gör via mock.
- **Tillägg i denna komplettering:** kodgranskning eller motsvarande
  kontroll av att `/preview`-endpointen faktiskt kör en parameteriserad
  `SELECT` mot SQL Server (t.ex. via loggning, SQL-profilering eller
  enhetstest mot en testdatabas) och inte returnerar en hårdkodad C#-lista
  eller JSON.
- **Tillägg i denna komplettering:** kontroll av att ett okänt eller
  otillåtet dataset-id mot `/preview` ger 404 utan att någon SQL körs, och
  att inget tabellnamn eller SQL-fragment kan skickas in via API:et.
- `npm.cmd run project -- validate` och `git diff --check` för samtliga AB.

## Föreslagna framtida work items

Små, separata AB-item (skapas inte i detta AN). Uppdaterade i denna
komplettering så att den första vertikala kedjan uttryckligen inkluderar
riktiga datarader, inte bara metadata:

1. Etablera minimal .NET Web API-struktur (skelett, ingen affärslogik).
2. Skapa `SqlServerAdapter`/metadataadapter samt lokal fiktiv SQL
   Server-datakälla: dataset-tabell, fält-tabell **och** en
   previewrad-tabell/vy för `dataset-sales-transactions-demo` med fiktiva
   datarader.
3. Införa backendägda API-kontrakt (`DatasetDetailDto`, `DatasetFieldDto`,
   `DatasetPreviewDto`) samt **båda** endpoints:
   `GET /api/datasets/{id}` (metadata) och
   `GET /api/datasets/{id}/preview` (riktiga fiktiva datarader via
   parameteriserad, radbegränsad `SELECT` mot en dataset-id-validerad
   allowlist).
4. Koppla `DataCatalogService`/`MockDataService` och
   `DatasetFieldsPreviewComponent` till API:et via `RuntimeConfig`
   (mock/API-strategi), så att komponentens previewrad visas med data
   hämtad från SQL Server via `/preview` istället för klientderiverad, utan
   att ändra komponentens publika kontrakt mer än nödvändigt.
5. Verifiera hela den vertikala lokala kedjan end-to-end — Angular → .NET
   API → SQL Server-adapter → lokal SQL Server → fiktiva datarader →
   befintlig previewvy — och dokumentera resultatet.

## Risker

- Att ett framtida AB av misstag återinför `sampleFields`/SQL-data som
  "riktig" produktionskälla om avgränsningen mot fiktiv data inte upprepas
  tydligt i respektive AB-kontrakt.
- Sammanblandning med PostgreSQL-rollen (portalens egen applikationsdata)
  om ett senare AB inte håller isär "portalens egen data" och "extern
  datakälla via adapter".
- Scope creep mot autentisering, CORS-detaljer eller deployment om
  framtida AB-förslag inte hålls lika strikt avgränsade som detta AN.
- Att listendpointen (`GET /api/datasets`) glöms bort som separat
  uppföljning och att komponenter som förlitar sig på `getAllDatasets()`
  därför inte kan växla förrän ett ytterligare AB genomförs.
- **Tillägg i denna komplettering:** att ett framtida AB av misstag bygger
  `/preview`-frågan med strängsammanfogad SQL eller accepterar ett
  tabellnamn/SQL-fragment från klienten, vilket skulle öppna för
  SQL-injektion — allowlist- och parameteriseringsprincipen ovan måste
  följas strikt.
- **Tillägg i denna komplettering:** att radbegränsningen (`TOP N`) glöms
  bort och att `/preview` av misstag kan returnera ett obegränsat antal
  rader.

## Öppna frågor

- Ska POC:ns första bevisbara metadata-endpoint vara enbart detalj
  (`GET /api/datasets/{id}`, denna rapports rekommendation), eller ska
  listendpointen (`GET /api/datasets`) tas med redan i första
  implementations-AB för att undvika ett extra växlingssteg för de
  komponenter som idag använder `getAllDatasets()`?
- Ska adaptergränssnittet namnges `SqlServerAdapter` (rakt av enligt
  `docs/04_Systemarkitektur.md`s adapterkatalog) eller ett mer
  domänspecifikt namn som `IDatasetMetadataAdapter`?
- **Tillägg i denna komplettering:** vilket maxantal fiktiva rader (t.ex.
  `TOP 5`) ska `/preview`-endpointen returnera som standard i första
  implementations-AB?
- **Tillägg i denna komplettering:** ska previewrad-tabellen/vyn vara en
  egen, konkret tabell med typade kolumner (denna rapports rekommendation)
  eller en mer generisk EAV-liknande struktur, om fler dataset senare ska
  få previewstöd?

## Slutsats och rekommendation

Den föreslagna kedjan (Angular → .NET Web API → metadataadapter → lokal
fiktiv SQL Server) är väl avgränsad, tekniskt liten och ligger helt i linje
med redan beslutad målarkitektur i `docs/04_Systemarkitektur.md`
(`SqlServerAdapter` är redan namngiven där som en av flera exempeladaptrar,
och separationen mot PostgreSQL som portalens egen applikationsdatabas är
redan etablerad).

Rekommendationen är att gå vidare med **två** endpoints som första
bevisbara steg — `GET /api/datasets/{id}` för metadata och
`GET /api/datasets/{id}/preview` för riktiga, fiktiva datarader hämtade via
en parameteriserad, radbegränsad `SELECT` mot en dataset-id-validerad
allowlist — med backendägda DTO:er (`DatasetDetailDto`, `DatasetFieldDto`,
`DatasetPreviewDto`) som strukturellt speglar men inte importerar Angulars
`Dataset`/`DatasetFieldPreview`, en tydlig adapter mot en lokal, fiktiv SQL
Server-datakälla med tre tabeller/vyer (dataset, fält, previewrader),
secrets hanterade via .NET user secrets, och en frontend-växling byggd på
den redan existerande
`RuntimeConfig.features.useMockData`/`apiBaseUrl`-mekanismen, där den
befintliga `DatasetFieldsPreviewComponent` i ett senare AB matas med
databas­hämtade rader istället för klientderiverade. Implementation sker i
de fem föreslagna, separata AB-item ovan, vart och ett litet och oberoende
granskningsbart. Denna vertikala kedja — Angular → .NET API → SQL
Server-adapter → lokal SQL Server → fiktiva datarader → befintlig
previewvy — bevisar både metadatahämtning och en riktig databasläsning,
vilket var projektägarens huvudsakliga mål med POC:n.
