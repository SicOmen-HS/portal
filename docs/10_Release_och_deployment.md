# 10_Release_och_deployment.md

# Release och deployment

## Dokumentinformation

| Egenskap | Värde                                                                   |
| -------- | ----------------------------------------------------------------------- |
| Dokument | 10_Release_och_deployment.md                                            |
| Typ      | Release- och deploymentprinciper                                        |
| Status   | Utkast                                                                  |
| Ägare    | Data- och analysportalen                                                |
| Syfte    | Beskriva hur portalen ska byggas, paketeras, publiceras och driftsättas |

---

# Syfte

Detta dokument beskriver principer för release och deployment av portalen.

Syftet är att säkerställa att portalen kan byggas, testas, paketeras och driftsättas på ett säkert, spårbart och förvaltningsbart sätt.

Dokumentet beskriver:

* releaseprinciper
* deploymentprinciper
* byggprocess
* containerisering
* intern publicering
* miljöhantering
* konfiguration
* secrets
* rollback
* verifiering
* ansvar och checklistor

Dokumentet beskriver inte verkliga interna URL:er, registry-adresser, namespaces, credentials eller miljövärden.

---

# Grundprincip

Samma kodbas ska kunna användas i flera miljöer.

Skillnader mellan miljöer ska hanteras genom:

* konfiguration
* secrets
* miljövariabler
* runtime-konfiguration
* deploymentinställningar
* pipelinevariabler
* OpenShift/Kubernetes-resurser

Miljöskillnader ska inte kräva ändringar i källkoden.

---

# Relation till övriga dokument

Release och deployment ska följa projektets övriga dokumentation.

Särskilt viktiga dokument är:

* `00_Projektprinciper.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`
* `06_Utvecklingsprinciper.md`
* `07_AI_Instruktioner.md`
* `08_Lokal_utvecklingsmiljö.md`
* `09_Teststrategi.md`

Om deployment kräver avsteg från dessa dokument ska avsteget dokumenteras och motiveras.

---

# Övergripande deploymentmodell

Portalen förväntas köras i intern on-prem-miljö.

En sannolik deploymentkedja är:

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
Bygg frontend och backend
  |
  v
Skapa container images
  |
  v
Publicera images till container registry
  |
  v
