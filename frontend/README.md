# Frontend – Data- och analysportalen (mockup)

Angular-applikation som utgör den lokala mockupen av Data- och analysportalen. Se
[repositoryts huvud-README](../README.md) och [`docs/`](../docs/) för projektets fulla kontext,
principer och informationsmodell.

Detta är en visuell och funktionell prototyp. Det finns ingen backend – all data läses från fiktiv
mockdata under `public/assets/mock/`.

För en fullständig genomgång av arkitektur, routing, mockdataflöde, runtime-konfiguration och
hur du lägger till en ny sida/tjänst/systemlänk, se
[`docs/13_Utvecklarguide.md`](../docs/13_Utvecklarguide.md).

## Köra lokalt

Installera låsta beroenden och starta rekommenderat från repositoryts rot:

```powershell
npm.cmd --prefix frontend ci
npm.cmd --prefix frontend start
```

Processen fortsätter köra i terminalen tills den stoppas med `Ctrl+C`.

Öppna `http://localhost:4200/` i webbläsaren. Sidan laddas om automatiskt vid ändringar.

### Jämför nästa mockupiteration

Startsidan öppnar Variant B som huvudriktning och innehåller fortsatt en variantväljare
för tre uttryck som delar samma data och funktionella kärna:

- `/?variant=a` – behovsstyrd katalogarbetsyta
- `/?variant=b` – minimalistisk sökportal
- `/?variant=c` – data product-inspirerad datamarknad

Variant B visar typade sökförslag vid fokus, en trestegsintroduktion för nya användare
och kompakta behovsingångar. Den samlade sökningen behåller resultatlistan och visar en
previewpanel på desktop; på mindre skärm staplas panelen under listan.
På startsidan minimeras huvudnavigationen till ett ikonrail och toppsöket döljs så att
den centrala sökningen är entydig. På arbetsvyer visas full navigation och toppsök igen.
Variant B använder adaptiva maxbredder för hero (1280 px), vanliga uppgifter (1344 px)
och rekommenderat/status/support (1408 px). Ikonrailens etiketter visas vid hover och
tangentbordsfokus, och sökförslag kan flyttas med Tab eller upp-/nerpil.

Nya kärnresor finns under `/sok`, `/behov/rapport` och `/data/:id`. Prova exempelvis
`/sok?q=rapport` och `/data/dataset-sales-transactions-demo`.

## Struktur

```text
src/app/
├── core/           Runtime-konfiguration och generisk mockdata-åtkomst
├── shared/         Återanvändbara komponenter (kort, badges, sökruta, m.m.)
├── layout/         Applikationsskal: sidomeny, topbar, sidfot
├── features/       Sidor/vyer, en katalog per informationsområde
├── models/         TypeScript-modeller som speglar informationsmodellen (docs/03)
└── services/       Angular services som läser mockdata per informationsobjekt
```

Mockdata ligger under `public/assets/mock/*.json` (se `public/assets/mock/README.md` för en
filöversikt) och runtime-konfiguration under `public/assets/config/runtime-config.json` (se
`public/assets/config/README.md`). Inget av innehållet är känsligt – se
[`docs/05_Konfiguration.md`](../docs/05_Konfiguration.md).

