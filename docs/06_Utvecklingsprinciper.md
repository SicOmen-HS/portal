# 06_Utvecklingsprinciper.md

# Utvecklingsprinciper

## Dokumentinformation

| Egenskap | Värde                                                           |
| -------- | --------------------------------------------------------------- |
| Dokument | 06_Utvecklingsprinciper.md                                      |
| Typ      | Utvecklingsprinciper                                            |
| Status   | Utkast                                                          |
| Ägare    | Data- och analysportalen                                        |
| Syfte    | Beskriva hur portalen ska utvecklas, struktureras och förvaltas |

---

# Syfte

Detta dokument beskriver principer för hur portalen ska utvecklas.

Syftet är att säkerställa att kod, struktur, dokumentation och arbetssätt stödjer projektets mål om:

* säkerhet
* förvaltningsbarhet
* spårbarhet
* tydlig arkitektur
* enkel vidareutveckling
* säker lokal utveckling
* möjlighet till framtida integrationer

Dokumentet riktar sig till utvecklare, arkitekter, granskare och AI-verktyg som används som stöd i utvecklingen.

---

# Relation till övriga dokument

Utveckling ska ske i linje med projektets övriga styrande dokument.

Särskilt viktiga dokument är:

* `00_Projektprinciper.md`
* `01_Projektvision.md`
* `02_Verksamhetsbeskrivning.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`

Om kod eller implementation hamnar i konflikt med dessa dokument ska implementationen justeras eller beslutet dokumenteras.

---

# Övergripande utvecklingsprinciper

## Kod ska vara enkel att förstå

Kod ska skrivas för framtida förvaltning.

En utvecklare som inte deltagit i projektet tidigare ska kunna förstå strukturen utan omfattande muntlig överlämning.

Prioritera:

* tydliga namn
* små komponenter
* tydliga ansvar
* begränsad komplexitet
* konsekvent struktur
* återanvändbar logik

---

## Lösningen ska vara behovsstyrd

Kod och komponentstruktur ska stödja portalens informationsmodell.

Utvecklingen ska utgå från användarens behov och portalens objekt, exempelvis:

* tjänster
* plattformar
* system
* guider
* beställningar
* kontaktvägar
* datamängder
* tekniska komponenter
* integrationer

Teknik ska inte styra användarupplevelsen mer än nödvändigt.

---

## Konfiguration före hårdkodning

Miljöberoende värden ska inte hårdkodas.

Exempel på värden som ska hanteras via konfiguration:

* URL:er
* systemlänkar
* API-endpoints
* feature flags
* autentiseringsinställningar
* connection strings
* integrationer
* miljönamn
* CORS-inställningar

Kod ska kunna flyttas mellan lokal utvecklingsmiljö och intern företagsmiljö utan att källkoden ändras.

---

## Innehåll före specialkomponenter

Portalens innehåll ska i första hand hanteras som strukturerad information.

Att lägga till en ny tjänst, guide, systemlänk eller kontaktväg ska normalt inte kräva en ny specialbyggd Angular-komponent.

Utvecklingen ska prioritera generiska komponenter som kan visa flera typer av innehåll.

Exempel:

* service card
* system card
* guide card
* order card
* contact card
* status card
* metadata view
* detail page

---

## Säkerhet ska byggas in från början

Säkerhet ska inte läggas på i efterhand.

Kod får inte innehålla:

* secrets
* lösenord
* tokens
* certifikat
* interna URL:er
* connection strings
* personuppgifter
* interna gruppnamn
* miljöspecifika värden

Frontend får aldrig innehålla hemligheter.

Backend ansvarar för skyddad kommunikation med databaser och interna system.

---

# Språkprinciper

## Kod

Kod ska skrivas på engelska.

Det gäller exempelvis:

* klasser
* metoder
* variabler
* interfaces
* API-modeller
* komponentnamn
* filnamn
* kataloger
* testnamn

Exempel:

```text
ServiceOffering
OrderFlow
SystemLink
ContactPoint
LifecycleStatus
```

## Affärsbegrepp

Svenska affärsbegrepp får användas när det saknas en tydlig engelsk motsvarighet eller när engelsk översättning skulle skapa förvirring.

Exempel:

* Information Mart kan behållas som begrepp.
* Domänspecifika svenska termer kan användas i visningstext och dokumentation.

## Dokumentation

Projektets styrande dokumentation skrivs på svenska.

Teknisk kodnära dokumentation kan skrivas på engelska om den främst riktar sig till utvecklare eller följer etablerad kodstandard.

## UI-innehåll

