# 05_Konfiguration.md

# Konfiguration

## Dokumentinformation

| Egenskap | Värde                                                                        |
| -------- | ---------------------------------------------------------------------------- |
| Dokument | 05_Konfiguration.md                                                          |
| Typ      | Konfigurationsprinciper                                                      |
| Status   | Utkast                                                                       |
| Ägare    | Data- och analysportalen                                                     |
| Syfte    | Beskriva hur konfiguration, miljövärden och secrets ska hanteras i projektet |

---

# Syfte

Detta dokument beskriver hur konfiguration ska hanteras i projektet.

Syftet är att säkerställa att portalen kan utvecklas, testas och driftsättas på ett säkert och förvaltningsbart sätt utan att känslig eller företagsspecifik information hamnar i repositoryt.

Dokumentet beskriver principer för:

* miljökonfiguration
* lokala utvecklingsinställningar
* interna driftinställningar
* secrets
* systemlänkar
* integrationer
* feature flags
* exempeldata
* Git-hantering

Dokumentet är inte en lista över verkliga miljövärden.

---

# Grundprincip

Projektet ska följa principen:

> Konfiguration före kod.

Det innebär att miljöberoende eller företagsspecifik information inte ska hårdkodas i applikationen.

Kodbasen ska vara generisk.

Företagsspecifika värden ska tillföras först i den miljö där applikationen körs.

---

# Vad får inte finnas i repositoryt

Repositoryt får aldrig innehålla verkliga värden för:

* interna URL:er
* servernamn
* connection strings
* användarnamn
* lösenord
* API-nycklar
* tokens
* klienthemligheter
* certifikat
* privata nycklar
* interna AD-grupper
* interna namespaces
* interna registry-adresser
* interna system-ID:n
* produktionsdata
* personuppgifter
* miljöspecifika konfigurationsvärden

Om ett värde endast gäller företagets interna miljö ska det inte versionshanteras i det generiska repositoryt.

---

# Tillåtna konfigurationsfiler i repositoryt

Repositoryt får innehålla mallar och exempelkonfiguration.

Sådana filer ska vara tydligt markerade med exempelvis:

```text
.example
.template
.sample
```

Exempel:

```text
appsettings.example.json
environment.example.ts
runtime-config.example.json
services.example.json
navigation.example.json
feature-flags.example.json
```

Exempelfiler får endast innehålla:

* dummyvärden
* platshållare
* lokala exempelvärden
* fiktiva systemnamn
* fiktiva länkar
* säker mockdata

---

# Otillåtna konfigurationsfiler i repositoryt

Filer med verklig konfiguration ska inte versionshanteras.

Exempel på filer som normalt ska ligga i `.gitignore`:

```text
appsettings.Local.json
appsettings.Development.json
appsettings.Production.json
environment.ts
environment.local.ts
runtime-config.json
services.local.json
secrets.json
.env
.env.local
*.pfx
*.pem
*.key
*.crt
*.cer
```

Undantag får endast göras om filen är helt sanerad och uttryckligen är en exempel- eller mallfil.

---

# Rekommenderad konfigurationsstruktur

Projektet bör separera konfiguration efter ansvar.

Exempel:

```text
config/
  examples/
    appsettings.example.json
    runtime-config.example.json
    services.example.json
    navigation.example.json
    feature-flags.example.json

  schemas/
    appsettings.schema.json
    services.schema.json
    navigation.schema.json
```

För frontend:

```text
frontend/
  src/
    assets/
      config/
        runtime-config.example.json
```

För backend:

```text
backend/
  appsettings.example.json
```

Verkliga motsvarigheter skapas lokalt eller tillförs i intern miljö.

---

# Backend-konfiguration

Backend-konfiguration används för serverlogik, databas, integrationer, autentisering, CORS och andra miljöberoende inställningar.

## Exempel på backend-konfiguration

```json
{
  "ConnectionStrings": {
    "Default": ""
  },
  "Services": {
    "OpenMetadata": "<OPENMETADATA_URL>",
    "QlikSense": "<QLIK_SENSE_URL>",
    "QlikSenseApi": "<QLIK_SENSE_API_URL>",
    "Grafana": "<GRAFANA_URL>",
    "Dagster": "<DAGSTER_URL>",
    "Trino": "<TRINO_URL>",
    "Lakekeeper": "<LAKEKEEPER_URL>",
    "UiPath": "<UIPATH_URL>",
    "Nintex": "<NINTEX_URL>",
    "ChatPortal": "<CHAT_PORTAL_URL>"
  },
  "Authentication": {
    "Provider": "<AUTH_PROVIDER>",
    "Authority": "<AUTHORITY_URL>",
    "ClientId": "<CLIENT_ID>"
  },
  "AllowedOrigins": [
    "http://localhost:4200"
  ],
  "FeatureFlags": {
    "UseMockIntegrations": true,
    "EnableOpenMetadataIntegration": false,
    "EnableQlikIntegration": false,
    "EnableChatPortalIntegration": false
  }
}
```

