# 07_AI_Instruktioner.md

# AI-instruktioner

## Dokumentinformation

| Egenskap | Värde                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Dokument | 07_AI_Instruktioner.md                                                 |
| Typ      | Instruktioner för AI-stödd utveckling                                  |
| Status   | Utkast                                                                 |
| Ägare    | Data- och analysportalen                                               |
| Syfte    | Beskriva hur AI-verktyg ska användas säkert och konsekvent i projektet |

---

# Syfte

Detta dokument beskriver hur AI-verktyg ska användas vid utveckling, dokumentation, refaktorering och analys av portalen.

Syftet är att säkerställa att AI-stödd utveckling sker på ett sätt som är:

* säkert
* spårbart
* förvaltningsbart
* konsekvent
* förenligt med projektets arkitektur
* förenligt med företagets kodstandarder
* fritt från företagsspecifik eller känslig information

Dokumentet riktar sig både till människor som använder AI-verktyg och till AI-verktyg som får tillgång till projektets dokumentation eller kod.

---

# Grundprincip

AI är ett utvecklingsstöd, inte en beslutsfattare.

AI får hjälpa till med att:

* föreslå kod
* skriva dokumentation
* refaktorera kod
* skapa exempel
* analysera struktur
* hitta inkonsekvenser
* föreslå tester
* skapa mockdata
* föreslå arkitekturalternativ

AI får inte själv besluta om större arkitektur, säkerhet, datamodell, integrationer eller verksamhetsregler utan mänsklig granskning.

---

# Styrande dokument

AI-verktyg ska följa projektets dokumentation.

Följande dokument är särskilt viktiga:

* `00_Projektprinciper.md`
* `01_Projektvision.md`
* `02_Verksamhetsbeskrivning.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`
* `06_Utvecklingsprinciper.md`
* `07_AI_Instruktioner.md`

Om AI föreslår något som avviker från dessa dokument ska avvikelsen tydligt beskrivas och motiveras.

AI ska inte tyst ändra projektets riktning.

---

# AI-verktygets roll

AI-verktyg ska agera som en försiktig utvecklingsassistent.

Det innebär att AI ska:

* följa befintlig dokumentation
* bevara projektets struktur
* undvika onödig komplexitet
* föreslå små och begripliga ändringar
* markera osäkerheter
* använda exempelvärden och platshållare
* undvika antaganden om företagets interna miljö
* föreslå dokumentationsuppdateringar när det behövs

AI ska inte:

* hitta på interna systemnamn
* hitta på URL
* skapa verkliga connection strings
* skapa tokens eller hemligheter
* lägga till företagsspecifik information
* anta verksamhetsregler som inte är dokumenterade
* kringgå säkerhetsprinciper
* ändra arkitektur utan att beskriva konsekvensen

---

# Arbetsordning för AI-stödd utveckling

När AI används för att ändra eller skapa kod ska arbetet följa denna ordning:

1. Läs relevant dokumentation.
2. Identifiera vilket behov ändringen löser.
3. Kontrollera om ändringen påverkar informationsmodellen.
4. Kontrollera om ändringen påverkar arkitekturen.
5. Kontrollera om ändringen kräver ny konfiguration.
6. Föreslå en liten och avgränsad ändring.
7. Skapa eller ändra kod.
8. Föreslå tester där det är relevant.
9. Föreslå dokumentationsuppdatering där det behövs.
10. Markera eventuella antaganden eller öppna frågor.

AI ska hellre föreslå en mindre ändring som följer strukturen än en stor ändring som försöker lösa flera problem samtidigt.

---

# Säkerhetsregler

AI får aldrig skapa, föreslå eller skriva in verkliga värden för:

* interna URL
* servernamn
* användarnamn
* lösenord
* tokens
* API-nycklar
* klienthemligheter
* certifikat
* privata nycklar
* connection strings
* interna AD-grupper
* interna namespaces
* interna registry-adresser
* produktionsdata
* personuppgifter
* loggar från interna system
* skärmbilder med intern information

Alla sådana värden ska ersättas med platshållare.

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

# Hantering av känslig information

