# 04_Systemarkitektur.md

# Systemarkitektur

## Dokumentinformation

| Egenskap | Värde                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| Dokument | 04_Systemarkitektur.md                                                        |
| Typ      | Arkitekturdokument                                                            |
| Status   | Utkast                                                                        |
| Ägare    | Data- och analysportalen                                                      |
| Syfte    | Beskriva portalens övergripande systemarkitektur och huvudsakliga komponenter |

---

# Syfte

Detta dokument beskriver den övergripande systemarkitekturen för portalen.

Syftet är att ge utvecklare, arkitekter, produktägare, granskare och AI-verktyg en gemensam förståelse för hur lösningen är tänkt att vara uppbyggd på systemnivå.

Dokumentet beskriver:

* huvudkomponenter
* ansvarsfördelning mellan komponenter
* integrationsprinciper
* konfigurationsprinciper
* drift- och utvecklingsmiljö
* säkerhetsmässiga arkitekturval
* framtida utbyggnadsmöjligheter

Dokumentet är inte en installationsguide, databasspecifikation eller detaljerad teknisk design. Sådana detaljer dokumenteras i separata dokument.

---

# Arkitekturell målbild

Portalen ska byggas som en intern webbapplikation med tydlig separation mellan användargränssnitt, backend, applikationsdata och integrationer.

Den övergripande målbilden är:

```text
Användare
   |
   v
Frontend
Angular + Bootstrap
   |
   v
Backend/API
.NET Web API
   |
   v
Applikationsdatabas
PostgreSQL
   |
   v
Integrationslager
Adaptrar mot interna system och plattformar
```

Portalen ska vara användarnära, behovsstyrd och förvaltningsbar.

Den ska inte vara hårt kopplad till enskilda tekniska komponenter, interna URL:er eller specifika miljöer.

---

# Arkitekturprinciper

Systemarkitekturen ska följa projektets övergripande principer.

Särskilt viktiga principer för arkitekturen är:

* säkerhet först
* konfiguration före kod
* innehåll före implementation
* tjänster framför teknik
* modulär arkitektur
* tydliga integrationsgränssnitt
* generiskt repository utan företagsspecifik information
* framtida möjlighet till integration med exempelvis Backstage
* tydlig separation mellan portalens egen data och externa system

---

# Huvudkomponenter

Systemet består av följande huvudkomponenter:

* Frontend
* Backend/API
* Applikationsdatabas
* Konfigurationslager
* Innehålls- och metadatalager
* Integrationslager
* Autentisering och åtkomstkontroll
* Drift- och deploymentmiljö
* Observability och statusinformation

---

# Frontend

Frontend ansvarar för portalens användargränssnitt.

## Teknik

Frontend byggs med:

* Angular
* TypeScript
* Bootstrap
* Bootstrap Icons
* SCSS

Node.js används som utvecklings- och byggverktyg för Angular-applikationen.

Node.js ska inte betraktas som backend-runtime om inte ett separat arkitekturbeslut fattas.

## Ansvar

Frontend ansvarar för:

* navigation
* sidor och vyer
* presentation av tjänster
* presentation av systemlänkar
* presentation av guider
* presentation av beställningsflöden
* sök och filtrering
* användarnära statusinformation
* formulär och användarinteraktion
* anrop till backend/API

Frontend ska inte ansvara för:

* direkt databasåtkomst
* hemligheter
* integration direkt mot interna system
* hantering av certifikat eller tokens
* affärslogik som bör ligga i backend
* miljöspecifika URL:er

## Princip

Frontend ska vara en konsument av strukturerad information.

Så mycket som möjligt av portalens innehåll ska komma från API, konfiguration eller innehållsobjekt, inte från hårdkodade Angular-komponenter.

---

# Backend/API

Backend ansvarar för portalens serverlogik, API:er, integrationslager och åtkomst till applikationsdatabasen.

## Teknik

Backend byggs som:

* .NET Web API
* C#
* REST-baserade API:er
* Entity Framework Core där det är lämpligt
* eventuell kompletterande dataåtkomstteknik där prestanda eller tekniska krav kräver det

