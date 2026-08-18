# Portal.Api – lokal SQL Server-preview-POC (AB-027, AB-030, AB-031, AB-032)

## Syfte och avgränsning

Detta är portalens .NET-baserade backend-POC. Den bevisar en liten, lokal
vertikal kedja:

```
Angular -> lokalt .NET Web API -> SqlServerDatasetSourceAdapter -> lokal SQL Server
        -> en riktig, radbegränsad SELECT -> fiktiva datarader i portalens
        befintliga preview (DatasetFieldsPreviewComponent)
```

Den är **inte** en generell produktionsintegration och innehåller ingen
autentisering, auktorisering eller deployment. Detta är portalens
dokumenterade ordinarie backendriktning (Angular → .NET Web API →
integrationsadaptrar) — till skillnad från den separata, tillfälliga
Node.js/TypeScript/Trino-lakehouse-labb-POC:n som beskrivs i
[`../LAKEHOUSE_POC.md`](../LAKEHOUSE_POC.md).

Bakgrund och avgränsning: [`../../docs/analysis/AN-009_lokal_backend_poc_datamarknad.md`](../../docs/analysis/AN-009_lokal_backend_poc_datamarknad.md),
work item [`../../docs/work-items/AB-027.md`](../../docs/work-items/AB-027.md)
och work item [`../../docs/work-items/AB-030.md`](../../docs/work-items/AB-030.md).

Sedan AB-030 registrerar `KnownDatasetsRegistry` två fiktiva demodatamängder,
för att visa att samma vertikala kedja generaliserar till mer än en
datamängd utan ny kod:

| Dataset-id | Previewkälla (SQL Server) | Skapad av |
| --- | --- | --- |
| `dataset-sales-transactions-demo` | `dbo.SalesTransactionsDemoPreview` (tabell) | `database/sqlserver-preview-poc.sql` (AB-027) |
| `dataset-weather-warning-events-demo` | `demo_dm.weather_warning_events` (läsbar DM-vy) | `database/sqlserver-weather-warning-dw-dm-im-poc.sql` (AB-029) |

Sedan AB-031 kan `dataset-weather-warning-events-demo` dessutom visa sitt manuellt
deklarerade, omedelbara ursprung
(`demo_dw.weather_warning_event_source`), registrerat av
`database/sqlserver-weather-warning-declared-origin-poc.sql`. Detta är en
teknisk källreferens, inte full eller automatiskt upptäckt lineage, och inte en
relation till ett annat katalogobjekt (`Dataset`, `InformationMart` eller
Dataprodukt) — se [`../WEATHER_WARNING_POC.md`](../WEATHER_WARNING_POC.md).

Sedan AB-032 finns dessutom en **helt separat, generisk teknisk
discovery-mekanism** (`GET /api/technical-assets`) som inte hör till ovanstående
per-dataset-registrering. Se avsnittet "Generisk teknisk discovery (AB-032)"
nedan för vad den bevisar och hur den skiljer sig från allt ovan.

Sex begrepp skiljs tydligt åt i denna POC:

* **Frontendens mockläge** (`features.useMockData: true`, standard) — Angular
  visar en syntetisk previewrad härledd client-side från dataobjektets
  `sampleFields`, utan något API-anrop. Se
  [`../../frontend/public/assets/mock/README.md`](../../frontend/public/assets/mock/README.md).
* **Lokalt API-läge** — Angular anropar detta API istället för att härleda
  raden client-side (aktiveras via `runtime-config.local.json`, se nedan).
* **Statisk metadata** (`GET /api/datasets/{id}`) — registerbaserad
  beskrivning av datamängden (namn, ägare, fält osv.). Kräver ingen SQL
  Server-anslutning, oavsett vilket dataset-id som frågas.
  `dataset-weather-warning-events-demo`s metadata beskriver **fiktiv,
  SMHI-inspirerad** exempeldata — den är varken verklig SMHI-data eller en
  integration med SMHI.
* **SQL-baserad preview** (`GET /api/datasets/{id}/preview`) — den enda
  delen som faktiskt läser från SQL Server, via en parameteriserad,
  radbegränsad `SELECT` mot exakt det tabell- eller vynamn som
  `KnownDatasetsRegistry` anger för respektive dataset-id.