Systemlänkar och dokumentationslänkar hårdkodas aldrig – de beskrivs som en nyckel
(`urlKey`/`documentationUrlKey`/`linkKey`) i mockdata och slås upp mot `systemUrls` i
runtime-konfigurationen via `core/links/system-url.service.ts`. Se
[`docs/13_Utvecklarguide.md#variabelstyrda-urler-och-urlkey`](../docs/13_Utvecklarguide.md#variabelstyrda-urler-och-urlkey).

## Bygga

Från repositoryts rot:

```powershell
npm.cmd --prefix frontend run build
```

Byggartefakter hamnar i `dist/` (ingår inte i versionshantering).

## Tester

Från repositoryts rot:

```powershell
npm.cmd --prefix frontend test -- --watch=false
```

## Container-buildkontrakt (ADR-0007)

Sedan AB-034 finns en produktionstjänlig, miljöoberoende container-
builddefinition för frontenden: [`Dockerfile`](Dockerfile). Detta
implementerar Portal / Data Platforms sida av
[ADR-0007](../docs/adr/0007-containerbaserad-deployment-persistent-portalinstans.md)s
kontrakt — **inte** en persistent, deployad instans i Hosting Lab.

### Bygga imagen

Byggkontext är `frontend/`. Från repositoryts rot:

```powershell
docker build -t portal-frontend:local frontend
```

Bygget är en multi-stage build:

1. **Build-stage** (`node:22-alpine`): `npm ci` mot den versionshanterade
   `package-lock.json`, följt av repositoryts faktiska production-build
   (`npm run build`, dvs. `ng build`). Ingår inte i den slutliga imagen.
2. **Runtime-stage** (`nginxinc/nginx-unprivileged:1.27-alpine`): serverar
   enbart den redan byggda, statiska artefakten. Ingen Node-runtime och
   ingen `ng serve` i runtime-stagen.

**Vald statisk webbserver:** `nginx-unprivileged` — en officiell nginx-
variant byggd för att köra icke-root och lyssna på en icke-privilegierad
port (`8080`) utan extra användar-/rättighetsuppsättning, vilket också
ligger i linje med portalens dokumenterade framtida OpenShift-riktning
(`docs/04_Systemarkitektur.md`). Servern konfigureras med en minimal
[`nginx.conf`](nginx.conf) som ger Angular SPA-fallback (alla routes utan
matchande fil faller tillbaka till `index.html`, så direkta djuplänkar
fungerar). Detta är, i linje med ADR-0007, medvetet en
implementationsdetalj — ingen reverse proxy mot `/api` implementeras i
denna container; den externa same-origin-routingen ägs av Hosting Lab.

### Runtime-config-kontrakt

Angular CLI 22:s application-builder publicerar production-bygget under
`dist/frontend/browser/` (verifierat lokalt), vilket blir
`/usr/share/nginx/html/` i runtime-imagen. Den exakta containersökvägen för
runtime-konfigurationen är därför:

```text
/usr/share/nginx/html/assets/config/runtime-config.json
```

Imagen innehåller den versionshanterade, säkra
default-`runtime-config.json` (se
[`public/assets/config/README.md`](public/assets/config/README.md)) med
`apiBaseUrl: "/api"` (relativ, same-origin-kompatibel). För en miljöspecifik
deployment ska Hosting Lab ersätta filen på ovanstående containersökväg
externt vid körning (t.ex. via en fil-mount) — **utan att bygga om
imagen**. Detta repository definierar enbart kontraktet (vilken fil, vilken
sökväg, vilken struktur); den faktiska mount-/leveransmekanismen i Compose
ägs av Hosting Lab.

### `.dockerignore`

[`.dockerignore`](.dockerignore) utesluter bland annat `node_modules/`,
`dist/`, `.angular/` och den gitignorade, lokala
`public/assets/config/runtime-config.local.json` från byggkontexten, så att
en utvecklares lokala API-override aldrig kan hamna i imagen.

### Deploymentstatus

**Implementerat och tekniskt verifierat i detta AB:** ett reproducerbart,
miljöoberoende container-buildkontrakt för frontenden, inklusive extern
runtime-config-ersättning utan rebuild.

**Inte gjort i detta AB:** ingen persistent, deployad instans finns i
Hosting Lab. Den faktiska Compose-runtimen, reverse proxyn och
secrets-/konfigurationsinjektionen ägs av Hosting Lab och ligger utanför
detta repository (ADR-0007). Portalen körs fortsatt lokalt via `ng serve` i
normal utveckling.

## Mer information

Genererat med [Angular CLI](https://github.com/angular/angular-cli) 22. För kommandoreferens, se
[Angular CLI Overview](https://angular.dev/tools/cli).