Om AI upptäcker känslig information i kod, konfiguration, loggar eller dokumentation ska AI inte återge informationen i onödan.

AI ska i stället:

* peka ut vilken typ av information som är känslig
* föreslå att den tas bort
* föreslå platshållare
* föreslå `.gitignore`-regler
* föreslå sanering av historik om informationen funnits i Git

Exempel:

```text
Det finns en connection string i konfigurationsfilen. Den ska ersättas med <DATABASE_CONNECTION_STRING> och verkligt värde ska hanteras via secret eller lokal konfiguration.
```

AI ska inte skriva ut hela hemligheten igen.

---

# Konfigurationsregler

AI ska följa projektets princip om konfiguration före kod.

AI får inte hårdkoda:

* systemlänkar
* miljö-URL
* API-endpoints
* CORS-origins
* connection strings
* autentiseringsvärden
* feature flags
* interna gruppnamn
* namespaces
* registry-adresser

AI ska använda konfigurationsnycklar, exempelkonfiguration eller platshållare.

Exempel på korrekt modellering:

```json
{
  "id": "system-openmetadata",
  "name": "OpenMetadata",
  "urlKey": "OPENMETADATA_URL"
}
```

Exempel på konfigurationsvärde:

```json
{
  "SystemUrls": {
    "OPENMETADATA_URL": "<OPENMETADATA_URL>"
  }
}
```

---

# Regler för repositoryt

AI ska behandla repositoryt som generiskt.

Det betyder att repositoryt ska kunna delas eller granskas utan att exponera företagsspecifik information.

AI får skapa:

* kod
* dokumentation
* exempelkonfiguration
* mockdata
* mallar
* schemas
* generiska deploymentexempel

AI får inte skapa:

* verklig intern konfiguration
* verkliga credentials
* verkliga certifikat
* verkliga interna URL
* exporter från interna system
* verklig produktionsdata
* filer som binder repositoryt till en specifik intern miljö

---

# Språkregler

## Kod

Kod ska skrivas på engelska.

Det gäller:

* klasser
* metoder
* variabler
* interfaces
* komponenter
* API-modeller
* filnamn
* kataloger
* testnamn

Exempel:

```text
ServiceOffering
OrderFlow
SystemLink
ContactPoint
InformationMart
BusinessApplication
MonitoringSubscription
```

## Dokumentation

Projektets styrande dokumentation ska skrivas på svenska.

## UI-text

Portalens användargränssnitt ska i första hand vara på svenska.

## Kommentarer

Kodkommentarer kan skrivas på engelska när de är kodnära.

Kommentarer ska förklara varför något görs, inte upprepa vad koden gör.

---

# Regler för informationsmodellen

AI ska följa `03_Informationsmodell.md`.

När AI skapar modeller, API, komponenter eller mockdata ska dessa utgå från portalens informationsobjekt.

Exempel på centrala objekt:

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

AI ska inte skapa parallella begrepp om ett befintligt objekt redan täcker behovet.

Exempel:

* Skapa inte `ReportApp` om `BusinessApplication` täcker behovet.
* Skapa inte `AlertConfig` om `MonitoringSubscription` täcker behovet.
* Skapa inte `DataProduct` utan att först bedöma relationen till `Dataset`, `DataService` och `InformationMart`.

---

# Regler för tjänster

AI ska beskriva tjänster utifrån användarens behov.

En tjänst ska inte vara en teknisk komponent.

Exempel:

Korrekt:

```text
Beställ dashboard
Begär åtkomst till datamängd
Beställ utvecklingsyta för data science
Hitta AI-chatt
Beställ K2- eller Nintex-yta
```

Undvik som användarnära tjänst:

```text
Trino
Lakekeeper
PostgreSQL
Keycloak
Quay
```

Dessa ska normalt modelleras som tekniska komponenter, system eller integrationer.

---

# Regler för tekniska komponenter

AI får beskriva tekniska komponenter, men ska inte göra dem till huvudnavigation för vanliga användare.

Tekniska komponenter används främst för:

* metadata
* tekniska beroenden
* förvaltning
* integrationer
* livscykelstatus
* framtida Backstage-koppling

Exempel:

