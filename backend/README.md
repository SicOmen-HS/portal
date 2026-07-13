# Backend – lokal SQL Server-preview-POC (AB-027)

Detta är en liten, lokal proof-of-concept-backend. Den bevisar en vertikal kedja:

```
Angular -> lokalt .NET Web API -> SqlServerDatasetSourceAdapter -> lokal SQL Server
        -> en riktig, radbegränsad SELECT -> fiktiva datarader i portalens
        befintliga preview (DatasetFieldsPreviewComponent)
```

Den är **inte** en generell produktionsintegration och innehåller ingen autentisering,
auktorisering eller deployment. Se `docs/analysis/AN-009_lokal_backend_poc_datamarknad.md`
och work item `docs/work-items/AB-027.md` för bakgrund och avgränsning.

## Projektstruktur

```text
backend/
  Portal.slnx
  Portal.Api/            .NET Web API (net10.0)
  Portal.Api.Tests/      Databasfria enhetstester (KnownDatasetsRegistry)
  database/
    sqlserver-preview-poc.sql   Fiktivt schema + seed-data
  README.md              Denna fil
```

## Förutsättningar

* .NET 10 SDK (kontrollera med `dotnet --version`).
* SQL Server (t.ex. SQL Server 2025 Developer) och SQL Server Management Studio (SSMS),
  installerade lokalt av dig.
* Angular-frontend körbar enligt `docs/08_Lokal_utvecklingsmiljö.md`.

Ingen connection string, inget servernamn och inga credentials skrivs i detta
repository. Du väljer och konfigurerar din egen lokala SQL Server-instans.

## 1. Skapa den fiktiva SQL-strukturen i SSMS

**Viktigt:** Scriptet förutsätter att du själv aktivt har valt en egen lokal
utvecklingsdatabas innan du kör det. Det gissar eller antar aldrig ett
databasnamn åt dig.

1. Öppna SSMS och anslut till din lokala SQL Server (t.ex. `localhost`).
2. **Skapa eller välj uttryckligen en egen lokal utvecklingsdatabas** – kör inte
   scriptet med `master`, `model`, `msdb` eller `tempdb` som aktiv databas.
   Ett rent generiskt exempelnamn du kan använda är `PortalPocLocal` – vilket
   namn du än väljer är det enbart en lokal utvecklingsdetalj och skrivs inte
   in någonstans i repot.
3. I SSMS: kontrollera att din valda databas visas i databasväljaren (eller kör
   `USE <ditt-databasnamn>;` överst i samma query-fönster) **innan** du öppnar
   och kör scriptet.
4. Öppna `backend/database/sqlserver-preview-poc.sql` i SSMS och kör det.
   Scriptet innehåller ett inbyggt skydd: det vägrar köra och avbryter sig
   själv (`RAISERROR` + `SET NOEXEC ON`) om aktuell databas är en av
   systemdatabaserna `master`, `model`, `msdb` eller `tempdb`. Skyddet
   känner inte till och antar aldrig ditt lokala databasnamn – det stoppar
   enbart de fyra fasta systemdatabasnamnen.
5. Vid lyckad körning skapar scriptet tabellen `dbo.SalesTransactionsDemoPreview`
   med fem helt fiktiva rader och kan köras om igen närsomhelst – det tar bort
   och återskapar tabellen varje gång (`DROP TABLE IF EXISTS` + `CREATE TABLE`
   + `INSERT`).

Scriptet innehåller inget servernamn, ingen connection string och ingen
produktionsdata.

## 2. Sätt lokal connection string via .NET user secrets

Kör från `backend/Portal.Api/`:

```powershell
dotnet user-secrets set "ConnectionStrings:Default" "<DIN_LOKALA_CONNECTION_STRING>"
```

Ersätt `<DIN_LOKALA_CONNECTION_STRING>` med din egen lokala anslutningssträng mot
den databas du valde i steg 1 (t.ex. mot `localhost` med Windows-autentisering).
Skriv aldrig det riktiga värdet i en fil som checkas in, i en chatt eller i en
handoff – `dotnet user-secrets` lagrar värdet utanför repositoryt
(`%APPDATA%\Microsoft\UserSecrets\portal-api-sqlserver-preview-poc\secrets.json`
på Windows).

Kontrollera vid behov vad som är satt (utan att återge värdet i en delad kanal):

```powershell
dotnet user-secrets list
```

## 3. Starta backend

Från `backend/`:

```powershell
dotnet run --project Portal.Api
```

API:et startar enligt `Portal.Api/Properties/launchSettings.json`
(`http://localhost:5104` som standard – kontrollera terminalens utdata om porten
skiljer sig). Miljön är satt till `Development`, vilket krävs för att .NET
automatiskt ska läsa in dina user secrets.

Tillgängliga endpoints:

* `GET /health` – enkel hälsokontroll, kräver ingen SQL Server-anslutning.
* `GET /api/datasets/{id}` – statisk, registerbaserad metadata (t.ex.
  `dataset-sales-transactions-demo`). Kräver ingen SQL Server-anslutning.
* `GET /api/datasets/{id}/preview` – riktiga fiktiva datarader via en
  parameteriserad `SELECT` mot den lokala SQL Server-tabellen. Kräver att steg 1
  och 2 ovan är klara.

CORS tillåter som standard endast `http://localhost:4200` (se `appsettings.json`,
nyckeln `AllowedOrigins`) – ändra den listan om din Angular-instans körs på en
annan lokal port.

## 4. Aktivera lokalt API-läge i Angular

Frontend körs som vanligt i mockläge utan några steg ovan. För att i stället visa
riktiga SQL Server-rader lokalt:

1. Kopiera `frontend/public/assets/config/runtime-config.local.example.json` till
   `frontend/public/assets/config/runtime-config.local.json` (denna fil är
   ignorerad av Git och ska aldrig checkas in).
2. Justera `apiBaseUrl` om ditt API körs på en annan port än `5104`.
3. Starta om `npm.cmd --prefix frontend start`.

Datamängdsdetaljen för `dataset-sales-transactions-demo` (`/data/dataset-sales-transactions-demo`
eller motsvarande route) visar då previewraderna hämtade från din lokala SQL
Server. Tar du bort `runtime-config.local.json` igen körs portalen direkt i
versionshanterat standardläge (mockdata) utan vidare åtgärd.

## 5. Verifiera

Utan databasanslutning:

```powershell
dotnet restore
dotnet build
dotnet test
```

Med databasanslutning (efter steg 1–2 ovan):

* Öppna `http://localhost:5104/health` i webbläsaren – ska svara `{"status":"ok"}`.
* Öppna `http://localhost:5104/api/datasets/dataset-sales-transactions-demo` –
  ska svara med statisk metadata.
* Öppna `http://localhost:5104/api/datasets/dataset-sales-transactions-demo/preview` –
  ska svara med upp till 10 fiktiva rader lästa från SQL Server.
* Öppna `http://localhost:5104/api/datasets/okant-id/preview` – ska ge `404`.

## Återställa den lokala POC:n

* Kör om `backend/database/sqlserver-preview-poc.sql` i SSMS för att återställa
  tabellen till sitt fiktiva utgångsläge.
* Ta bort `frontend/public/assets/config/runtime-config.local.json` för att gå
  tillbaka till versionshanterat mockläge.
* `dotnet user-secrets clear --project Portal.Api/Portal.Api.csproj` tar bort din
  lokala connection string helt.