## Ansvar

Backend ansvarar för:

* API:er till frontend
* hantering av portalens informationsobjekt
* åtkomst till applikationsdatabasen
* validering
* affärslogik
* integrationsadaptrar
* säker hantering av konfiguration
* autentisering och auktoriseringsnära logik
* health endpoints
* loggning och teknisk status
* skydd mot att frontend exponeras för hemligheter

Backend ska vara den enda komponenten i portalen som pratar med databaser och interna integrationer.

## Princip

Frontend ska aldrig koppla direkt mot databas eller interna system.

All kommunikation från frontend till interna resurser ska gå via backend/API.

---

# Applikationsdatabas

Portalen använder en egen applikationsdatabas för portalens interna data.

## Teknik

Portalens applikationsdatabas är PostgreSQL.

## Ansvar

Applikationsdatabasen kan innehålla information som:

* tjänster
* plattformar/förmågor
* system
* systemlänkar
* guider
* beställningsflöden
* kontaktvägar
* statusinformation
* teknisk metadata
* livscykelstatus
* relationer mellan informationsobjekt
* cache eller spegling av metadata från externa system där det är motiverat

## Viktig avgränsning

Portalens PostgreSQL-databas är inte leveransens dataplattform.

Den ska betraktas som portalens egen applikationsdatabas.

Andra datalager och datakällor, exempelvis Microsoft SQL Server, Data Warehouse, Data Lake, OpenMetadata eller andra plattformar, ska hanteras som externa system eller integrationer.

---

# Microsoft SQL Server och andra datakällor

Microsoft SQL Server förekommer i organisationens miljö och kan vara relevant för framtida integrationer.

SQL Server ska i detta projekt inte förväxlas med portalens egen applikationsdatabas.

SQL Server kan exempelvis vara:

* datakälla
* integrationsmål
* del av befintliga datalösningar
* källa för metadata eller verksamhetsdata
* del av BI- eller rapporteringsflöden

Integration mot SQL Server ska ske via backend och dokumenteras som separat integration.

---

# Konfigurationslager

Portalen ska vara konfigurationsstyrd.

Miljöberoende information ska inte hårdkodas.

## Exempel på konfigurerbar information

* interna URL:er
* API-endpoints
* autentiseringsinställningar
* klient-ID:n
* certifikatvägar
* connection strings
* CORS-inställningar
* systemlänkar
* feature flags
* externa integrationer
* miljöspecifika värden

## Princip

Repositoryt ska endast innehålla exempel- och mallfiler.

Exempel:

```text
appsettings.example.json
environment.example.ts
services.example.json
navigation.example.json
```

Verklig konfiguration ska tillföras i den interna miljön via lokal fil, miljövariabler, secrets eller annan godkänd intern mekanism.

---

# Secrets och känslig information

Känslig information får inte lagras i repositoryt.

Det gäller exempelvis:

* connection strings
* lösenord
* tokens
* certifikat
* privata nycklar
* API-nycklar
* klienthemligheter
* interna URL:er
* interna användarnamn
* servernamn
* AD-grupper
* miljönamn som inte bör exponeras

I lokal utveckling ska känsliga värden hanteras via lokala konfigurationsfiler som inte versionshanteras.

I intern drift ska känsliga värden hanteras via godkänd mekanism i OpenShift/Kubernetes eller motsvarande intern plattform.

---

# Innehålls- och metadatalager

Portalen ska i första hand behandla innehåll som strukturerad information.

Det innebär att objekt som tjänster, system, guider, kontaktvägar och beställningsflöden ska kunna hanteras som data.

## Exempel på informationsobjekt

* ServiceOffering
* PlatformCapability
* System
* SystemLink
* TechnicalComponent
* Dataset
* DataService
* InformationMart
* BusinessApplication
* Guide
* OrderFlow
* OrderType
* ContactPoint
* StatusItem
* Integration
* Team
* LifecycleStatus
* ResponsibilityBoundary
* MetadataSource

## Princip

Att lägga till en ny tjänst eller guide ska i normalfallet inte kräva ny programkod.

