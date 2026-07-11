# 08_Lokal_utvecklingsmiljö.md

# Lokal utvecklingsmiljö

## Dokumentinformation

| Egenskap | Värde                                                                         |
| -------- | ----------------------------------------------------------------------------- |
| Dokument | 08_Lokal_utvecklingsmiljö.md                                                  |
| Typ      | Utvecklingsmiljö                                                              |
| Status   | Utkast                                                                        |
| Ägare    | Data- och analysportalen                                                      |
| Syfte    | Beskriva hur portalen ska kunna utvecklas och köras lokalt på ett säkert sätt |

---

# Syfte

Detta dokument beskriver principer och riktlinjer för lokal utvecklingsmiljö.

Syftet är att säkerställa att portalen kan utvecklas, testas och granskas lokalt utan att kräva åtkomst till företagets interna miljö.

Lokal utveckling ska kunna ske med:

* generisk kod
* lokal konfiguration
* lokal databas
* mockdata
* simulerade integrationer
* exempelvärden
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

# Grundprincip

Projektet ska kunna köras lokalt i ett säkert och frikopplat läge.

Den lokala utvecklingsmiljön ska efterlikna portalens arkitektur, men utan att ansluta till verkliga interna system.

Övergripande lokal målbild:

```text
Lokal webbläsare
   |
   v
Angular frontend
   |
   v
Lokal .NET Web API
   |
   v
Lokal PostgreSQL
   |
   v
Mockade integrationer och exempeldata
```

---

# Relation till övriga dokument

Lokal utveckling ska följa projektets övriga dokumentation.

Särskilt viktiga dokument är:

* `00_Projektprinciper.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`
* `06_Utvecklingsprinciper.md`
* `07_AI_Instruktioner.md`

Om lokal utveckling kräver avsteg från dessa dokument ska avsteget dokumenteras och motiveras.

---

# Mål för lokal utveckling

Den lokala utvecklingsmiljön ska göra det möjligt att:

* utveckla frontend
* utveckla backend
* testa API:er
* testa informationsmodellen
* visa portalen med mockdata
* arbeta med lokala beställningsflöden
* testa sök, filtrering och navigation
* verifiera grundläggande felhantering
* köra tester
* utveckla utan interna beroenden

Målet är inte att lokal miljö ska vara en exakt kopia av företagets interna driftmiljö.

Målet är att lokal miljö ska vara tillräckligt lik för att utveckling ska vara meningsfull, men tillräckligt frikopplad för att vara säker.

---

# Rekommenderade lokala komponenter

Den lokala utvecklingsmiljön bör bestå av:

* Angular frontend
* .NET Web API
* PostgreSQL
* mockdata
* exempelkonfiguration
* mockade integrationsadaptrar
* lokal health endpoint
* lokal logging
* lokal testmiljö

---

# Nödvändiga verktyg

Exakta versioner kan beslutas senare, men följande verktyg behövs normalt för lokal utveckling:

* Node.js
* npm
* Angular CLI
* .NET SDK
* PostgreSQL
* Git
* en kodredigerare, exempelvis Visual Studio Code eller Visual Studio
* valfritt verktyg för API-testning
* valfritt verktyg för databasinspektion

Om Docker eller Podman används kan PostgreSQL och andra lokala beroenden köras containeriserat.

Det ska dock vara möjligt att dokumentera lokal utveckling utan att förutsätta åtkomst till företagets container registry.

---

# Frontend lokalt

Frontend körs som Angular-applikation i lokal utvecklingsserver.

Kör frontend från repositoryts rot med det deklarerade `start`-scriptet:

```powershell
npm.cmd --prefix frontend start
```

Detta är det rekommenderade lokala startkommandot; användaren behöver inte byta till
`frontend/`. Med aktuell Angular-konfiguration blir frontend tillgänglig på
`http://localhost:4200/`. Processen fortsätter köra i den aktuella terminalen tills
den stoppas med `Ctrl+C`. Kontrollera även startup-utdata eftersom en upptagen port
eller framtida konfigurationsändring kan ge en annan adress.

Kommandot använder befintliga paket och scripts. Lägg inte till nya paket eller
scripts för denna dokumentationsrutin.