Portalens användargränssnitt ska i första hand vara på svenska, eftersom målgruppen är intern.

---

# Kodstandard

Projektet ska följa företagets etablerade kodstandarder.

## Angular och TypeScript

Frontend ska följa Angulars rekommenderade struktur och stilprinciper.

Principer:

* använd TypeScript strikt och tydligt
* undvik implicit eller svagt typad kod
* använd interfaces eller types för datamodeller
* håll komponenter små och fokuserade
* separera presentation, datahämtning och logik
* undvik duplicerad kod
* använd Angulars etablerade mönster för routing, services och dependency injection

## C# och .NET

Backend ska följa Microsofts etablerade kodkonventioner för C# och .NET.

Principer:

* använd tydliga klasser och metoder
* använd dependency injection
* separera controllers, services, repositories och modeller
* håll controllers tunna
* placera affärslogik i services
* kapsla databasåtkomst
* returnera tydliga API-svar
* hantera fel kontrollerat

## Statisk kodanalys

Statisk kodanalys är styrande där sådan finns.

Kod ska inte aktivt kringgå statisk kodanalys utan dokumenterad anledning.

---

# Repositorystruktur

Projektet bör struktureras så att frontend, backend, dokumentation, konfiguration och exempeldata hålls tydligt separerade.

Exempel på övergripande struktur:

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

Innehåller projektets dokumentation.

Exempel:

```text
docs/
├── 00_Projektprinciper.md
├── 01_Projektvision.md
├── 02_Verksamhetsbeskrivning.md
├── 03_Informationsmodell.md
├── 04_Systemarkitektur.md
├── 05_Konfiguration.md
├── 06_Utvecklingsprinciper.md
└── adr/
```

## frontend

Innehåller Angular-applikationen.

## backend

Innehåller .NET Web API.

## config

Innehåller exempelkonfiguration, schemas och mallar.

Verklig konfiguration ska inte versionshanteras.

## mock

Innehåller säker mockdata för lokal utveckling.

Mockdata ska vara fiktiv och fri från företagsspecifik information.

## deployment

Kan innehålla generiska deploymentmallar.

Miljöspecifika värden, secrets, interna registry-adresser och namespaces ska inte finnas här.

---

# Frontendprinciper

## Angular som frontendramverk

Frontend byggs med Angular.

Angular ansvarar för:

* routing
* vyer
* komponenter
* formulär
* klientnära state
* presentation av portalens informationsobjekt
* anrop till backend-API

## Bootstrap som UI-stöd

Bootstrap används som stöd för layout, grid, responsivitet och grundläggande UI-komponenter.

Bootstrap ska inte styra applikationens arkitektur.

Angular ska fortsatt ansvara för struktur, komponentlogik och dataflöden.

## Node.js

Node.js används som utvecklings- och byggverktyg för Angular.

Node.js ska inte betraktas som backend-runtime om inget separat beslut fattas.

---

# Frontendstruktur

Frontend bör organiseras efter funktion och ansvar.

Exempel:

```text
frontend/src/app/
├── core/
├── shared/
├── layout/
├── features/
├── models/
├── services/
└── config/
```

## core

Innehåller applikationsgemensam funktionalitet som bara ska finnas en gång.

Exempel:

* app configuration
* API clients
* interceptors
* guards
* error handling
* authentication-related frontend logic

## shared

Innehåller återanvändbara komponenter, pipes och hjälpfunktioner.

Exempel:

* cards
* badges
* buttons
* loading indicators
* empty states
* common pipes

## layout

Innehåller layoutkomponenter.

Exempel:

* shell
* navigation
* top menu
* footer
* page layout

## features

Innehåller funktionella områden.

Exempel:

```text
features/
├── home/
├── services/
├── systems/
├── guides/
├── orders/
├── data-catalog/
├── status/
└── support/
```

## models

Innehåller TypeScript-modeller som speglar informationsmodellen.

Exempel:

* ServiceOffering
* PlatformCapability
* SystemLink
* Guide
* OrderFlow
* ContactPoint
* LifecycleStatus

## services

Innehåller Angular services för datahämtning och klientnära logik.

---

# Frontendkomponenter

Komponenter ska vara små, tydliga och återanvändbara.

En komponent bör ha ett tydligt ansvar.

Exempel på bra komponenter:

* `ServiceCardComponent`
* `SystemLinkCardComponent`
* `GuideListComponent`
* `OrderFlowCardComponent`
* `StatusBadgeComponent`
* `LifecycleBadgeComponent`
* `ContactPointComponent`