Detta är endast ett exempel.

Verkliga värden ska tillföras lokalt eller i intern miljö.

---

# Frontend-konfiguration

Frontend ska inte innehålla hemligheter.

Frontend-konfiguration får endast innehålla värden som är säkra att exponera i webbläsaren.

## Frontend får innehålla

* publik frontend-konfiguration
* visningsinställningar
* feature flags utan säkerhetsbetydelse
* namn på funktioner
* lokal API-basväg
* teman och layoutinställningar
* länknycklar

## Frontend får inte innehålla

* tokens
* lösenord
* connection strings
* klienthemligheter
* certifikat
* interna API-nycklar
* känsliga URL:er om dessa inte ska exponeras för användaren
* behörighetslogik som inte valideras i backend

## Exempel på frontend runtime-konfiguration

```json
{
  "apiBaseUrl": "/api",
  "applicationName": "Data- och analysportalen",
  "features": {
    "showStatusPanel": true,
    "showDataCatalog": true,
    "showOrderFlows": true,
    "showTechnicalMetadata": false
  }
}
```

---

# Runtime-konfiguration

Frontend bör kunna läsa viss konfiguration vid runtime.

Det gör att samma byggda frontend kan användas i flera miljöer utan att byggas om.

Exempel:

```text
frontend byggs en gång
  |
  v
runtime-config.json tillförs per miljö
  |
  v
samma kod fungerar i lokal, test och intern drift
```

Detta minskar risken för miljöspecifika kodändringar.

---

# Systemlänkar

Systemlänkar ska inte hårdkodas i komponenter.

Länkar ska hanteras som konfiguration eller innehållsdata.

## Exempel

I innehållsdata:

```json
{
  "id": "system-openmetadata",
  "name": "OpenMetadata",
  "urlKey": "OPENMETADATA_URL"
}
```

I lokal eller intern konfiguration:

```json
{
  "SystemUrls": {
    "OPENMETADATA_URL": "<URL>"
  }
}
```

På så sätt kan kod och innehåll beskriva att det finns en länk utan att repositoryt innehåller den verkliga interna URL:en.

---

# Integrationer

Integrationer ska kunna slås på och av per miljö.

Det är särskilt viktigt eftersom lokal utveckling inte ska kräva åtkomst till interna system.

## Exempel på feature flags

```json
{
  "FeatureFlags": {
    "UseMockIntegrations": true,
    "EnableOpenMetadataIntegration": false,
    "EnableQlikIntegration": false,
    "EnableGrafanaIntegration": false,
    "EnableTrinoIntegration": false,
    "EnableChatPortalIntegration": false
  }
}
```

## Princip

Om en integration inte är konfigurerad ska applikationen kunna starta ändå, så länge integrationen inte krävs för aktuell funktion.

Frontend ska kunna visa ett kontrollerat meddelande om en integration är inaktiv eller inte tillgänglig.

---

# Mockdata och exempeldata

Lokal utveckling ska kunna ske med mockdata.

Mockdata ska vara:

* fiktiv
* generisk
* fri från interna URL:er
* fri från personuppgifter
* fri från verkliga systemnamn om de bedöms känsliga
* tydligt markerad som exempeldata

Exempel:

```text
mock/
  services.mock.json
  systems.mock.json
  guides.mock.json
  orders.mock.json
  datasets.mock.json
  status.mock.json
```

Mockdata ska inte förväxlas med produktionsdata eller export från interna system.

---

# Secrets

Secrets ska aldrig hanteras som vanlig konfiguration i repositoryt.

Exempel på secrets:

* lösenord
* connection strings
* tokens
* API-nycklar
* klienthemligheter
* certifikatlösenord
* privata nycklar
* certifikat

## Lokal utveckling

Vid lokal utveckling ska secrets hanteras via lokal fil, användarsecrets eller miljövariabler.

Exempel:

```text
dotnet user-secrets
miljövariabler
lokal appsettings.Local.json
```

Lokala secrets får inte checkas in.

## Intern drift

I intern drift ska secrets hanteras via godkänd mekanism i driftplattformen.

Exempel:

```text
OpenShift Secret
Kubernetes Secret
pipeline variables
intern secret-hantering
```

---