* **Deklarerat ursprung** (`GET /api/datasets/{id}/declared-origins`,
  AB-031) — en separat, liten SQL-läsande väg som returnerar samtliga
  manuellt registrerade, omedelbara uppströmskällor för ett känt dataset-id
  från `demo_metadata.declared_dataset_origins`, sorterade deterministiskt.
  Ett känt dataset utan registrerat ursprung ger en tom lista, inte ett fel.
  Detta är skilt från `SqlServerDatasetSourceAdapter`/`IDatasetSourceAdapter`,
  som fortsatt endast hanterar previewdata.
* **Generisk teknisk discovery** (`GET /api/technical-assets`, AB-032) — läser
  SQL Servers egen systemkatalog (`INFORMATION_SCHEMA`) inom ett konfigurerat
  schema-scope och returnerar tekniska asset-kandidater (tabeller/vyer och
  deras kolumner). Se nedan för avgränsningen mot `KnownDatasetsRegistry`.

## Generisk teknisk discovery (AB-032)

`GET /api/technical-assets` bevisar ett annat, mindre steg än allt ovan:
**teknisk discovery inom ett konfigurerat scope**, inte publicering av en ny
datamängd.

```
SQL Server INFORMATION_SCHEMA
        -> konfigurerat schema-scope (DatasetDiscovery-konfiguration, se "Konfigurationsmodell")
        -> SqlServerTechnicalAssetDiscoveryAdapter
        -> DiscoveredTechnicalAssetDto (teknisk kandidat, INTE en Dataset)
        -> GET /api/technical-assets
```

Skillnader mot `KnownDatasetsRegistry`/`GET /api/datasets/{id}`:

* Konfigurationen (`DatasetDiscovery`-sektionen) anger **var** discovery får
  leta (en käll-identifierare, ett SQL `LIKE`-mönster för schema, samt
  tillåtna objekttyper `Table`/`View`) — den listar **aldrig** enskilda
  tabell-, vy- eller dataset-namn. Ett nytt objekt inom redan konfigurerat
  scope upptäcks alltså av nästa anrop utan någon ändring i repositoryt.
* Det finns **inget separat databas-/catalog-fält** i konfigurationen.
  Databasscopet är implicit: det är den databas som
  `ConnectionStrings:Default` pekar mot. Adaptern läser databasnamnet
  dynamiskt (`SELECT DB_NAME();`) för att inkludera det i svaret, men
  frågar aldrig över flera databaser. Se avsnittet "Konfigurationsmodell"
  nedan.
* Svaret är en egen `DiscoveredTechnicalAssetDto` (teknisk identitet,
  källa, databas, schema, objektnamn, objekttyp, kolumner med SQL-datatyp) —
  **inte** `DatasetDetailDto`. Ett upptäckt tekniskt objekt är inte
  automatiskt en publicerad `Dataset`- eller `InformationMart`-post:
  `Dataset.classification` är obligatorisk (ADR-0006), och discovery har
  ingen grund för att gissa klassning, ägare, visningsnamn eller
  beskrivning. Publicering till `/data`/Datamarknaden är medvetet **inte**
  löst av detta AB.
* `KnownDatasetsRegistry`, `IDatasetSourceAdapter`,
  `SqlServerDatasetSourceAdapter`, `IDeclaredDatasetOriginAdapter`,
  `SqlServerDeclaredOriginAdapter` och de två redan registrerade
  demodatamängderna är helt oförändrade och opåverkade. De två mekanismerna
  (den befintliga per-dataset-registreringen och den nya, generiska
  discoveryn) existerar medvetet parallellt.
* Endpointen tar inget schema- eller tabellnamn från klienten. Scopet är
  uteslutande serverkonfigurerat, och identifierare i den genererade SQL:en
  kommer uteslutande från SQL Servers egen katalog inom det redan godkända
  scopet.

### Konfigurationsmodell

Modellen, faktisk för denna implementation:

```text
connection/runtime-konfiguration (ConnectionStrings:Default)
        ↓
vald SQL Server-databas
        ↓
DatasetDiscovery.SchemaPattern (miljöspecifik)
        ↓
DatasetDiscovery.AllowedObjectTypes (generell default)
```

Den versionshanterade, miljöneutrala `appsettings.json` innehåller
**endast** den generella defaulten:

```json
"DatasetDiscovery": {
  "AllowedObjectTypes": ["Table", "View"]
}
```