Driftsätt i OpenShift/Kubernetes
```

Frontend och backend bör kunna paketeras och driftsättas som separata komponenter.

---

# Huvudkomponenter vid deployment

Följande komponenter ingår normalt i deployment:

* frontend
* backend/API
* applikationsdatabas
* konfiguration
* secrets
* OpenShift/Kubernetes-resurser
* container images
* health checks
* loggning
* eventuell ingress eller route
* eventuella integrationer

---

# Frontenddeployment

Frontend byggs som Angular-applikation.

Byggresultatet består normalt av statiska filer som kan serveras via en webbserver eller container.

## Principer

Frontenddeployment ska:

* inte innehålla secrets
* inte innehålla interna värden som borde ligga i runtime-konfiguration
* kunna använda miljöspecifik runtime-konfiguration
* kunna byggas utan åtkomst till interna system
* inte kräva direktåtkomst till databaser eller interna integrationer

## Runtime-konfiguration

Frontend bör läsa viss konfiguration vid runtime.

Det gör att samma frontend-image kan användas i flera miljöer.

Exempel på runtime-konfiguration:

```json
{
  "apiBaseUrl": "/api",
  "applicationName": "Data- och analysportalen",
  "features": {
    "showStatusPanel": true,
    "showOrderFlows": true,
    "showTechnicalMetadata": false
  }
}
```

Verkliga miljövärden tillförs i respektive intern miljö.

---

# Backenddeployment

Backend byggs som .NET Web API.

Backend ansvarar för:

* API:er
* databasåtkomst
* integrationslager
* affärslogik
* konfigurationsvalidering
* health endpoints
* säker felhantering

## Principer

Backenddeployment ska:

* hämta konfiguration från miljön
* hämta secrets från godkänd secret-hantering
* inte innehålla hårdkodade miljövärden
* inte kräva ändring av källkod mellan miljöer
* validera obligatorisk konfiguration vid start
* exponera health endpoint
* logga säkert

---

# Applikationsdatabas

Portalens applikationsdatabas är PostgreSQL.

Databasen är en del av portalens applikationsmiljö och ska inte blandas ihop med dataplattformen, Data Lake, Data Warehouse eller andra externa datakällor.

## Deploymentprinciper

Databasen ska hanteras så att:

* schemaförändringar är spårbara
* migrations kan köras kontrollerat
* connection strings hanteras som secrets
* produktionsdata inte används i lokal utveckling
* backup- och återställningsrutiner finns i intern miljö
* ändringar kan verifieras innan produktionssättning

---

# Databasmigrationer

Databasmigrationer ska vara spårbara och kontrollerade.

## Principer

* migrations ska versionshanteras
* migrations ska kunna köras från tom databas
* migrations ska testas i lokal eller testmiljö
* migrations ska inte innehålla produktionsdata
* seeddata ska hållas separat från schemaförändringar
* riskfyllda migrationer ska granskas särskilt

## Inför release

Inför release ska det vara tydligt:

* om databasmigration krävs
* om migrationen är bakåtkompatibel
* om rollback påverkas
* om data behöver transformeras
* om driftstopp krävs

---

# Containerisering

Portalen ska kunna paketeras som containeriserad applikation.

Frontend och backend kan byggas som separata container images.

## Principer

Container images ska:

* byggas från källkod
* inte innehålla secrets
* inte innehålla interna certifikat
* inte innehålla miljöspecifik konfiguration
* vara reproducerbara
* versionsmärkas
* kunna skannas enligt intern process

## Exempel på image-struktur

```text
portal-frontend:<version>
portal-backend:<version>
```

Verkliga image-namn och registry-adresser ska hanteras i intern miljö.

---

# Container registry

Container images publiceras till godkänt internt container registry, exempelvis Quay eller motsvarande.

## Principer

Repositoryt får inte innehålla:

* verklig registry-URL
* credentials
* image pull secrets
* interna registry-namn
* interna servicekonton

Sådana värden hanteras i intern pipeline och driftmiljö.

Exempel på platshållare:

```text
<CONTAINER_REGISTRY>
<IMAGE_NAME>
<IMAGE_TAG>
<NAMESPACE>
```

---

# OpenShift och Kubernetes

Portalen förväntas driftsättas i OpenShift/Kubernetes.

## Möjliga resurser

Deployment kan omfatta:

* Deployment
* Service
* Route eller Ingress
* ConfigMap
* Secret
* ServiceAccount
* ImagePullSecret
* PersistentVolumeClaim, om databasen hanteras i samma plattform
* Kustomize overlays
* health probes

## Principer

Generiska mallar kan finnas i repositoryt.

Miljöspecifika värden ska inte finnas i det generiska repositoryt.

Det gäller exempelvis:

* namespaces
* interna hostnamn
* routes
* registry-adresser
* secrets
* certifikat
* servicekonton
* produktionsspecifika resursnamn

---

# Konfiguration vid deployment

Konfiguration ska tillföras per miljö.

## Exempel på konfiguration

* API-basväg
* systemlänkar
* CORS-origins
* feature flags
* integrationsinställningar
* autentiseringsinställningar
* databasinställningar
* loggningsnivå
* health check-inställningar

## Princip

Källkoden ska inte ändras för att driftsätta i en ny miljö.

Ny miljö ska konfigureras genom miljöinställningar, inte kodändringar.

---

# Secrets vid deployment

Secrets ska hanteras via godkänd intern mekanism.

Exempel:

* OpenShift Secret
* Kubernetes Secret
* pipeline variables
* intern secret-hantering

Secrets får inte finnas i:

* källkod
* dokumentation
* exempelkonfiguration
* container images
* loggar
* screenshots
* pipelinefiler i klartext

## Exempel på secrets

* connection strings
* tokens
* klienthemligheter
* certifikatlösenord
* API-nycklar
* privata nycklar
* registry-credentials

---

# Certifikat

Vissa integrationer kan kräva certifikat.

Certifikat ska hanteras som känslig information.

## Principer

* certifikat ska inte finnas i repositoryt
* certifikat ska inte byggas in i container images
* certifikat ska tillföras via godkänd intern mekanism
* certifikatlösenord ska hanteras som secrets
* certifikatvägar ska vara konfigurerbara

Exempelfiler får endast visa struktur med platshållare.

---

# Miljöer

Projektet kan stödja flera miljöer.

Exempel:

* local
* development
* test
* staging
* production

Namnen kan anpassas till företagets interna standard.

## Local

Lokal miljö används för utveckling utanför intern driftmiljö.

Den ska använda:

* lokal frontend
* lokal backend
* lokal PostgreSQL
* mockdata
* mockade integrationer
* exempelkonfiguration

## Development

Intern utvecklingsmiljö används för tidig verifiering i företagets miljö.

Den kan ha tillgång till vissa interna system, men ska inte betraktas som produktion.

## Test

Testmiljö används för samlad verifiering, acceptanstest och integrationskontroll.

## Staging

Staging kan användas för produktionslik verifiering om sådan miljö finns.

## Production

Produktionsmiljö används för skarp intern användning.

Produktionsmiljö ska hanteras med högre krav på kontroll, loggning, säkerhet och rollback.

---

# Feature flags vid release

Feature flags kan användas för att styra funktionalitet per miljö.

Exempel:

```json
{
  "FeatureFlags": {
    "EnableDataCatalog": true,
    "EnableOrderFlows": true,
    "EnableTechnicalMetadata": false,
    "EnableOpenMetadataIntegration": false,
    "EnableQlikIntegration": false,
    "EnableChatPortalIntegration": false
  }
}
```

## Principer

Feature flags ska:

* dokumenteras
* ha tydligt syfte
* kunna ändras per miljö
* inte ersätta riktig behörighetskontroll
* tas bort när de inte längre behövs

---

# CI/CD-principer

Pipeline ska stödja säker och spårbar release.

## Pipeline bör kunna göra

* hämta kod
* installera beroenden
* bygga frontend
* bygga backend
* köra tester
* köra statisk kodanalys
* kontrollera formatering
* kontrollera exempelkonfiguration
* skanna efter secrets
* skapa container images
* publicera container images
* driftsätta till vald miljö
* verifiera deployment

## Pipeline ska inte kräva

* secrets i repositoryt
* interna värden hårdkodade i pipelinefil
* produktionsdata
* manuella ändringar i källkod mellan miljöer

---

# Byggsteg

En typisk byggprocess kan bestå av:

```text
1. Checkout av kod
2. Installera frontendberoenden
3. Bygg frontend
4. Kör frontendtester
5. Återställ backendberoenden
6. Bygg backend
7. Kör backendtester
8. Skapa container image för frontend
9. Skapa container image för backend
10. Publicera images till container registry
```

Exakta steg beror på projektets faktiska struktur.

---

# Deploymentsteg

En typisk deployment kan bestå av:

```text
1. Välj version att driftsätta.
2. Kontrollera release notes.
3. Kontrollera att tester passerat.
4. Kontrollera konfiguration för målmiljö.
5. Kontrollera secrets för målmiljö.
6. Kör eventuella databasmigrationer.
7. Driftsätt backend.
8. Driftsätt frontend.
9. Verifiera health endpoints.
10. Utför smoke tests.
11. Kontrollera loggar.
12. Kommunicera att release är genomförd.
```

Ordningen kan behöva justeras beroende på om ändringen påverkar databas, API eller frontend.

---

# Versionshantering

Varje release ska kunna identifieras.

## Version bör kunna kopplas till

* Git commit
* buildnummer
* container image tag
* release notes
* deploymenttidpunkt
* miljö
* eventuella databasmigrationer

## Princip

Det ska gå att förstå vilken kodversion som körs i en viss miljö.

---

# Release notes

Varje release bör ha korta release notes.

Release notes bör innehålla:

* version
* datum
* sammanfattning
* nya funktioner
* ändrade funktioner
* borttagna funktioner
* buggfixar
* konfigurationsändringar
* databasmigrationer
* kända begränsningar
* påverkan på användare
* påverkan på förvaltning

## Exempel

```text
Version: 0.3.0
Datum: <DATE>

