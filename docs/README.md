# README.md

# Data- och analysportalen

## Översikt

Detta repository innehåller källkod, dokumentation, exempelkonfiguration och utvecklingsstöd för en intern portal för **Data- och analysportalen**.

Portalen ska fungera som en gemensam ingång till leveransens tjänster, system, dokumentation, beställningsflöden, datamängder, kontaktvägar och stödmaterial.

Målet är att användare ska kunna utgå från sitt behov i stället för att behöva känna till organisation, ansvarigt team, teknisk plattform eller var dokumentationen finns.

---

# Syfte

Portalen ska hjälpa interna användare att:

* hitta tjänster
* hitta systemlänkar
* hitta dokumentation och guider
* hitta datamängder och datatjänster
* förstå vilka plattformar och förmågor som finns
* beställa tjänster, behörigheter eller utvecklingsytor
* hitta kontaktvägar
* se status- och driftinformation
* förstå vad som är aktivt, legacy eller under avveckling

Portalen ska vara användarnära, behovsstyrd och förvaltningsbar.

---

# Viktiga principer

Projektet styrs av följande huvudprinciper:

* säkerhet först
* konfiguration före kod
* innehåll före implementation
* tjänster framför teknik
* generiskt repository utan företagsspecifik information
* frontend anropar backend, inte interna system direkt
* integrationer kapslas i backend
* lokal utveckling ska kunna ske utan intern miljö
* dokumentation är en del av leveransen
* större arkitekturbeslut dokumenteras som ADR

---

# Teknisk målbild

Övergripande arkitektur:

```text
Angular frontend
   |
   v
.NET Web API
   |
   v
PostgreSQL som portalens applikationsdatabas
   |
   v
Integrationslager/adaptrar mot interna system
```

## Frontend

Frontend byggs med:

* Angular
* TypeScript
* Bootstrap
* Bootstrap Icons
* SCSS

Frontend ansvarar för användargränssnitt, navigation, presentation, sök, filtrering och anrop till backend-API.

Frontend får inte innehålla secrets eller ansluta direkt till databaser eller interna system.

## Backend

Backend byggs med:

* .NET Web API
* C#
* REST-baserade API:er
* PostgreSQL som applikationsdatabas
* integrationsadaptrar mot externa system

Backend ansvarar för API:er, affärslogik, databasåtkomst, konfiguration, integrationer, validering och säker felhantering.

## Databas

Portalens egen applikationsdatabas är PostgreSQL.

Den ska inte blandas ihop med organisationens dataplattform, Data Lake, Data Warehouse, Microsoft SQL Server eller andra externa datakällor.

---

# Repositorystruktur

Rekommenderad struktur:

```text
/
├── docs/
├── frontend/
├── backend/
├── config/
├── mock/
├── scripts/
├── deployment/
└── README.md
```

## docs

Innehåller projektets styrande dokumentation.

```text
docs/
├── 00_Projektprinciper.md
├── 01_Projektvision.md
├── 02_Verksamhetsbeskrivning.md
├── 03_Informationsmodell.md
├── 04_Systemarkitektur.md
├── 05_Konfiguration.md
├── 06_Utvecklingsprinciper.md
├── 07_AI_Instruktioner.md
├── 08_Lokal_utvecklingsmiljö.md
├── 09_Teststrategi.md
├── 10_Release_och_deployment.md
├── 11_ADR_mall.md
└── adr/
```

## frontend

Innehåller Angular-applikationen.

## backend

Innehåller .NET Web API.

## config

Innehåller exempelkonfiguration, mallar och eventuella schemas.

Verklig konfiguration ska inte versionshanteras.

## mock

Innehåller fiktiv mockdata för lokal utveckling och test.

Mockdata ska vara säker att dela och fri från företagsspecifik information.

## deployment

Kan innehålla generiska deploymentmallar.

Miljöspecifika värden, interna URL:er, namespaces, registry-adresser och secrets ska inte finnas här.