```text
Qlik Sense kan vara ett System eller TechnicalComponent.
Beställ dashboard är en ServiceOffering.
```

---

# Regler för beställningar

AI ska skilja mellan:

* `OrderFlow`
* `OrderType`
* `OrderStep`
* `OrderDependency`

## OrderFlow

Beskriver ett övergripande beställningsflöde.

## OrderType

Beskriver vad användaren vill beställa.

Exempel:

* Ny datamängd
* Förändring av datamängd
* Ny BI-tillämpning
* Ny AD-grupp
* Qlik Sense-ström
* Larm

## OrderStep

Beskriver ett steg i ett beställningsflöde.

Exempel:

* skapa accessgrupp
* koppla BI-tillämpning till Information Mart
* skapa larm
* uppdatera datamängd

## OrderDependency

Beskriver beroenden mellan beställningar, resurser eller steg.

AI ska inte förenkla komplexa beställningsflöden till bara en länk om det finns behov av att beskriva beroenden, steg eller ansvar.

---

# Regler för Information Mart

`InformationMart` är ett eget informationsobjekt.

AI ska inte blanda ihop Information Mart med en vanlig datamängd, teknisk komponent eller BI-tillämpning.

En Information Mart ska ses som en informationsprodukt eller konsumtionsyta kopplad till Data Vault 2.1.

Den kan relatera till:

* dataset
* datatjänster
* BI-tillämpningar
* laddningsflöden
* accessgrupper
* larm
* ansvariga team
* beställningar

---

# Regler för Chattportalen

Generativ AI Chattportal är en separat lösning.

I huvudportalens första version ska Chattportalen främst hanteras som:

* `System`
* `SystemLink`
* `PlatformCapability`
* framtida `ServiceOffering`
* framtida `AIApplication`

AI ska inte bygga in Chattportalens interna funktioner i huvudportalen utan uttryckligt beslut.

AI ska inte anta att huvudportalen administrerar:

* tenants
* RAG-index
* vektordatabaser
* kunskapskällor
* chattkonfigurationer
* Chattportalens interna behörigheter

Första versionen ska i första hand länka till Chattportalen och beskriva vad den är till för.

---

# Regler för arkitektur

AI ska följa systemarkitekturen.

Grundmönster:

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

AI får inte föreslå att frontend ansluter direkt till:

* databaser
* interna system
* Qlik Sense API
* OpenMetadata API
* Keycloak
* Trino
* SQL Server
* andra skyddade integrationer

Frontend ska anropa backend.

Backend ansvarar för integrationer, dataåtkomst och säker hantering av konfiguration.

---

# Regler för Angular

AI ska följa Angulars etablerade struktur och projektets frontendprinciper.

AI ska prioritera:

* små komponenter
* tydliga modeller
* återanvändbara komponenter
* services för datahämtning
* routing enligt Angular-mönster
* TypeScript med tydliga typer
* separation mellan vy, data och logik

AI ska undvika:

* stora komponenter med flera ansvar
* hårdkodade systemlänkar
* hårdkodade texter som borde vara innehållsdata
* affärslogik i templates
* direktintegration med interna system
* secrets i frontend
* behörighetsbeslut enbart i frontend

---

# Regler för .NET backend

AI ska följa Microsofts kodkonventioner och projektets backendprinciper.

AI ska prioritera:

* tunna controllers
* services för affärslogik
* repositories eller dataåtkomstlager för databasåtkomst
* dependency injection
* tydliga konfigurationsklasser
* validering
* kontrollerad felhantering
* säkra loggar
* health endpoints
* integrationsadaptrar

AI ska undvika:

* affärslogik direkt i controllers
* direkt åtkomst till konfiguration överallt i koden
* hårdkodade connection strings
* att exponera interna felmeddelanden till frontend
* att logga känslig information
* att blanda integrationslogik med domänlogik

---

# Regler för databasen

Portalens applikationsdatabas är PostgreSQL.

AI ska behandla PostgreSQL som portalens egen applikationsdatabas.

AI ska inte blanda ihop den med:

* Data Lake
* Data Warehouse
* Microsoft SQL Server
* OpenMetadatas databas
* Chattportalens databas
* andra externa datakällor