Det ska kunna ske genom att lägga till eller ändra strukturerad information.

---

# Integrationslager

Portalen ska kunna integrera med flera interna system och plattformar över tid.

Integrationer ska kapslas bakom separata tjänster eller adaptrar i backend.

## Exempel på integrationsadaptrar

* OpenMetadataAdapter
* QlikSenseAdapter
* GrafanaAdapter
* TrinoAdapter
* DagsterAdapter
* LakekeeperAdapter
* UiPathAdapter
* NintexAdapter
* KeycloakAdapter
* OpenFgaAdapter
* OpaAdapter
* SqlServerAdapter
* ChatPortalAdapter
* AzureDevOpsAdapter

Alla adaptrar behöver inte implementeras i första versionen.

## Princip

Portalens kärna ska inte vara hårt kopplad till enskilda produkter.

Om ett externt system ändras ska påverkan i första hand begränsas till berörd adapter.

---

# Externa system och plattformar

Följande system och plattformar kan vara relevanta för portalen, antingen i första versionen eller över tid:

* OpenMetadata
* Qlik Sense
* Grafana
* UiPath
* Nintex
* Generativ AI Chattportal
* Dagster
* Trino
* Lakekeeper
* Dell Objectscale
* Red Hat OpenShift
* Red Hat OpenShift AI
* Keycloak
* ADFS
* OpenFGA
* OPA
* WhereScape
* SSIS
* Microsoft SQL Server
* PostgreSQL
* Azure DevOps Server
* Azure Pipelines
* Quay eller motsvarande container registry

Alla dessa ska inte nödvändigtvis integreras tekniskt från början.

Vissa kan initialt hanteras som systemlänkar, dokumentationslänkar eller teknisk metadata.

---

# OpenMetadata

OpenMetadata är en central eller framtida källa för metadata och datakatalogisering.

Portalen ska kunna stödja användarflöden där användaren vill hitta, förstå eller konsumera datamängder.

## Möjliga integrationsnivåer

Portalen kan hantera OpenMetadata på flera nivåer:

1. som systemlänk
2. som länkad dokumentations- eller datakatalogyta
3. som källa för metadata som visas i portalen
4. som integrerad datakälla via API

Vilken nivå som används i första versionen beslutas separat.

## Princip

Om OpenMetadata äger metadata om datamängder ska portalen inte skapa en parallell sanning i onödan.

Portalen ska i första hand länka till, hämta från eller spegla metadata från OpenMetadata på ett kontrollerat sätt.

---

# Generativ AI Chattportal

Generativ AI Chattportal är en separat lösning för verksamhetsnära AI-stöd baserat på interna informationskällor.

I första versionen ska huvudportalen i första hand länka till Chattportalen.

På sikt kan portalen stödja beställningsflöden eller mer integrerade funktioner kopplat till Chattportalen.

## Arkitekturell hantering

I huvudportalens arkitektur ska Chattportalen initialt hanteras som:

* System
* SystemLink
* PlatformCapability
* framtida ServiceOffering
* framtida AIApplication

Detaljerad RAG-arkitektur, tenant-hantering, indexering och vektordatabaslogik hör hemma i Chattportalens egen systemdokumentation.

---

# Autentisering och åtkomst

Portalen ska anpassas till den interna on-prem-miljön.

Flera autentiserings- och auktoriseringslösningar kan förekomma i landskapet.

## Relevanta komponenter

* ADFS
* Keycloak
* OpenFGA
* OPA

Olika system kan använda olika lösningar.

Exempel:

* Chattportalen använder ADFS.
* Dataplattformen kan använda Keycloak.
* OpenFGA och OPA kan användas för behörighet och policy i vissa delar av miljön.

## Princip

Portalen ska inte anta att alla system använder samma autentiseringslösning.

Autentisering och auktorisering ska dokumenteras separat i teknisk design när implementationen konkretiseras.

---

# Behörighet i portalen

Portalens behörighetsmodell ska kunna utvecklas stegvis.

I första versionen kan mycket information vara läsbar för en bred intern målgrupp.