Innehåll:
- Lagt till tjänstekatalog.
- Lagt till systemlänkar via konfiguration.
- Lagt till mockad statuspanel.

Konfiguration:
- Ny feature flag: EnableStatusPanel.

Databas:
- Ny tabell för ServiceOffering.

Kända begränsningar:
- OpenMetadata-integration är ännu inte aktiverad.
```

---

# Taggning

Releaser bör taggas i Git.

Exempel:

```text
v0.1.0
v0.2.0
v1.0.0
```

Taggningsstrategi beslutas senare, men taggar ska vara begripliga och kopplade till release notes.

---

# Miljöpromovering

Kod och container images bör kunna flyttas mellan miljöer utan ombyggnad där det är möjligt.

Exempel:

```text
development
  |
  v
test
  |
  v
production
```

## Princip

Samma image bör kunna användas i flera miljöer.

Miljöskillnader ska hanteras genom konfiguration och secrets.

---

# Smoke tests efter deployment

Efter deployment ska grundläggande smoke tests köras.

Exempel:

* frontend laddar
* backend svarar på `/health`
* API för tjänster svarar
* API för systemlänkar svarar
* databasanslutning fungerar
* konfiguration kan läsas
* inga kritiska fel syns i loggar
* startsidan kan öppnas
* centrala länkar visas korrekt

Smoke tests ska vara snabba och fokusera på att verifiera att release är användbar.

---

# Health checks

Backend bör exponera health endpoint.

Exempel:

```text
GET /health
```

Health checks kan användas av:

* OpenShift/Kubernetes
* pipeline
* övervakning
* manuell felsökning

## Health check ska inte exponera

* secrets
* connection strings
* tokens
* interna serverdetaljer
* känslig systeminformation

---

# Readiness och liveness

Vid OpenShift/Kubernetes-deployment bör readiness och liveness användas där det är lämpligt.

## Liveness

Kontrollerar att applikationen lever.

## Readiness

Kontrollerar att applikationen är redo att ta emot trafik.

Readiness kan exempelvis bero på:

* att backend har startat
* att nödvändig konfiguration är giltig
* att databasanslutning fungerar
* att kritiska beroenden är tillgängliga, om de krävs för start

---

# Rollback

Rollback ska vara möjligt vid misslyckad release.

## Rollback kan omfatta

* återgång till tidigare container image
* återställning av tidigare konfiguration
* inaktivering av feature flag
* återställning av databas, om möjligt
* temporär avstängning av berörd integration

## Viktigt

Databasmigrationer kan göra rollback mer komplicerad.

Riskfyllda databasändringar ska därför planeras särskilt.

---

# Rollbackprinciper

Innan release ska det vara tydligt:

* vilken tidigare version som kan återställas
* om databasen påverkas
* om konfiguration behöver återställas
* om feature flags kan användas för att stänga av ny funktion
* vem som beslutar om rollback
* hur rollback verifieras

---

# Blue-green eller stegvis deployment

Mer avancerade deploymentmönster kan införas senare.

Exempel:

* blue-green deployment
* canary deployment
* stegvis utrullning
* feature flag-baserad aktivering

Första versionen behöver inte ha avancerad utrullning, men arkitekturen ska inte försvåra det.

---

# Hantering av felaktig release

Om release orsakar problem ska teamet kunna:

* identifiera berörd version
* läsa loggar
* kontrollera health endpoints
* kontrollera konfiguration
* kontrollera databasmigrationer
* rulla tillbaka eller stänga av funktion
* dokumentera incidenten
* skapa åtgärder inför nästa release

---

# Loggning vid deployment

Loggar ska kunna användas för att verifiera deployment och felsöka problem.

Loggar ska visa:

* att applikationen startat
* aktiv miljö
* aktiv version
* om mockläge används
* konfigurationsfel
* databasfel
* integrationsfel
* oväntade undantag

Loggar ska inte visa:

* lösenord
* tokens
* connection strings
* certifikat
* personuppgifter i onödan
* interna hemligheter

---

# Observability

Portalen bör successivt byggas med stöd för observability.

Miniminivå:

* health endpoint
* strukturerade loggar där det är rimligt
* tydliga felmeddelanden
* grundläggande statusinformation

På sikt kan observability omfatta:

* metrics
* tracing
* integrationsstatus
* dashboard för driftstatus
* larm vid fel

---

# Säkerhetskontroller inför release

Innan release ska följande kontroller göras:

```text
- [ ] Inga secrets finns i repositoryt.
- [ ] Inga interna URL:er finns i generisk kod.
- [ ] Inga certifikat finns i repositoryt.
- [ ] Inga connection strings är versionshanterade.
- [ ] Mockdata är fiktiv.
- [ ] Frontend innehåller inga hemligheter.
- [ ] Backend loggar inte känslig information.
- [ ] CORS är konfigurerat restriktivt.
- [ ] Secrets hanteras via godkänd intern mekanism.
- [ ] Verklig konfiguration ligger utanför generiskt repository.
```

---

# Kvalitetskontroller inför release

Innan release bör följande kontroller göras:

```text
- [ ] Frontend bygger utan fel.
- [ ] Backend bygger utan fel.
- [ ] Relevanta tester passerar.
- [ ] Statisk kodanalys är hanterad.
- [ ] Databasmigrationer är testade.
- [ ] Dokumentation är uppdaterad.
- [ ] Release notes finns.
- [ ] Konfigurationsändringar är dokumenterade.
- [ ] Smoke tests är definierade.
- [ ] Rollbackplan finns vid behov.
```

---

# Deploymentchecklista

Inför deployment:

```text
- [ ] Rätt version är vald.
- [ ] Rätt miljö är vald.
- [ ] Container images finns i registry.
- [ ] Konfiguration för målmiljö är på plats.
- [ ] Secrets för målmiljö är på plats.
- [ ] Eventuella databasmigrationer är förberedda.
- [ ] Eventuella feature flags är satta.
- [ ] Release notes är klara.
- [ ] Berörda personer är informerade.
```

Efter deployment:

```text
- [ ] Backend health endpoint svarar.
- [ ] Frontend laddar.
- [ ] Centrala API:er svarar.
- [ ] Databasanslutning fungerar.
- [ ] Loggar innehåller inga kritiska fel.
- [ ] Smoke tests är genomförda.
- [ ] Eventuella nya funktioner är verifierade.
- [ ] Release är kommunicerad.
```

---

# Ansvar

## Utvecklare

Utvecklare ansvarar för att:

* kod kan byggas
* tester körs
* dokumentation uppdateras
* inga secrets införs
* konfiguration hanteras korrekt
* releaseunderlag är begripligt

## Produktägare

Produktägare ansvarar för att:

* releaseinnehåll är prioriterat
* användarnytta är tydlig
* acceptans sker där det behövs
* kommunikation till användare planeras vid behov

## Teknisk granskare eller arkitekt

Teknisk granskare ansvarar för att:

* arkitekturprinciper följs
* integrationspåverkan är förstådd
* säkerhetsrisker är hanterade
* behov av ADR identifieras
* större tekniska beslut är dokumenterade

## Drift eller plattformsteam

Drift eller plattformsteam ansvarar enligt intern ansvarsfördelning för:

* driftmiljö
* OpenShift/Kubernetes
* secrets i drift
* registryåtkomst
* plattformsresurser
* övervakning
* backup och återställning där det är relevant

---

# Releasekandidater

En releasekandidat är en version som bedöms vara redo för verifiering inför release.

En releasekandidat bör:

* vara byggbar
* ha passerat relevanta tester
* ha container images skapade
* ha dokumenterade ändringar
* kunna driftsättas i testmiljö
* kunna verifieras med smoke tests

---

# Första versionens rekommendation

Första versionens release- och deploymentprocess bör vara enkel.

Fokus bör ligga på att:

* kunna bygga frontend
* kunna bygga backend
* kunna skapa container images
* kunna köra lokalt
* kunna använda exempelkonfiguration
* kunna hantera secrets utanför repositoryt
* kunna driftsätta i intern utvecklingsmiljö
* kunna verifiera med health endpoint
* kunna visa startsida och tjänstekatalog
* kunna länka till system via konfiguration
* kunna använda mockade eller manuellt förvaltade data

Avancerad automatisering kan införas stegvis.

---

# Avgränsningar

Detta dokument beskriver release- och deploymentprinciper.

Det beskriver inte:

* verkliga interna URL:er
* verkliga registry-adresser
* verkliga namespaces
* verkliga credentials
* fullständig Azure Pipelines-definition
* fullständig OpenShift-konfiguration
* detaljerad driftinstruktion
* detaljerad incidentprocess
* detaljerad backupstrategi
* exakt versionsstrategi

Dessa delar hanteras i intern miljö eller i separata tekniska dokument.

---

# Sammanfattning

Release och deployment ska vara säkra, spårbara och förvaltningsbara.

Kodbasen ska vara generisk och inte innehålla miljöspecifik eller känslig information.

Frontend och backend ska kunna byggas, paketeras och driftsättas på ett kontrollerat sätt.

Miljöskillnader ska hanteras genom konfiguration och secrets, inte genom kodändringar.

Första versionen ska hålla processen enkel men lägga grunden för mer automatiserad och kontrollerad releasehantering över tid.