Undvik komponenter som blandar flera ansvar, exempelvis:

* datahämtning
* affärslogik
* layout
* filtrering
* rendering
* behörighetsbeslut

Sådan logik ska delas upp.

---

# Backendprinciper

Backend byggs som .NET Web API.

Backend ansvarar för:

* API:er
* affärslogik
* databasåtkomst
* integrationer
* validering
* säker hantering av konfiguration
* teknisk felhantering
* loggning
* health endpoints

Frontend ska aldrig prata direkt med databaser eller interna system.

---

# Backendstruktur

Backend bör struktureras efter ansvar.

Exempel:

```text
backend/
├── Controllers/
├── Services/
├── Models/
├── Data/
├── Repositories/
├── Integrations/
├── Configuration/
├── Validation/
├── Middleware/
└── Program.cs
```

## Controllers

Controllers ska vara tunna.

De ska:

* ta emot HTTP-anrop
* validera grundläggande input
* anropa services
* returnera API-svar

Controllers ska inte innehålla komplex affärslogik.

## Services

Services innehåller affärslogik och användningsfall.

Exempel:

* ServiceCatalogService
* OrderFlowService
* SystemLinkService
* StatusService
* MetadataService

## Repositories

Repositories ansvarar för databasåtkomst.

Affärslogik ska inte känna till detaljer om anslutningssträngar eller SQL.

## Integrations

Integrationer mot externa system ska kapslas i separata adaptrar eller klienter.

Exempel:

* OpenMetadataAdapter
* QlikSenseAdapter
* GrafanaAdapter
* TrinoAdapter
* KeycloakAdapter
* ChatPortalAdapter

## Configuration

Konfigurationsklasser ska spegla tillåtna och förväntade konfigurationsvärden.

Konfiguration ska valideras vid uppstart där det är möjligt.

---

# API-principer

API:er ska vara tydliga, konsekventa och baserade på informationsmodellen.

Exempel på API-områden:

```text
/api/services
/api/platforms
/api/systems
/api/guides
/api/orders
/api/contacts
/api/status
/api/datasets
```

## Principer

API:er ska:

* använda tydliga resursnamn
* returnera strukturerad data
* validera input
* hantera fel på ett kontrollerat sätt
* inte exponera secrets
* inte läcka interna implementationer
* kunna versionshanteras vid behov

## API-svar

API-svar ska vara förutsägbara.

Undvik att frontend behöver tolka tekniska felmeddelanden från underliggande system.

Backend ska översätta tekniska fel till kontrollerade svar.

---

# Databasprinciper

Portalens applikationsdatabas används för portalens egen data.

Databasen ska inte blandas ihop med leveransens dataplattform.

## Principer

* databasåtkomst sker via backend
* schemaförändringar ska vara spårbara
* migrations ska användas där det är lämpligt
* seeddata ska vara fiktiv i lokal utveckling
* produktionsdata ska inte användas i privat utvecklingsmiljö
* connection strings ska inte versionshanteras

## PostgreSQL

PostgreSQL används som portalens applikationsdatabas.

## SQL Server

Microsoft SQL Server kan förekomma som extern datakälla eller framtida integration.

SQL Server ska hanteras via integrationslager och inte genom direkt åtkomst från frontend.

---

# Integrationsprinciper

Integrationer ska byggas stegvis och kapslas tydligt.

Portalens kärna ska inte vara hårt kopplad till enskilda produkter.

## Principer

* varje integration ska ha tydligt ansvar
* integrationer ska ligga i backend
* integrationer ska kunna mockas i lokal utveckling
* integrationer ska kunna slås på eller av via konfiguration
* fel i en integration ska inte krascha hela portalen om funktionen inte är kritisk
* integrationer ska dokumenteras när de införs

## Exempel på integrationer

* OpenMetadata
* Qlik Sense
* Grafana
* UiPath
* Nintex
* Trino
* Dagster
* Lakekeeper
* Keycloak
* ADFS
* OpenFGA
* OPA
* Chattportalen
* Azure DevOps Server
* SQL Server

Alla integrationer behöver inte implementeras i första versionen.

---

# Felhantering

Fel ska hanteras kontrollerat.

## Frontend

Frontend ska visa felmeddelanden som är begripliga för användaren.

Exempel:

* tjänsten kunde inte hämtas
* systemlänken är inte tillgänglig
* statusinformation saknas
* integrationen är inte aktiverad i denna miljö

Frontend ska inte visa tekniska stack traces.

## Backend

Backend ska:

* logga tekniska fel säkert
* returnera kontrollerade felmeddelanden
* inte exponera secrets eller interna detaljer
* hantera integrationsfel
* validera konfiguration vid uppstart där det är möjligt

---

# Loggning

Loggning ska stödja felsökning och förvaltning.

Loggar ska inte innehålla:

* lösenord
* tokens
* connection strings
* certifikat
* personuppgifter i onödan
* känslig verksamhetsdata
* interna hemligheter

Loggar ska vara tillräckliga för att förstå vad som gått fel utan att exponera skyddsvärd information.

---

# Testprinciper

Testning ska införas där det ger tydligt värde.

Detta dokument beskriver övergripande principer. En mer detaljerad teststrategi dokumenteras separat.

## Frontendtester

Frontend bör kunna ha tester för:

* komponenter
* services
* routing
* filtrering
* visning av informationsobjekt
* formulärlogik

## Backendtester

Backend bör kunna ha tester för:

* services
* validering
* API:er
* repositories
* integrationer med mockade externa system
* konfigurationsvalidering

## Principer

* tester ska vara begripliga
* tester ska inte kräva interna system
* tester ska kunna köras lokalt
* tester ska använda mockdata
* tester ska inte bero på verkliga secrets eller miljövärden

---

# Dokumentationsprinciper vid utveckling

Dokumentation ska uppdateras när kodändringar påverkar projektets struktur, arkitektur eller informationsmodell.

## Dokumentation ska uppdateras vid

* ny informationsmodell
* nytt API-område
* ny integration
* ny konfigurationsprincip
* ny deploymentprincip
* större frontendstrukturändring
* större backendstrukturändring
* ändrat teknikval
* ändrad säkerhetsprincip
* ny beställningsmodell

## Dokumentation behöver normalt inte uppdateras vid

* små buggrättningar
* mindre stylingändringar
* intern refaktorering utan ändrat beteende
* testförbättringar utan påverkan på arkitektur

## Princip

Dokumentationen ska förklara varför något är byggt på ett visst sätt.

Den ska inte upprepa uppenbar kod.

---

# Namngivning

Namngivning ska vara konsekvent.

## Kod

Kodnamn ska vara på engelska.

Exempel:

```text
ServiceOffering
PlatformCapability
TechnicalComponent
OrderFlow
ContactPoint
LifecycleStatus
```

## Filer och kataloger

Filnamn ska vara tydliga och konsekventa.

Exempel:

```text
service-offering.model.ts
order-flow.service.ts
system-link-card.component.ts
ServiceOfferingController.cs
OrderFlowService.cs
```

## UI-text

UI-text kan vara på svenska.

Exempel:

```text
Beställ dashboard
Hitta datamängder
Kontakta support
```

---

# Kommentarer i kod

Kod ska i första hand vara självförklarande genom tydliga namn och struktur.

Kommentarer ska användas för att förklara varför något görs, inte för att upprepa vad koden gör.

Bra kommentar:

```text
// The integration may be disabled in local development, so missing configuration is allowed when mock mode is active.
```

Sämre kommentar:

```text
// Set name to value.
```

---

# Git-principer

Commits ska vara små, begripliga och ha ett tydligt syfte.

En commit bör representera en sammanhängande ändring.

Exempel på bra commit-meddelanden:

```text
Add service offering model
Add configurable system links
Refactor order flow components
Document configuration principles
Add mock data for service catalog
```

Undvik otydliga meddelanden som:

```text
fix
update
changes
stuff
```

## Git-historik

Git-historik får inte innehålla secrets eller företagsspecifik information.

Om känslig information har checkats in ska det hanteras som en säkerhetsincident enligt intern process.

---

# Branch- och arbetsflöde

Detaljerat branchflöde kan beslutas senare, men följande principer gäller:

* arbete ska ske i separata branches
* större ändringar ska granskas innan de mergas
* kod ska kunna byggas innan merge
* dokumentation ska uppdateras tillsammans med kodändring där det behövs
* experimentell kod ska inte blandas med stabil kod utan tydlig markering

---

# Pull request-principer

En pull request bör innehålla:

* tydlig beskrivning av ändringen
* varför ändringen görs
* vad som påverkas
* hur ändringen har testats
* om dokumentation har uppdaterats
* om konfiguration påverkas
* om säkerhet eller integrationer påverkas

## Checklista

```text
- [ ] Ändringen följer projektprinciperna.
- [ ] Ingen känslig information har lagts till.
- [ ] Konfiguration är inte hårdkodad.
- [ ] Kod är begriplig och förvaltningsbar.
- [ ] Tester har lagts till eller bedömts ej relevanta.
- [ ] Dokumentation har uppdaterats vid behov.
- [ ] Mockdata är fiktiv.
```