På sikt kan portalen behöva stödja olika nivåer av synlighet och behörighet.

## Exempel på behörighetsnivåer

* alla interna användare
* utvecklare
* data scientists
* förvaltare
* produktägare
* administratörer

## Princip

Behörighet ska inte hårdkodas i frontend.

Behörighetsbeslut ska hanteras via backend, konfiguration eller godkänd identitets- och auktoriseringslösning.

---

# Deploymentmiljö

Portalen ska kunna köras i organisationens interna on-prem-miljö.

## Relevanta plattformar

* Red Hat OpenShift
* Kubernetes
* Azure DevOps Server
* Azure Pipelines i lokal installation
* Quay eller motsvarande container registry

## Förväntad deploymentmodell

En sannolik deploymentmodell är:

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

Frontend och backend kan paketeras som separata container images.

---

# Kubernetes och OpenShift

OpenShift/Kubernetes används som driftplattform.

Deploymentfiler och miljöspecifika resurser ska hanteras på ett sätt som inte exponerar interna uppgifter i det generiska repositoryt.

## Exempel på resurser

* Deployment
* Service
* Route eller Ingress
* ConfigMap
* Secret
* ImagePullSecret
* Kustomize overlays

## Princip

Generiska mallar kan finnas i repositoryt.

Miljöspecifika manifests, URL:er, namespaces, registry-adresser och secrets ska hanteras internt.

---

# Container registry

Quay eller motsvarande container registry kan användas för lagring och distribution av container images.

Portalen ska kunna byggas och publiceras som containeriserad applikation.

## Princip

Registry-URL:er, autentisering, image pull secrets och credentials ska inte finnas i det generiska repositoryt.

Sådana värden ska hanteras i intern konfiguration och pipeline.

---

# Lokal utvecklingsmiljö

Eftersom utveckling kan ske utanför företagets miljö behöver lokal utveckling vara möjlig utan åtkomst till interna system.

## Lokal utveckling ska kunna använda

* lokal Angular-utvecklingsserver
* lokal .NET-backend
* lokal PostgreSQL
* mockdata
* exempelkonfiguration
* simulerade integrationer
* feature flags för att slå av interna integrationer

## Lokal utveckling ska inte kräva

* interna URL:er
* interna konton
* produktionsdata
* certifikat från intern miljö
* åtkomst till interna system
* verkliga AD-grupper
* verkliga tokens eller hemligheter

## Princip

Lokal utveckling ska kunna köras med säker exempeldata.

Intern konfiguration läggs först på när koden hämtas till företagets miljö.

---

# Mockning och simulerade integrationer

För att möjliggöra säker lokal utveckling ska integrationer kunna mockas eller ersättas med exempeldata.

## Exempel

* OpenMetadata kan ersättas med statisk exempelmetadata.
* Qlik Sense-länkar kan ersättas med platshållare.
* Statusinformation kan hämtas från lokal JSON.
* Beställningsflöden kan visas utan att skicka verkliga beställningar.
* Chattportalen kan representeras som en systemlänk med exempel-URL.

## Princip

Det ska vara tydligt när data är exempeldata och när data kommer från en verklig integration.

---

# CORS och tillåtna origins

CORS ska konfigureras restriktivt.

Wildcard för tillåtna origins ska inte användas i produktionsliknande miljö.

## Princip

Tillåtna origins ska anges via konfiguration.

Exempel:

```json
{
  "AllowedOrigins": [
    "http://localhost:4200"
  ]
}
```

I intern miljö ska endast godkända interna frontend-URL:er tillåtas.

---

# Observability och hälsa

Portalen ska ha stöd för grundläggande observability.

## Miniminivå

Backend bör exponera en health endpoint.

Exempel:

```text
GET /health
```

Portalen bör på sikt kunna visa eller hämta statusinformation för relevanta system och tjänster.

## Statusinformation

Status kan omfatta:

* portalens egen hälsa
* backend/API-status
* databaskoppling
* integrationsstatus
* driftinformation för relaterade plattformar
* planerade avbrott
* incidenter