Databasåtkomst ska ske via backend.

AI får föreslå migrations eller modeller, men ska inte skapa verkliga connection strings.

Seeddata ska vara fiktiv.

---

# Regler för integrationer

AI ska kapsla integrationer bakom backend-adaptrar.

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

AI ska inte implementera en integration som kräver verkliga credentials eller interna endpoints.

AI kan skapa:

* interface
* adapterstruktur
* mockadapter
* exempelkonfiguration
* placeholder för endpoint
* felhanteringsmönster
* test med mockdata

AI ska markera när verklig implementation kräver intern information eller mänskligt beslut.

---

# Regler för autentisering och behörighet

AI får inte anta att alla system använder samma autentisering.

Kända principer:

* Chattportalen använder ADFS.
* Dataplattformen kan använda Keycloak.
* OpenFGA och OPA kan förekomma för behörighet och policy.

AI ska inte införa en autentiseringslösning utan dokumenterat beslut.

AI ska inte lägga behörighetskritisk logik endast i frontend.

AI ska inte skapa verkliga klient-ID, klienthemligheter, gruppnamn eller policyregler.

---

# Regler för mockdata

AI får skapa mockdata för lokal utveckling.

Mockdata ska vara:

* fiktiv
* generisk
* säker att dela
* fri från interna URL
* fri från personuppgifter
* fri från verkliga gruppnamn
* tydligt markerad som exempeldata

Exempel på tillåtna namn:

```text
Exempel Dashboard
Testdatamängd A
Fiktiv analysyta
Demo Information Mart
Exempelteam Data
```

Mockdata ska inte vara exporter från interna system.

---

# Regler för dokumentation

AI ska uppdatera dokumentation när ändringen påverkar:

* informationsmodell
* arkitektur
* konfiguration
* utvecklingsprinciper
* integrationer
* beställningsmodell
* säkerhetsprinciper
* lokal utvecklingsmiljö
* deployment
* API-struktur

AI ska inte skapa dokumentation som bara upprepar uppenbar kod.

Dokumentation ska förklara:

* varför något finns
* hur det ska användas
* vilka principer som gäller
* vilka avgränsningar som finns

---

# Regler för ADR

AI ska föreslå ADR när en ändring innebär ett arkitekturbeslut.

Exempel:

* nytt ramverk
* ny databas
* ny autentiseringslösning
* ny integrationsstrategi
* ny deploymentmodell
* större ändring av informationsmodellen
* förändrad frontendstruktur
* förändrad backendstruktur
* beslut om att införa Backstage-integration

AI ska inte skapa ADR för små implementationer eller rena buggrättningar om beslutet inte har långsiktig påverkan.

---

# Felhantering

AI ska föreslå kontrollerad felhantering.

Frontend ska visa användarbegripliga fel.

Backend ska logga tekniska fel säkert och returnera kontrollerade svar.

AI ska undvika felmeddelanden som exponerar:

* stack traces
* connection strings
* interna URL
* tokens
* servernamn
* känsliga systemdetaljer

---

# Testinstruktioner

AI ska föreslå tester när det är relevant.

Tester ska kunna köras lokalt utan interna system.

Tester ska använda:

* mockdata
* mockade integrationer
* lokal testkonfiguration
* fiktiva värden

AI ska inte skapa tester som kräver:

* intern nätverksåtkomst
* verkliga credentials
* verkliga certifikat
* produktionsdata
* interna URL

---

# Kodgranskning med AI

AI kan användas för kodgranskning.

Vid granskning ska AI särskilt kontrollera:

* om kod följer informationsmodellen
* om kod följer arkitekturen
* om konfiguration är hårdkodad
* om secrets finns i filer
* om frontend gör otillåtna direktanrop
* om controllers är för stora
* om komponenter har för många ansvar
* om dokumentation behöver uppdateras
* om mockdata är säker
* om felhantering är kontrollerad

---

# Sanering med AI

AI kan användas som stöd för sanering av kod före export från intern miljö.

AI ska då leta efter:

