# Portal.Api – lokal SQL Server-preview-POC (AB-027, AB-030)

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

Fyra begrepp skiljs tydligt åt i denna POC:

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

## Projektstruktur

```text
backend/
  Portal.slnx
  Portal.Api/            Denna .NET Web API (net10.0)
    Contracts/           Backendägda DTO:er (DatasetDetailDto, DatasetFieldDto, DatasetPreviewDto)
    Datasets/            IDatasetSourceAdapter, SqlServerDatasetSourceAdapter, KnownDatasetsRegistry
    Controllers/         DatasetsController
  Portal.Api.Tests/      Databasfria enhetstester (KnownDatasetsRegistry)
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
* Öppna `http://localhost:5104/api/datasets/okant-id/preview` — ska ge `404`.

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
* `Portal.Api.Tests` testar endast den databasfria registerlogiken, inte
  den faktiska SQL Server-läsningen.
* Ingen autentisering, auktorisering eller deployment.