`SourceId` och `SchemaPattern` är **miljöspecifika** POC-antaganden (vilken
källa, vilket schema-mönster) och ligger därför **inte** i basfilen — i
linje med `docs/05_Konfiguration.md`s princip att miljöberoende värden inte
ska hårdkodas i den generiska, deploybara konfigurationen. Utan dem ger
`GET /api/technical-assets` ett kontrollerat 500-fel
(`DatasetDiscovery:SourceId is not configured.` respektive
`DatasetDiscovery:SchemaPattern is not configured.`) — API:et startar
fortfarande normalt, precis som när `ConnectionStrings:Default` saknas.

För lokal utveckling: kopiera den versionshanterade mallen
`backend/Portal.Api/appsettings.Development.example.json` till
`backend/Portal.Api/appsettings.Development.json` (redan gitignorad, se
`.gitignore`). ASP.NET Core läser filen automatiskt när miljön är
`Development` (samma miljö som redan krävs för `dotnet user-secrets`, se
nedan) — ingen ny kod eller konfigurationsmekanism behövs. Mallen
innehåller denna POC:s egna, redan versionshanterade fiktiva scheman
(`demo_dw`/`demo_dm`/`demo_im` från AB-029/AB-031):

```json
"DatasetDiscovery": {
  "SourceId": "local-sql-server-poc",
  "SchemaPattern": "demo%"
}
```

I en annan miljö (t.ex. en framtida jobbmiljö) tillförs motsvarande värden
på samma sätt som andra miljöspecifika värden redan hanteras i projektet —
via lokal `appsettings.{Environment}.json`, miljövariabler eller
motsvarande godkänd runtime-mekanism (`docs/05_Konfiguration.md`) — aldrig
genom att skriva in dem i den versionshanterade basfilen. Samma
applikationskod och deploybara artefakt används; endast konfigurationen
skiljer sig åt.

Kräver att databasen, connection string (se ovan) och minst ett av
AB-029/AB-031:s script är körda i samma lokala databas.

### Schema-mönster med bokstavligt understreck (t.ex. `im_`)

`SchemaPattern` tolkas som SQL Servers eget `LIKE`-mönster, **inte** som ett
reguljärt uttryck. I T-SQL `LIKE` matchar `_` **ett godtyckligt tecken**, inte
bokstavligt understreck. Mönstret `im_%` matchar därför **inte bara**
scheman som bokstavligen börjar med `im_` (t.ex. `im_smhi`) utan **även**
scheman som `imXfoo`, `im5bar` osv. — ett bredare, oavsiktligt scope.

**För att matcha scheman som bokstavligen börjar med `im_`, använd SQL
Servers egna hakparentes-escape i mönstret:**

```json
"SchemaPattern": "im[_]%"
```

`[_]` betyder "exakt ett tecken ur mängden `{_}`", dvs. exakt ett bokstavligt
understreck — inte ett wildcard. `im[_]%` matchar alltså `im_smhi` men
**inte** `imXfoo`. Detta kräver ingen kodändring eller nytt
konfigurationsfält: `SchemaPattern` skickas oförändrat vidare som
`LIKE`-parameterns värde (se `DiscoveryObjectsQuery` och dess
databasfria tester i `Portal.Api.Tests`), så SQL Servers egen,
inbyggda hakparentes-syntax gör jobbet.

## Projektstruktur

```text
backend/
  Portal.slnx
  Portal.Api/            Denna .NET Web API (net10.0)
    appsettings.json                  Miljöneutral baskonfiguration (versionshanterad)
    appsettings.Development.example.json  Mall för lokal DatasetDiscovery-config (versionshanterad)
    Contracts/           Backendägda DTO:er (DatasetDetailDto, DatasetFieldDto, DatasetPreviewDto, DeclaredDatasetOriginDto, DiscoveredTechnicalAssetDto)
    Datasets/            IDatasetSourceAdapter, SqlServerDatasetSourceAdapter, IDeclaredDatasetOriginAdapter, SqlServerDeclaredOriginAdapter, KnownDatasetsRegistry,
                         DatasetDiscoveryOptions, DiscoveryObjectTypeMapper, DiscoveryObjectsQuery, TechnicalAssetIdentity, ITechnicalAssetDiscoveryAdapter, SqlServerTechnicalAssetDiscoveryAdapter
    Controllers/         DatasetsController, TechnicalAssetsController
  Portal.Api.Tests/      Databasfria enhetstester (KnownDatasetsRegistry, DatasetsController, teknisk discovery)
  database/
    sqlserver-preview-poc.sql   Fiktivt schema + seed-data
```