* URL
* servernamn
* connection strings
* tokens
* lösenord
* certifikat
* interna gruppnamn
* interna registry-adresser
* miljönamn
* personuppgifter
* loggar
* screenshots
* exporter från interna system

AI ska föreslå ersättning med platshållare.

AI ska inte återpublicera känsliga värden i sitt svar.

---

# Begränsningar för AI

AI ska vara tydlig när information saknas.

AI får inte fylla luckor med påhittade interna detaljer.

När något är oklart ska AI markera det som:

```text
Antagande
```

eller

```text
Öppen fråga
```

Exempel:

```text
Öppen fråga:
Ska första versionen hämta dataset från OpenMetadata via API, eller endast länka till OpenMetadata?
```

---

# Standardinstruktion för ny AI-session

Följande text kan användas som startinstruktion när en ny AI-session ska arbeta med projektet:

```text
Du arbetar med en intern portal för Data- och analysportalen.

Läs och följ projektets dokumentation:
- 00_Projektprinciper.md
- 01_Projektvision.md
- 02_Verksamhetsbeskrivning.md
- 03_Informationsmodell.md
- 04_Systemarkitektur.md
- 05_Konfiguration.md
- 06_Utvecklingsprinciper.md
- 07_AI_Instruktioner.md

Viktiga principer:
- Kod ska vara på engelska.
- Dokumentation och UI-text ska vara på svenska.
- Repositoryt ska vara generiskt och får inte innehålla interna URL:er, secrets, certifikat, connection strings, servernamn, AD-grupper eller produktionsdata.
- Frontend byggs med Angular och Bootstrap.
- Backend byggs med .NET Web API.
- Portalens applikationsdatabas är PostgreSQL.
- Frontend får inte ansluta direkt till databaser eller interna system.
- Integrationer ska gå via backend och kapslas i adaptrar.
- Miljöberoende värden ska hanteras via konfiguration.
- Mockdata ska vara fiktiv.
- Följ informationsmodellen och skapa inte parallella begrepp utan behov.
- Föreslå ADR vid större arkitekturbeslut.
- Markera antaganden och öppna frågor tydligt.
```

---

# Checklista för AI-genererad kod

AI-genererad kod ska granskas mot följande checklista:

```text
- [ ] Koden följer projektets dokumentation.
- [ ] Koden använder engelska namn.
- [ ] UI-text är på svenska där det är relevant.
- [ ] Inga secrets finns i koden.
- [ ] Inga interna URL:er finns i koden.
- [ ] Ingen miljöspecifik konfiguration är hårdkodad.
- [ ] Frontend anropar backend, inte interna system direkt.
- [ ] Backend kapslar integrationer bakom services/adaptrar.
- [ ] Informationsmodellen följs.
- [ ] Mockdata är fiktiv.
- [ ] Felhantering är kontrollerad.
- [ ] Loggning exponerar inte känslig information.
- [ ] Tester har föreslagits eller bedömts ej relevanta.
- [ ] Dokumentation har uppdaterats vid behov.
```

---

# Checklista för AI-genererad dokumentation

AI-genererad dokumentation ska granskas mot följande checklista:

```text
- [ ] Dokumentationen är på svenska.
- [ ] Dokumentationen följer projektets begrepp.
- [ ] Dokumentationen innehåller inte interna URL:er.
- [ ] Dokumentationen innehåller inte secrets.
- [ ] Dokumentationen gör inte odokumenterade antaganden.
- [ ] Dokumentationen skiljer mellan tjänster, system och tekniska komponenter.
- [ ] Dokumentationen är användbar för framtida utvecklare.
- [ ] Dokumentationen är tillräckligt konkret men inte överlastad.
```

---

# Sammanfattning

AI-verktyg får användas som stöd i projektet, men ska följa projektets dokumentation, säkerhetsprinciper och arkitektur.

AI ska bidra till tydligare kod, bättre dokumentation och snabbare utveckling utan att skapa säkerhetsrisker eller otydliga vägval.

Alla AI-genererade förslag ska kunna granskas, förstås och motiveras av människor.

Projektets kodbas ska förbli generisk, konfigurationsstyrd och fri från företagsspecifik information.