## Princip

Statusinformation ska kunna visas både samlat och i kontext vid berörd tjänst eller plattform.

---

# Loggning

Loggning ska stödja felsökning, förvaltning och granskning.

## Principer

Loggar ska inte innehålla:

* lösenord
* tokens
* connection strings
* personuppgifter i onödan
* certifikatinformation
* känslig verksamhetsdata

Loggning ska vara tillräcklig för att förstå tekniska fel och integrationsproblem utan att exponera känslig information.

---

# Felhantering

Backend ska hantera fel på ett kontrollerat sätt.

Frontend ska visa begripliga felmeddelanden för användaren.

## Principer

* Interna fel ska inte exponera stack traces för användaren.
* Fel från integrationer ska kapslas och översättas till användbara felmeddelanden.
* Tekniska detaljer ska loggas på ett säkert sätt.
* Användaren ska få vägledning om nästa steg där det är möjligt.

---

# API-principer

Backend-API:er ska vara tydliga, stabila och förvaltningsbara.

## Principer

* API:er ska utgå från informationsmodellen.
* API:er ska inte exponera interna hemligheter.
* API:er ska returnera strukturerad information.
* API:er ska validera indata.
* API:er ska kunna versionshanteras vid behov.
* API:er ska dokumenteras där det ger värde.

Exempel på API-områden:

* services
* platforms
* systems
* guides
* orders
* contacts
* status
* datasets
* integrations

---

# Backstage och framtida utvecklarportal

Portalen ska kunna integreras med en utvecklarportal, exempelvis Backstage, i framtiden.

Det innebär att informationsmodellen och systemarkitekturen ska stödja strukturerad metadata.

## Möjliga framtida kopplingar

* export av tjänstemetadata
* export av systemmetadata
* relationer mellan tjänster, system och team
* dokumentationslänkar
* API-metadata
* tekniska komponenter
* ägarskap och livscykelstatus

## Princip

Backstage behöver inte implementeras från början.

Arkitekturen ska däremot inte försvåra en framtida integration.

---

# Arkitekturella avgränsningar

Detta dokument beslutar inte:

* exakt databasschema
* exakta API-kontrakt
* exakt autentiseringsimplementation
* exakt deploymentstruktur
* exakt Kubernetes-manifest
* exakt CI/CD-pipeline
* detaljerad implementation av integrationer
* detaljerad frontendstruktur
* detaljerad behörighetsmodell

Dessa delar dokumenteras i senare tekniska dokument eller ADR:er.

---

# Första versionens föreslagna omfattning

Första versionen av portalen bör fokusera på:

* startsida
* tjänstekatalog
* systemlänkar
* guider
* beställningsflöden som länkar vidare eller visas informativt
* kontaktvägar
* grundläggande statusinformation
* konfigurationsstyrt innehåll
* mockade eller manuellt förvaltade integrationer
* länk till Chattportalen
* länk eller grundläggande vägledning till OpenMetadata

Mer avancerade integrationer kan införas stegvis.

---

# Framtida utökningar

Möjliga framtida utökningar är:

* integration med OpenMetadata
* integration med Qlik Sense API
* integration med Grafana
* integration med Chattportalen
* beställning av AI-chatt eller RAG-applikation
* integration med Backstage
* administrativt gränssnitt för innehåll
* rollbaserad personalisering
* visning av tekniska beroenden
* status per system och tjänst
* integration med ärendehanteringssystem
* mer avancerad behörighetsmodell
* automatiserade beställningsflöden

---

# Sammanfattning

Portalen ska byggas som en modulär intern webbapplikation med Angular frontend, .NET Web API, PostgreSQL som applikationsdatabas och ett tydligt integrationslager mot interna system.

Arkitekturen ska stödja säker lokal utveckling, intern on-prem-drift, konfigurationsstyrning, framtida integrationer och långsiktig förvaltning.

Portalens kärna ska vara generisk, säker och frikopplad från miljöspecifika detaljer.

Tekniska integrationer ska införas stegvis utan att portalens grundarkitektur behöver byggas om.