## Förutsättningar

* .NET 10 SDK (kontrollera med `dotnet --version`).
* SQL Server (t.ex. SQL Server 2025 Developer) och SQL Server Management Studio
  (SSMS), installerade lokalt av dig.
* Angular-frontend körbar enligt [`docs/08_Lokal_utvecklingsmiljö.md`](../../docs/08_Lokal_utvecklingsmiljö.md)
  (valfritt för att se resultatet i portalens UI).

Ingen connection string, inget servernamn och inga credentials skrivs i detta
repository. Du väljer och konfigurerar din egen lokala SQL Server-instans.

## Skapa den lokala POC-databasen (PortalPocLocal)

Den lokala SQL Server-databasen heter **PortalPocLocal**. Det är det faktiska,
avsedda namnet på denna POC:s lokala databas — en lokal databas för
utvecklings- och demonstrationsändamål som endast innehåller en liten fiktiv
datamängd. Den är **inte** en delad intern testmiljö, ingen acceptansmiljö,
ingen produktionsmiljö och inte portalens framtida applikationsdatabas.
**PostgreSQL är fortsatt portalens beslutade databas för applikationsdata**
(se [`docs/04_Systemarkitektur.md`](../../docs/04_Systemarkitektur.md)) — SQL
Server/PortalPocLocal ersätter inte den, utan hör uteslutande till denna
avgränsade preview-POC.

`backend/database/sqlserver-preview-poc.sql` väljer eller skapar inte någon
databas åt dig och hårdkodar inget databasnamn — scriptet innehåller enbart
ett skydd som vägrar köra mot systemdatabaserna `master`, `model`, `msdb`
eller `tempdb`.

1. Öppna SSMS och anslut till din lokala SQL Server (t.ex. `localhost`).
2. Skapa eller välj databasen **PortalPocLocal** som aktiv databas (kör t.ex.
   `CREATE DATABASE PortalPocLocal;` om den inte redan finns, och
   `USE PortalPocLocal;` i samma query-fönster innan nästa steg).
3. Öppna `backend/database/sqlserver-preview-poc.sql` i SSMS och kör det mot
   `PortalPocLocal`. Scriptet tar bort och återskapar tabellen
   `dbo.SalesTransactionsDemoPreview` med fem helt fiktiva rader varje gång
   det körs (`DROP TABLE IF EXISTS` + `CREATE TABLE` + `INSERT`), så det är
   säkert att köra om.

Scriptet innehåller inget servernamn, ingen connection string och ingen
produktionsdata.

För att även kunna previewa `dataset-weather-warning-events-demo` behöver
`demo_dm.weather_warning_events` finnas i samma databas. Den skapas av ett
separat script,
[`../database/sqlserver-weather-warning-dw-dm-im-poc.sql`](../database/sqlserver-weather-warning-dw-dm-im-poc.sql)
(AB-029) — se [`../WEATHER_WARNING_POC.md`](../WEATHER_WARNING_POC.md) för
körinstruktioner. Scriptet är fristående och hör inte till `Portal.Api`,
men kan köras mot samma lokala POC-databas (t.ex. `PortalPocLocal`) som
denna sida beskriver.

För att även kunna hämta `dataset-weather-warning-events-demo`s deklarerade
ursprung (`GET .../declared-origins`) behöver
`demo_metadata.declared_dataset_origins` finnas i samma databas. Den skapas
av ytterligare ett separat script,
[`../database/sqlserver-weather-warning-declared-origin-poc.sql`](../database/sqlserver-weather-warning-declared-origin-poc.sql)
(AB-031), som i sin tur kräver att `demo_dw.weather_warning_event_source`
(från AB-029:s script) redan finns. Se
[`../WEATHER_WARNING_POC.md`](../WEATHER_WARNING_POC.md) för körinstruktioner.

## Konfigurera lokal connection string (.NET user secrets)

Kör från `backend/Portal.Api/`:

```powershell
dotnet user-secrets set "ConnectionStrings:Default" "<local-connection-string>"
```