## Principer

Frontend ska:

* använda lokal backend-URL
* läsa säker runtime-konfiguration
* kunna köras utan interna systemlänkar
* kunna visa mockdata
* inte innehålla secrets
* inte innehålla interna URL:er
* inte anropa interna system direkt

## Lokal frontend-konfiguration

Frontend ska kunna använda lokal runtime-konfiguration.

Exempel:

```json
{
  "apiBaseUrl": "http://localhost:5000/api",
  "applicationName": "Data- och analysportalen",
  "features": {
    "showStatusPanel": true,
    "showDataCatalog": true,
    "showOrderFlows": true,
    "showTechnicalMetadata": true,
    "useMockData": true
  }
}
```

Detta är endast ett exempel.

Verkliga interna URL:er ska inte förekomma i lokal konfiguration som versionshanteras.

---

# Backend lokalt

Backend körs som lokal .NET Web API.

Exempel på lokal körning:

```text
dotnet run
```

Exakt kommando beror på projektets faktiska backendstruktur.

## Principer

Backend ska:

* exponera API:er till frontend
* ansluta till lokal PostgreSQL
* kunna köra med mockade integrationer
* validera lokal konfiguration
* inte kräva interna certifikat
* inte kräva interna tokens
* inte kräva interna URL:er
* inte kräva företagets nätverk

## Lokal backend-konfiguration

Backend ska använda lokal konfiguration som inte versionshanteras.

Exempel på lokal konfiguration:

```json
{
  "ConnectionStrings": {
    "Default": "<LOCAL_POSTGRES_CONNECTION_STRING>"
  },
  "FeatureFlags": {
    "UseMockIntegrations": true,
    "EnableOpenMetadataIntegration": false,
    "EnableQlikIntegration": false,
    "EnableGrafanaIntegration": false,
    "EnableChatPortalIntegration": false
  },
  "AllowedOrigins": [
    "http://localhost:4200"
  ]
}
```

Connection string ska inte checkas in.

En exempelfil kan däremot finnas som mall.

---

# Lokal databas

Portalens applikationsdatabas är PostgreSQL.

I lokal utveckling ska PostgreSQL kunna köras lokalt.

## Alternativ

PostgreSQL kan köras via:

* lokal installation
* Docker
* Podman
* annan godkänd lokal containerlösning

## Principer

Den lokala databasen ska:

* endast innehålla exempeldata
* inte innehålla produktionsdata
* inte innehålla personuppgifter
* inte innehålla exporter från interna system
* kunna återskapas från migrations och seeddata
* kunna rensas utan påverkan på interna system

## Lokal seeddata

Seeddata ska vara fiktiv.

Exempel:

* Exempel Dashboard
* Testdatamängd A
* Demo Information Mart
* Exempelteam Data
* Fiktiv Qlik-applikation
* Exempel AI-yta

Seeddata ska inte hämtas från verkliga interna system.

---

# Mockdata

Mockdata används för att utveckla portalen utan verkliga integrationer.

Mockdata kan exempelvis innehålla:

* tjänster
* systemlänkar
* guider
* beställningsflöden
* datamängder
* Information Marts
* BI-tillämpningar
* accessgrupper
* larm
* kontaktvägar
* statusinformation
* tekniska komponenter

## Principer

Mockdata ska vara:

* fiktiv
* generisk
* säker att dela
* fri från interna URL:er
* fri från verkliga AD-grupper
* fri från personuppgifter
* fri från produktionsdata
* tydligt markerad som exempeldata

---

# Mockade integrationer

Integrationer ska kunna ersättas med mockade implementationer i lokal utveckling.

Exempel:

```text
OpenMetadataAdapter
   -> MockOpenMetadataAdapter

QlikSenseAdapter
   -> MockQlikSenseAdapter

GrafanaAdapter
   -> MockGrafanaAdapter

ChatPortalAdapter
   -> MockChatPortalAdapter
```

## Principer

Mockade integrationer ska:

* följa samma interface som verkliga integrationer
* returnera fiktiv data
* kunna aktiveras via konfiguration
* inte kräva nätverksåtkomst
* inte kräva credentials
* inte kräva certifikat