---

# Dokumentation

Läs dokumentationen innan större ändringar görs.

## Styrande dokument

| Dokument                       | Syfte                                       |
| ------------------------------ | ------------------------------------------- |
| `00_Projektprinciper.md`       | Beskriver projektets grundprinciper         |
| `01_Projektvision.md`          | Beskriver varför portalen finns             |
| `02_Verksamhetsbeskrivning.md` | Beskriver verksamhetsdomänen                |
| `03_Informationsmodell.md`     | Beskriver portalens informationsobjekt      |
| `04_Systemarkitektur.md`       | Beskriver systemarkitekturen                |
| `05_Konfiguration.md`          | Beskriver konfigurationsprinciper           |
| `06_Utvecklingsprinciper.md`   | Beskriver hur portalen ska utvecklas        |
| `07_AI_Instruktioner.md`       | Beskriver hur AI-verktyg får användas       |
| `08_Lokal_utvecklingsmiljö.md` | Beskriver lokal utveckling                  |
| `09_Teststrategi.md`           | Beskriver teststrategi                      |
| `10_Release_och_deployment.md` | Beskriver release och deployment            |
| `11_ADR_mall.md`               | Beskriver hur arkitekturbeslut dokumenteras |

---

# Informationsmodell

Portalen bygger på en strukturerad informationsmodell.

Centrala objekt är bland annat:

* `ServiceOffering`
* `PlatformCapability`
* `System`
* `SystemLink`
* `TechnicalComponent`
* `Dataset`
* `DataService`
* `InformationMart`
* `BusinessApplication`
* `Guide`
* `OrderFlow`
* `OrderType`
* `OrderStep`
* `OrderDependency`
* `AccessGroup`
* `ContactPoint`
* `StatusItem`
* `MonitoringSubscription`
* `Integration`
* `Team`
* `LifecycleStatus`
* `ResponsibilityBoundary`
* `MetadataSource`

Nya funktioner, API:er, modeller och mockdata ska följa informationsmodellen.

Skapa inte parallella begrepp om ett befintligt objekt redan täcker behovet.

---

# Säkerhet

Repositoryt ska vara generiskt och får inte innehålla företagsspecifik eller känslig information.

## Får inte finnas i repositoryt

* interna URL:er
* servernamn
* connection strings
* användarnamn
* lösenord
* tokens
* API-nycklar
* klienthemligheter
* certifikat
* privata nycklar
* interna AD-grupper
* interna namespaces
* interna registry-adresser
* produktionsdata
* personuppgifter
* loggar från interna system
* skärmbilder med intern information

Använd platshållare i exempel.

Exempel:

```text
<API_BASE_URL>
<DATABASE_CONNECTION_STRING>
<OPENMETADATA_URL>
<QLIK_SENSE_URL>
<CLIENT_ID>
<CLIENT_SECRET>
<CERTIFICATE_PATH>
<CONTAINER_REGISTRY>
<NAMESPACE>
```

---

# Konfiguration

Miljöberoende värden ska hanteras via konfiguration, inte kod.

Repositoryt får innehålla exempelkonfiguration.

Exempel:

```text
appsettings.example.json
runtime-config.example.json
services.example.json
navigation.example.json
feature-flags.example.json
```

Verkliga konfigurationsfiler ska inte versionshanteras.

Exempel på filer som normalt ska ligga i `.gitignore`:

```text
appsettings.Local.json
appsettings.Development.json
appsettings.Production.json
runtime-config.json
environment.ts
environment.local.ts
.env
.env.local
secrets.json
*.pfx
*.pem
*.key
*.crt
*.cer
```

---

# Lokal utveckling

Projektet ska kunna köras lokalt utan åtkomst till företagets interna miljö.

Lokal utveckling ska kunna använda:

* lokal Angular frontend
* lokal .NET backend
* lokal PostgreSQL
* mockdata
* exempelkonfiguration
* mockade integrationer
* feature flags

Lokal utveckling ska inte kräva:

* interna URL:er
* interna konton
* interna certifikat
* interna tokens
* produktionsdata
* verkliga AD-grupper
* åtkomst till interna system
* åtkomst till företagets nätverk

---

# Lokal startordning

När projektstrukturen är etablerad bör lokal start dokumenteras med exakta kommandon.

Övergripande startordning:

```text
1. Installera nödvändiga verktyg.
2. Skapa lokal backend-konfiguration från exempel.
3. Skapa lokal frontend runtime-konfiguration från exempel.
4. Starta lokal PostgreSQL.
5. Kör databas-migrations.
6. Ladda seeddata eller mockdata.
7. Starta backend.
8. Starta frontend.
9. Öppna portalen i webbläsare.
```

Exakta kommandon ska uppdateras när projektets faktiska struktur är skapad.

---

# Bygga frontend

Exempel på kommandon:

```text
cd frontend
npm install
npm start
```

eller:

```text
cd frontend
ng serve
```

Exakta kommandon beror på projektets faktiska `package.json`.

---

# Bygga backend

Exempel på kommandon:

```text
cd backend
dotnet restore
dotnet build
dotnet run
```

Exakta kommandon beror på projektets faktiska lösningsstruktur.

---

# Test

Tester ska kunna köras lokalt utan interna system.

Tester ska använda:

* fiktiv data
* mockade integrationer
* lokal konfiguration
* lokal eller isolerad testdatabas
* exempelvärden

Tester ska inte kräva:

* interna URL:er
* tokens
* certifikat
* produktionsdata
* interna system
* interna AD-grupper

Exakta testkommandon dokumenteras när frontend- och backendstrukturen är etablerad.

---

# Mockdata

Mockdata används för lokal utveckling och test.

Mockdata ska vara:

* fiktiv
* generisk
* säker att dela
* fri från interna URL:er
* fri från personuppgifter
* fri från verkliga gruppnamn
* fri från produktionsdata

Exempel på mockobjekt:

* Exempel Dashboard
* Testdatamängd A
* Demo Information Mart
* Exempel BI-tillämpning
* Fiktiv accessgrupp
* Exempellarm för laddning
* Exempelteam Data

---

# Integrationer

Integrationer ska kapslas bakom backend-adaptrar.

Exempel:

```text
OpenMetadataAdapter
QlikSenseAdapter
GrafanaAdapter
TrinoAdapter
DagsterAdapter
LakekeeperAdapter
KeycloakAdapter
ChatPortalAdapter
SqlServerAdapter
```

Alla integrationer behöver inte implementeras i första versionen.

I lokal utveckling ska integrationer kunna mockas eller stängas av via konfiguration.

Frontend får inte integrera direkt med interna system.

---

# Generativ AI Chattportal

Generativ AI Chattportal är en separat lösning.

I första versionen ska huvudportalen främst hantera Chattportalen som:

* system
* systemlänk
* plattformsförmåga
* framtida tjänst
* framtida AI-applikation

Huvudportalen ska initialt inte bädda in Chattportalens funktionalitet eller administrera dess tenants.

---

# OpenMetadata

OpenMetadata kan användas som källa eller vägvisare för metadata och datakatalogisering.

Möjliga nivåer:

* systemlänk
* länkad datakatalogyta
* metadata som visas i portalen
* framtida API-integration

Första implementationen kan börja med länk eller mockad metadata och byggas ut stegvis.

---

# Release och deployment

Portalen ska kunna byggas, paketeras och driftsättas i intern on-prem-miljö.

Förväntad deploymentkedja:

```text
Kod
  |
  v
Azure DevOps Server
  |
  v
Azure Pipelines
  |
  v
Container build
  |
  v
Container registry
  |
  v
OpenShift/Kubernetes
```