Ersätt `<local-connection-string>` med din egen lokala anslutningssträng mot
`PortalPocLocal` (t.ex. mot `localhost` med Windows-autentisering). Skriv
aldrig ett riktigt värde i en fil som checkas in, i en chatt eller i en
handoff — `dotnet user-secrets` lagrar värdet utanför repositoryt, i din
lokala användarprofil (identifierat av `UserSecretsId` i
`Portal.Api.csproj`, för närvarande `portal-api-sqlserver-preview-poc`).

Kontrollera vid behov vad som är satt (fortfarande från `backend/Portal.Api/`,
och utan att återge värdet i en delad kanal):

```powershell
dotnet user-secrets list
```

## Starta API:et

Från `backend/`:

```powershell
dotnet run --project Portal.Api
```

API:et startar enligt `Portal.Api/Properties/launchSettings.json` på
**`http://localhost:5104`** (kontrollera terminalens utdata om porten
skiljer sig). Miljön är satt till `Development`, vilket krävs för att .NET
automatiskt ska läsa in dina user secrets.

CORS tillåter som standard endast `http://localhost:4200` (se
`appsettings.json`, nyckeln `AllowedOrigins`) — ändra listan om din
Angular-instans körs på en annan lokal port.

## Endpoints

* `GET /health` — enkel hälsokontroll, kräver ingen SQL Server-anslutning.
* `GET /api/datasets/{id}` — statisk, registerbaserad metadata för ett känt
  id (`dataset-sales-transactions-demo` eller
  `dataset-weather-warning-events-demo`). Kräver ingen SQL Server-anslutning.
* `GET /api/datasets/{id}/preview` — riktiga fiktiva datarader via en
  parameteriserad `SELECT` mot det tabell- eller vynamn
  `KnownDatasetsRegistry` anger för respektive id (`dbo.SalesTransactionsDemoPreview`
  respektive `demo_dm.weather_warning_events`). Kräver att databasen och
  connection string ovan är på plats, samt (för vädervarningsdatamängden)
  att `demo_dm.weather_warning_events` finns i samma databas.
* `GET /api/datasets/{id}/declared-origins` (AB-031) — samtliga manuellt
  registrerade, omedelbara uppströmskällor för ett känt dataset-id, lästa
  från `demo_metadata.declared_dataset_origins`. Ett okänt dataset-id ger
  `404` utan SQL-anrop; ett känt dataset utan registrerat ursprung ger `200`
  med en tom array. Kräver att databasen, connection string och (för
  vädervarningsdatamängden) `demo_metadata.declared_dataset_origins` finns på
  plats — se
  [`../database/sqlserver-weather-warning-declared-origin-poc.sql`](../database/sqlserver-weather-warning-declared-origin-poc.sql).
* `GET /api/technical-assets` (AB-032) — generisk teknisk discovery inom det
  konfigurerade `DatasetDiscovery`-scopet (se "Konfigurationsmodell" ovan;
  kräver lokalt en `appsettings.Development.json`, t.ex. med schema-mönster
  `demo%`, tabeller och vyer). Returnerar en lista
  `DiscoveredTechnicalAssetDto` för varje objekt som matchar scopet, inte en
  `Dataset`. Tar inget schema- eller tabellnamn från klienten. Kräver att
  databasen och connection string ovan är på plats; ett tomt scope (inga
  matchande objekt) ger `200` med en tom array, inte ett fel. Saknas
  `SourceId`/`SchemaPattern` helt ger anropet ett kontrollerat 500-fel.

## Verifiera

Utan databasanslutning, från `backend/` (samma katalog som `Portal.slnx`,
så att både `Portal.Api` och `Portal.Api.Tests` omfattas):

```powershell
dotnet restore
dotnet build
dotnet test
```

Med databasanslutning:

* Öppna `http://localhost:5104/health` — ska svara `{"status":"ok"}`.
* Öppna `http://localhost:5104/api/datasets/dataset-sales-transactions-demo` —
  ska svara med statisk metadata.
* Öppna `http://localhost:5104/api/datasets/dataset-sales-transactions-demo/preview` —
  ska svara med upp till 10 fiktiva rader lästa från `PortalPocLocal`.
* Öppna `http://localhost:5104/api/datasets/dataset-weather-warning-events-demo` —
  ska svara med statisk metadata.