Det ska vara tydligt i UI eller loggar när mockdata används.

---

# Feature flags lokalt

Feature flags används för att styra vad som är aktivt i lokal utveckling.

Exempel:

```json
{
  "FeatureFlags": {
    "UseMockIntegrations": true,
    "EnableDataCatalog": true,
    "EnableOrderFlows": true,
    "EnableTechnicalMetadata": true,
    "EnableOpenMetadataIntegration": false,
    "EnableQlikIntegration": false,
    "EnableChatPortalIntegration": false
  }
}
```

## Princip

Feature flags ska göra lokal utveckling enklare, men ska inte användas för att kringgå säkerhet.

Säkerhetskritiska beslut ska alltid hanteras i backend eller godkänd auktoriseringslösning.

---

# Lokala systemlänkar

Systemlänkar ska kunna visas lokalt utan att använda verkliga interna URL:er.

Exempel:

```json
{
  "id": "system-openmetadata",
  "name": "OpenMetadata",
  "description": "Exempel på datakatalog.",
  "urlKey": "OPENMETADATA_URL"
}
```

Lokal konfiguration kan innehålla ett säkert dummyvärde:

```json
{
  "SystemUrls": {
    "OPENMETADATA_URL": "https://example.local/openmetadata"
  }
}
```

## Princip

Lokal utveckling ska kunna visa hur länkar fungerar utan att exponera företagets verkliga länkar.

---

# Certifikat lokalt

Vissa verkliga integrationer kan kräva certifikat i intern miljö.

Lokal utveckling ska inte kräva sådana certifikat.

## Principer

* certifikat ska inte finnas i repositoryt
* certifikat ska inte krävas för normal lokal utveckling
* certifikatsökvägar i exempelfiler ska vara platshållare
* mockade integrationer ska användas där certifikat annars hade krävts

Exempel på platshållare:

```text
<CERTIFICATE_PATH>
<CERTIFICATE_PASSWORD>
```

---

# Secrets lokalt

Lokala secrets får inte checkas in.

För lokal utveckling kan secrets hanteras via:

* lokala konfigurationsfiler som ligger i `.gitignore`
* miljövariabler
* .NET user secrets
* annan lokal secret-hantering

## Princip

Även lokala secrets ska behandlas som känsliga.

De ska inte delas i chatt, dokumentation, screenshots eller Git.

---

# CORS lokalt

Lokal frontend och backend körs ofta på olika portar.

CORS ska därför stödja lokal utveckling.

Exempel:

```json
{
  "AllowedOrigins": [
    "http://localhost:4200"
  ]
}
```

## Princip

Wildcard ska inte användas som standard.

Tillåtna origins ska anges uttryckligen.

---

# Lokala portar

Standardportar kan användas lokalt, men ska inte hårdkodas i kod.