Miljöspecifika värden ska inte finnas i repositoryt.

Container images ska inte innehålla secrets.

---

# ADR

Större arkitekturbeslut ska dokumenteras som ADR.

ADR:er placeras i:

```text
docs/adr/
```

Exempel:

```text
0001-val-av-angular-som-frontendramverk.md
0002-val-av-dotnet-web-api-som-backend.md
0003-val-av-postgresql-som-applikationsdatabas.md
```

Skapa ADR vid beslut som påverkar arkitektur, säkerhet, databas, integrationer, autentisering, deployment eller informationsmodell.

---

# AI-stödd utveckling

AI-verktyg får användas som stöd, men ska följa projektets dokumentation.

AI får hjälpa till med:

* kodförslag
* dokumentation
* refaktorering
* testförslag
* mockdata
* strukturgranskning
* ADR-utkast

AI får inte skapa eller föreslå verkliga:

* interna URL:er
* secrets
* certifikat
* tokens
* connection strings
* AD-grupper
* servernamn
* produktionsdata

AI-genererad kod och dokumentation ska granskas av människa.

---

# Kodstandard

Kod ska skrivas på engelska.

Dokumentation och UI-text ska i första hand vara på svenska.

Projektet ska följa:

* företagets etablerade tekniska standarder
* Angulars rekommenderade struktur och stilprinciper
* Microsofts kodkonventioner för C# och .NET
* statisk kodanalys där sådan finns

---

# Pull request-checklista

Innan kod mergas bör följande kontrolleras:

```text
- [ ] Ändringen följer projektets dokumentation.
- [ ] Informationsmodellen följs.
- [ ] Ingen känslig information har lagts till.
- [ ] Inga interna URL:er har lagts till.
- [ ] Konfiguration är inte hårdkodad.
- [ ] Frontend anropar backend, inte interna system direkt.
- [ ] Backend kapslar integrationer.
- [ ] Mockdata är fiktiv.
- [ ] Tester har körts eller bedömts ej relevanta.
- [ ] Dokumentation har uppdaterats vid behov.
- [ ] Behov av ADR har bedömts.
```

---

# Definition of Done

En ändring anses färdig när:

* den uppfyller relevant användarbehov
* den följer projektets principer
* den följer informationsmodellen
* den är säker
* den är konfigurationsstyrd där det behövs
* den inte innehåller hemligheter eller företagsspecifik information
* den är testad i relevant omfattning
* den är dokumenterad vid behov
* den kan byggas lokalt
* den är möjlig att förvalta
* den inte introducerar onödig komplexitet

---

# Första versionens fokus

Första versionen bör fokusera på:

* startsida
* tjänstekatalog
* systemlänkar
* guider
* beställningsflöden
* kontaktvägar
* grundläggande statusinformation
* mockdata
* exempelkonfiguration
* lokal körbar frontend och backend
* lokal PostgreSQL
* länk till Chattportalen
* länk eller vägledning till OpenMetadata

Mer avancerade integrationer kan införas stegvis.

---

# Avgränsningar

Detta repository ska inte innehålla:

* verklig intern konfiguration
* secrets
* certifikat
* produktionsdata
* interna exporter
* interna systemdumpningar
* interna skärmbilder
* miljöspecifika deploymentvärden

Detaljer som endast gäller företagets interna miljö hanteras i intern konfiguration, intern pipeline eller separat intern dokumentation.

---

# Sammanfattning

Portalen ska vara en säker, förvaltningsbar och behovsstyrd intern ingång till Data- och analysportalens tjänster, system, dokumentation och beställningsflöden.

Kodbasen ska vara generisk och kunna utvecklas lokalt utan åtkomst till företagets interna miljö.

Miljöberoende värden ska hanteras via konfiguration.

Integrationer ska kapslas i backend.

Dokumentation, informationsmodell och arkitekturbeslut ska hållas uppdaterade tillsammans med koden.