* Öppna `http://localhost:5104/api/datasets/dataset-weather-warning-events-demo/preview` —
  ska svara med upp till 10 fiktiva rader lästa från
  `demo_dm.weather_warning_events`, förutsatt att den vyn finns i samma
  databas (se ovan).
* Öppna `http://localhost:5104/api/datasets/dataset-weather-warning-events-demo/declared-origins` —
  ska svara med en JSON-array som innehåller exakt en post
  (`demo_dw`/`weather_warning_event_source`), förutsatt att
  `demo_metadata.declared_dataset_origins` finns i samma databas (se
  [`../WEATHER_WARNING_POC.md`](../WEATHER_WARNING_POC.md)).
* Öppna `http://localhost:5104/api/datasets/dataset-sales-transactions-demo/declared-origins` —
  ska svara med en tom JSON-array (`[]`), inte ett fel.
* Öppna `http://localhost:5104/api/datasets/okant-id/preview` respektive
  `/declared-origins` — ska ge `404` på båda, utan SQL-anrop.
* Skapa först en lokal `appsettings.Development.json` (kopiera från
  `appsettings.Development.example.json`, se "Konfigurationsmodell" ovan) —
  utan den ger `/api/technical-assets` ett kontrollerat 500-fel istället för
  ett resultat.
* Öppna `http://localhost:5104/api/technical-assets` — ska svara med en
  JSON-array av tekniska kandidater för samtliga tabeller/vyer i scheman som
  matchar det lokalt konfigurerade `SchemaPattern` (standard i mallen:
  `demo%`, dvs. bl.a. `demo_dm.weather_warning_events`, `demo_dm.dim_event`
  m.fl. från AB-029, samt `demo_metadata.declared_dataset_origins` från
  AB-031 om det scriptet är kört), förutsatt att motsvarande script är
  körda i samma databas. Se "Test 2" nedan för det avgörande beviset: att ett
  manuellt tillagt nytt objekt i samma redan konfigurerade scope upptäcks
  utan någon ändring i repositoryt.

### Manuell verifiering av generisk discovery (AB-032)

Genomförd och bekräftad av projektägaren (se
[`../../docs/work-items/AB-032.md`](../../docs/work-items/AB-032.md) för
fullständig verifieringsrapport, inklusive en ytterligare verifiering mot en
realistisk extern SQL Server-miljö). Stegen nedan är samma runbook och kan
återanvändas för framtida regressionskontroll.

**Test 0 – förbered lokal discovery-konfiguration:**

Kopiera `appsettings.Development.example.json` till
`appsettings.Development.json` (se "Konfigurationsmodell" ovan) om det inte
redan är gjort.

**Test 1 – befintligt scope:**

1. Kör AB-029:s script (`../database/sqlserver-weather-warning-dw-dm-im-poc.sql`)
   mot din lokala POC-databas, om det inte redan är gjort.
2. Starta API:et och öppna `http://localhost:5104/api/technical-assets`.
3. Bekräfta att svaret innehåller flera objekt vars `schemaName` börjar på
   `demo_` (t.ex. `demo_dm.dim_event`, `demo_dm.fact_weather_warning_event`,
   `demo_dm.weather_warning_events`), varav minst ett har `objectType: "Table"`
   och minst ett har `objectType: "View"`.

**Test 2 – det avgörande beviset:**

1. Skapa i SSMS, i samma lokala POC-databas, en ny, egen, valfri tabell eller
   vy i ett schema som redan matchar det konfigurerade mönstret (standard:
   `demo%`), t.ex.:

   ```sql
   CREATE TABLE demo_dm.my_manual_verification_object (
       id INT PRIMARY KEY,
       note NVARCHAR(100)
   );
   ```

2. Gör **ingen** ändring i repositoryt: ingen C#-fil, ingen `appsettings.json`,
   ingen Angular-fil.
3. Om API:et redan kör: anropa `GET http://localhost:5104/api/technical-assets`
   på nytt (varje anrop kör en ny discovery mot databasen — ingen omstart
   krävs).
4. Bekräfta att svaret nu **även** innehåller
   `demo_dm.my_manual_verification_object`, med kolumnerna `id`/`int` och
   `note`/`nvarchar` — utan att du ändrat något i repositoryt.