Exempel:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:5000
API:      http://localhost:5000/api
Postgres: localhost:5432
```

Dessa är exempelvärden.

Verkliga portar ska kunna ändras via konfiguration.

---

# Lokal hälsokontroll

Backend bör exponera en lokal health endpoint.

Exempel:

```text
GET /health
```

Health endpoint kan användas för att kontrollera att backend är igång.

I lokal utveckling kan health endpoint även kontrollera:

* att applikationen startar
* att konfiguration kan läsas
* att lokal databas är nåbar
* att mockläge är aktivt

Health endpoint ska inte exponera secrets.

---

# Lokal loggning

Loggning ska vara användbar för felsökning men säker.

Lokala loggar får inte innehålla:

* tokens
* lösenord
* connection strings
* certifikat
* personuppgifter
* interna URL:er
* interna servernamn

Loggar bör kunna visa:

* att applikationen startat
* aktiv miljö
* om mockintegrationer används
* fel vid konfigurationsläsning
* fel vid databasanslutning
* kontrollerade integrationsfel

---

# Lokala tester

Tester ska kunna köras lokalt utan åtkomst till interna system.

## Frontendtester

Frontendtester kan omfatta:

* komponenttester
* service-tester
* routing
* filtrering
* visning av mockdata
* felvyer
* formulärlogik

## Backendtester

Backendtester kan omfatta:

* services
* validering
* API:er
* repositories
* mockade integrationer
* konfigurationsvalidering

## Principer

Tester ska:

* använda fiktiva data
* kunna köras utan nätverksåtkomst till interna system
* inte kräva secrets
* inte kräva certifikat
* inte kräva produktionsdata

---

# Lokal utveckling utan intern åtkomst

En central princip är att utveckling ska kunna ske utanför företagets tekniska miljö.

Det innebär att följande ska fungera lokalt:

* bygga frontend
* köra frontend
* bygga backend
* köra backend
* köra tester
* läsa mockdata
* använda lokal PostgreSQL
* visa exempel på tjänstekatalog
* visa exempel på systemlänkar
* visa exempel på beställningsflöden

Följande ska inte krävas:

* VPN
* interna DNS-namn
* intern autentisering
* interna certifikat
* intern container registry
* intern Azure DevOps Server
* interna API:er
* verkliga systemlänkar

---

# Sanering av lokal miljö

Lokal miljö ska kunna rensas utan risk.

Det ska vara möjligt att:

* ta bort lokal databas
* återskapa lokal databas
* rensa mockdata
* byta lokal konfiguration
* starta om från exempelkonfiguration

Det ska inte finnas beroenden till interna system som gör lokal återställning riskfylld.

---

# Filer som inte ska versionshanteras

Följande lokala filer ska normalt inte versionshanteras:

```text
appsettings.Local.json
appsettings.Development.json
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

Även genererade filer ska exkluderas:

```text
node_modules/
dist/
build/
bin/
obj/
coverage/
.cache/
.angular/
```

---

# Exempelfiler

Repositoryt bör innehålla exempelfiler som hjälper utvecklare att komma igång.

Exempel:

```text
appsettings.example.json
runtime-config.example.json
services.example.json
navigation.example.json
feature-flags.example.json
mock/services.mock.json
mock/systems.mock.json
mock/orders.mock.json
mock/status.mock.json
```

Exempelfiler ska vara säkra att dela.

---

# Lokal startordning

När projektstrukturen finns på plats bör lokal startordning dokumenteras i `README.md`.

En möjlig ordning är:

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

Exakta kommandon ska dokumenteras när projektstrukturen och scripts är bestämda.

---

# Vanliga lokala problem

Dokumentationen bör på sikt beskriva vanliga lokala problem.

Exempel:

* frontend når inte backend
* CORS blockerar anrop
* backend saknar lokal konfiguration
* PostgreSQL är inte startad
* migrations har inte körts
* fel port används
* mockintegration är inte aktiverad
* runtime-config saknas
* fel Node.js-version
* fel .NET SDK-version

Dessa problem ska hanteras med tydliga felmeddelanden där det är möjligt.

---

# Avgränsningar

Detta dokument beskriver lokal utvecklingsmiljö på principnivå.

Det beskriver inte:

* exakta versionsnummer för alla verktyg
* fullständig installationsguide
* exakta kommandon för ett ännu inte skapat repository
* intern deployment
* intern OpenShift-konfiguration
* intern Azure DevOps-konfiguration
* verkliga integrationsvärden
* verkliga secrets

Dessa delar dokumenteras när projektets faktiska struktur är skapad.

---

# Första versionens rekommendation

Första versionen av lokal utvecklingsmiljö bör stödja:

* Angular frontend lokalt
* .NET Web API lokalt
* PostgreSQL lokalt
* mockade integrationer
* fiktiv seeddata
* exempelkonfiguration
* feature flags
* säker `.gitignore`
* enkel health endpoint
* tydlig README med startinstruktioner

Verkliga integrationer kan införas stegvis när koden körs i företagets interna miljö.

---

# Sammanfattning

Lokal utvecklingsmiljö ska göra det möjligt att utveckla portalen säkert utan företagets interna miljö.

All lokal utveckling ska bygga på generisk kod, fiktiv data, lokal konfiguration och mockade integrationer.

Interna URL:er, secrets, certifikat, produktionsdata och företagsspecifika värden ska aldrig krävas för normal lokal utveckling och ska aldrig finnas i repositoryt.