---

# Lokal utveckling

Lokal utveckling ska kunna ske utan åtkomst till företagets interna miljö.

Det innebär att projektet ska kunna köras med:

* lokal frontend
* lokal backend
* lokal PostgreSQL
* mockdata
* exempelkonfiguration
* inaktiverade integrationer
* feature flags

Lokal utveckling ska inte kräva:

* interna URL:er
* interna konton
* certifikat
* tokens
* produktionsdata
* verkliga AD-grupper
* åtkomst till interna system

---

# Mockdata

Mockdata ska vara säker och fiktiv.

Mockdata får inte vara exporterad produktionsdata eller innehålla verkliga interna uppgifter.

Mockdata ska användas för att utveckla och testa:

* tjänstekatalog
* systemlänkar
* guider
* beställningsflöden
* statusinformation
* datakatalogvyer
* teknisk metadata

---

# Feature flags

Feature flags används för att styra funktionalitet mellan miljöer.

Exempel:

* aktivera mockintegrationer
* visa teknisk metadata
* aktivera OpenMetadata-integration
* aktivera beställningsflöden
* aktivera statuspanel

Feature flags ska inte användas för att ersätta riktig behörighetskontroll.

---

# Säkerhetsprinciper vid utveckling

Utvecklare ska alltid anta att repositoryt kan granskas externt.

Det innebär:

* inga secrets i kod
* inga interna URL:er
* inga riktiga konton
* inga interna servernamn
* inga certifikat
* inga personuppgifter
* inga skärmbilder med intern information
* inga exporter från interna system
* inga verkliga loggar

Exempeldata ska vara fiktiv.

Konfiguration ska använda platshållare.

---

# AI-stödd utveckling

AI-verktyg kan användas som stöd vid utveckling, refaktorering, dokumentation och test.

AI-verktyg ska följa projektets dokumentation och principer.

AI får inte skapa:

* verkliga interna URL:er
* konton
* tokens
* certifikat
* lösenord
* AD-grupper
* miljöspecifika värden
* påhittade verksamhetsregler som inte är förankrade

Detaljerade instruktioner för AI-stödd utveckling dokumenteras i separat dokument.

---

# Granskning

Kod bör granskas utifrån flera perspektiv.

## Utvecklarperspektiv

* Är koden begriplig?
* Är strukturen konsekvent?
* Finns duplicering?
* Är komponenterna lagom stora?
* Är API:et tydligt?

## Säkerhetsperspektiv

* Finns hemligheter?
* Finns hårdkodade interna värden?
* Exponeras känslig information?
* Hanteras fel säkert?
* Hanteras konfiguration korrekt?

## Förvaltningsperspektiv

* Är lösningen enkel att vidareutveckla?
* Är dokumentationen uppdaterad?
* Är integrationer kapslade?
* Är ansvar tydligt?
* Är tekniska beslut motiverade?

## Produktperspektiv

* Löser ändringen ett användarbehov?
* Är användarflödet begripligt?
* Är innehållet lätt att hitta?
* Passar ändringen portalens vision?

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

# När ADR ska skapas

Ett arkitekturbeslut ska dokumenteras som ADR när ändringen påverkar projektets långsiktiga riktning.

Exempel:

* nytt ramverk
* ny databasstrategi
* ny autentiseringslösning
* ny integrationsprincip
* ny deploymentmodell
* större ändring i informationsmodell
* större förändring av frontend- eller backendstruktur
* beslut om att införa eller avveckla en central teknik

Små implementationer behöver normalt inte ADR.

---

# Avgränsningar

Detta dokument beskriver utvecklingsprinciper.

Det beskriver inte i detalj:

* exakt teststrategi
* exakt releaseprocess
* exakt deploymentprocess
* exakt AI-instruktion
* exakt branchmodell
* exakt databasdesign
* exakt API-kontrakt

Dessa delar dokumenteras separat vid behov.

---

# Sammanfattning

Utvecklingen av portalen ska vara säker, strukturerad och förvaltningsbar.

Kodbasen ska vara generisk, konfigurationsstyrd och fri från företagsspecifik information.

Frontend ska fokusera på användarupplevelse och presentation.

Backend ska hantera affärslogik, dataåtkomst och integrationer.

Informationsmodellen ska vara styrande för hur portalen byggs.

Dokumentation, kod och konfiguration ska utvecklas tillsammans så att projektet förblir begripligt och hållbart över tid.