5. Städa bort testobjektet i SSMS när du är klar
   (`DROP TABLE demo_dm.my_manual_verification_object;`) och bekräfta att den
   försvinner ur nästa discoveryresultat.

Valfritt, för att se resultatet i Angular: kopiera
`frontend/public/assets/config/runtime-config.local.example.json` till
`frontend/public/assets/config/runtime-config.local.json` (gitignorad),
justera `apiBaseUrl` vid behov och starta om
`npm.cmd --prefix frontend start`.

## Återställa eller ta bort den lokala POC:n

* Kör om `backend/database/sqlserver-preview-poc.sql` mot `PortalPocLocal` i
  SSMS för att återställa tabellen till sitt fiktiva utgångsläge.
* Ta bort `frontend/public/assets/config/runtime-config.local.json` för att
  gå tillbaka till versionshanterat mockläge.
* Kör från `backend/`: `dotnet user-secrets clear --project Portal.Api/Portal.Api.csproj`
  tar bort din lokala connection string helt.
* Vill du ta bort POC:n helt kan du droppa databasen `PortalPocLocal` i SSMS
  — inget annat i repositoryt beror på att den finns kvar.

## Kända avgränsningar

* Två fiktiva datamängder stöds (`dataset-sales-transactions-demo` och
  `dataset-weather-warning-events-demo`); ingen kataloglistendpoint listar
  dem åt klienten (se nedan).
* Ingen kataloglistendpoint (`GET /api/datasets`) — endast detalj- och
  previewendpoints för ett känt id.
* Metadata-endpointen (`GET /api/datasets/{id}`) läser inte från SQL Server
  — den är medvetet statisk/registerbaserad; endast previewendpointen
  bevisar den riktiga SQL-läsningen (se AN-009/AN-010 för resonemanget).
* `Portal.Api.Tests` testar endast den databasfria registerlogiken och
  `DatasetsController`s känd/okänd-gate (med handskrivna fejkimplementationer
  av adaptrarna), inte den faktiska SQL Server-läsningen.
* Deklarerat ursprung (AB-031) är en manuellt registrerad, teknisk
  källreferens - inte full eller automatiskt upptäckt lineage, och inte en
  relation till ett annat katalogobjekt. Endast
  `dataset-weather-warning-events-demo` har ett registrerat ursprung i denna
  POC.
* Ingen autentisering, auktorisering eller deployment.
* Generisk teknisk discovery (`GET /api/technical-assets`, AB-032) upptäcker
  tekniska kandidater inom scope, men publicerar dem inte som `Dataset`- eller
  `InformationMart`-poster. Ingen koppling till `/data`, Datamarknaden eller
  frontend finns eller är avsedd i detta AB. Databasnamnet (`Database` i
  svaret) läses dynamiskt från den aktiva anslutningen (`SELECT DB_NAME()`),
  inte från konfiguration — se "Konfigurationsmodell" ovan; det finns inget
  separat databas-/catalog-konfigurationsfält, och discovery kan inte söka
  över flera databaser. Schemamönstret tolkas som SQL Servers eget `LIKE`-
  mönster (`%`/`_` är wildcard-tecken), inte som ett reguljärt uttryck — se
  avsnittet "Schema-mönster med bokstavligt understreck" ovan för hur ett
  bokstavligt `im_`-prefix uttrycks (`im[_]%`). Att `_`/`im[_]%` binds
  oförändrat är verifierat databasfritt i `Portal.Api.Tests`
  (`DiscoveryObjectsQuery`-testerna); att SQL Server faktiskt tolkar
  `im[_]%` som avsett är dessutom manuellt verifierat mot en riktig SQL
  Server-anslutning av projektägaren (se
  [`../../docs/work-items/AB-032.md`](../../docs/work-items/AB-032.md)).
  Endast metadata (schema, objektnamn, objekttyp, kolumnnamn och
  SQL-datatyp) hämtas — ingen svensk beskrivning, ägare eller klassning.
* `GET /api/technical-assets` kör en objektfråga plus **en separat
  kolumnfråga per upptäckt objekt** (ett N+1-frågemönster). Det är en
  accepterad avgränsning för denna POC:s begränsade volym — ingen batching,
  cache eller prestandaoptimering är införd. Bör utvärderas om antalet
  upptäckta objekt inom ett scope blir stort.