# Certifikat

Vissa integrationer kan kräva certifikat.

Certifikat får inte lagras i repositoryt.

Det gäller exempelvis:

```text
*.pfx
*.pem
*.key
*.crt
*.cer
```

Om certifikat behövs för lokal utveckling ska dessa hanteras separat och inte ingå i projektets Git-repository.

Exempelfiler får endast visa förväntad struktur.

---

# CORS

CORS ska vara restriktivt.

Wildcard ska inte användas i produktionsliknande miljö.

## Ej rekommenderat

```json
{
  "AllowedOrigin": "*"
}
```

## Rekommenderat

```json
{
  "AllowedOrigins": [
    "http://localhost:4200"
  ]
}
```

I intern miljö ska endast godkända interna frontend-adresser anges.

Tillåtna origins ska hanteras via konfiguration.

---

# Databaskonfiguration

Portalens applikationsdatabas är PostgreSQL.

Connection string ska aldrig ligga i repositoryt.

## Lokal utveckling

Lokal utveckling kan använda lokal PostgreSQL.

Exempel:

```text
localhost
egen utvecklingsdatabas
testanvändare
testlösenord
mockdata
```

Även lokala connection strings ska hanteras i lokala filer som inte versionshanteras.

## Intern drift

I intern drift tillförs connection string via godkänd secret- eller konfigurationsmekanism.

## SQL Server

Microsoft SQL Server kan förekomma som framtida integration eller datakälla.

SQL Server-konfiguration ska hanteras på samma sätt som andra integrationer:

* inga connection strings i repositoryt
* inga interna servernamn i repositoryt
* integration via backend
* tydlig konfiguration per miljö

---

# Kubernetes och OpenShift-konfiguration

Portalen ska kunna driftsättas i Kubernetes/OpenShift.

Generiska manifest eller mallar kan finnas i repositoryt, men miljöspecifika värden ska inte göra det.

## Tillåtet i repositoryt

* generiska deploymentmallar
* exempel på service-definitioner
* exempel på route eller ingress
* exempel på ConfigMap-struktur
* exempel på Secret-struktur utan verkliga värden
* kustomize-bas utan interna miljövärden

## Ej tillåtet i repositoryt

* verkliga namespaces
* interna registry-adresser
* interna routes
* interna hostnamn
* image pull secrets
* tokens
* lösenord
* miljöspecifika overlays med känslig information
* verkliga certifikat
* interna servicekonton

---

# Container registry

Container registry, exempelvis Quay eller motsvarande, ska hanteras som miljöspecifik infrastruktur.

Repositoryt får inte innehålla:

* verklig registry-URL
* credentials
* image pull secrets
* interna image-namn om de bedöms känsliga

Exempelvärden ska använda platshållare:

```text
<CONTAINER_REGISTRY>
<IMAGE_NAME>
<IMAGE_TAG>
```

---

# Azure DevOps och pipelines

Azure DevOps Server och Azure Pipelines används i intern miljö.

Pipeline-konfiguration kan innehålla miljöspecifika värden och ska därför granskas särskilt noggrant.

## Pipelinefiler får inte innehålla

* secrets
* tokens
* interna URL:er
* interna registry-adresser
* interna service connections
* produktionsnamn
* miljöspecifika namespaces

## Rekommendation

Pipelinefiler i ett generiskt repository ska vara mallar.

Verkliga service connections, credentials och miljövärden ska hanteras i intern Azure DevOps-miljö.

---

# Miljöer

Projektet ska kunna stödja flera miljöer.

Exempel:

* local
* development
* test
* staging
* production

Namnen kan anpassas till företagets interna standard.

## Princip

Miljöskillnader ska hanteras via konfiguration, inte kodändringar.

Samma kodbas ska kunna användas i flera miljöer.

---

# Feature flags

Feature flags används för att kunna aktivera eller inaktivera funktioner per miljö.

Exempel:

```json
{
  "FeatureFlags": {
    "EnableDataCatalog": true,
    "EnableOrderFlows": true,
    "EnableTechnicalMetadata": false,
    "EnableOpenMetadataIntegration": false,
    "EnableMockStatus": true
  }
}
```

Feature flags ska inte användas för att kringgå säkerhetskrav.

Säkerhetskritisk behörighet ska alltid valideras i backend eller godkänd auktoriseringslösning.

---

# Konfiguration för AI-verktyg

Eftersom projektet kan utvecklas med AI-stöd ska konfigurationsprinciperna vara tydliga för AI-verktyg.

AI-verktyg får inte skapa eller föreslå verkliga värden för:

* interna URL:er
* konton
* lösenord
* tokens
* certifikat
* AD-grupper
* servernamn
* namespaces
* connection strings

AI-verktyg ska använda platshållare eller exempelvärden.

Exempel:

```text
<API_BASE_URL>
<OPENMETADATA_URL>
<QLIK_SENSE_URL>
<CLIENT_ID>
<CLIENT_SECRET>
<DATABASE_CONNECTION_STRING>
```

---

# Rekommenderade platshållare

Följande platshållare kan användas i exempelkonfiguration:

```text
<COMPANY_NAME>
<ENVIRONMENT_NAME>
<API_BASE_URL>
<PORTAL_FRONTEND_URL>
<PORTAL_BACKEND_URL>
<DATABASE_CONNECTION_STRING>
<POSTGRES_HOST>
<POSTGRES_DATABASE>
<POSTGRES_USER>
<POSTGRES_PASSWORD>
<OPENMETADATA_URL>
<QLIK_SENSE_URL>
<QLIK_SENSE_API_URL>
<GRAFANA_URL>
<TRINO_URL>
<DAGSTER_URL>
<LAKEKEEPER_URL>
<CHAT_PORTAL_URL>
<KEYCLOAK_TOKEN_URL>
<CLIENT_ID>
<CLIENT_SECRET>
<CERTIFICATE_PATH>
<CERTIFICATE_PASSWORD>
<CONTAINER_REGISTRY>
<NAMESPACE>
```

---

# Validering av konfiguration

Applikationen bör validera nödvändig konfiguration vid uppstart.

Om obligatoriska värden saknas ska applikationen ge ett tydligt och säkert felmeddelande.

## Principer

* Saknad konfiguration ska upptäckas tidigt.
* Felmeddelanden ska inte exponera secrets.
* Lokala mocklägen ska tillåta att vissa integrationer saknar konfiguration.
* Produktionsliknande miljöer ska kräva striktare validering.

---

# Gitignore

Projektets `.gitignore` ska skydda mot att känsliga filer råkar checkas in.

Exempel på poster:

```text
# Local configuration
appsettings.Local.json
appsettings.Development.json
appsettings.Production.json
runtime-config.json
environment.ts
environment.local.ts
.env
.env.*

# Secrets and certificates
*.pfx
*.pem
*.key
*.crt
*.cer
secrets.json

# Build artifacts
node_modules/
dist/
build/
bin/
obj/
coverage/
.cache/
.angular/

# IDE/user files
.vscode/
.idea/
*.user
*.suo
```

Detta är en grundlista och ska anpassas till projektets faktiska struktur.

---

# Sanering före export

Innan kod eller dokumentation flyttas från företagets miljö till en extern eller privat utvecklingsmiljö ska konfiguration granskas och saneras.

Kontrollera särskilt:

* `appsettings*.json`
* `.env`
* `environment*.ts`
* `runtime-config*.json`
* `package-lock.json`
* `.npmrc`
* `nuget.config`
* `Dockerfile`
* `docker-compose.yml`
* Kubernetes/OpenShift-manifest
* pipelinefiler
* `.http`-filer
* certifikatkataloger
* mockdata
* seeddata
* loggar
* screenshots
* dokumentation

Git-historik ska inte följa med om den kan innehålla känslig information.

---

# Första versionens rekommendation

I första versionen bör projektet stödja:

* lokal frontendkonfiguration
* lokal backendkonfiguration
* lokal PostgreSQL
* mockade integrationer
* exempeldata
* feature flags
* systemlänkar via konfigurationsnycklar
* `.example`-filer för alla viktiga konfigurationstyper
* tydlig `.gitignore`
* dokumenterad saneringsprocess

Avancerad secret-hantering, full pipelineintegration och komplett OpenShift-konfiguration kan införas stegvis.

---

# Avgränsningar

Detta dokument beskriver konfigurationsprinciper.

Det beskriver inte:

* exakta interna miljövärden
* verkliga URL:er
* verkliga connection strings
* verkliga secrets
* detaljerad OpenShift-konfiguration
* detaljerad Azure DevOps-pipeline
* fullständig installationsguide
* exakt databasmodell

Dessa delar hanteras i interna miljöer eller i separata tekniska dokument.

---

# Sammanfattning

Konfiguration är en central del av projektets säkerhet och förvaltningsbarhet.

Kodbasen ska vara generisk och kunna utvecklas lokalt utan åtkomst till företagets interna miljö.

Verkliga miljövärden, länkar, secrets och certifikat ska aldrig finnas i repositoryt.

Portalen ska kunna kompletteras med rätt konfiguration först när den körs i företagets interna miljö.
