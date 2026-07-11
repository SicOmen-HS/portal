# Data- och analysportalen – lokal mockup

Detta repository innehåller en lokal, körbar **mockup** av den framtida interna portalen för
**Data- och analysportalen**.

Mockupen är en visuell och funktionell prototyp som visar hur portalen kan struktureras, se ut och
kännas. Den är **inte** en färdig produktionslösning – det finns ingen backend, ingen databas och
inga riktiga integrationer. All data är fiktiv mockdata.

Fullständig projektdokumentation (vision, verksamhet, informationsmodell, arkitektur,
konfigurationsprinciper med mera) finns i [`docs/`](docs/), se särskilt [`docs/README.md`](docs/README.md)
och den praktiska [`docs/13_Utvecklarguide.md`](docs/13_Utvecklarguide.md).

---

## Teknisk stack

* **Frontend:** Angular (standalone components, signals), TypeScript
* **UI/layout:** Bootstrap 5, Bootstrap Icons, SCSS med projektets egna design tokens
* **Typsnitt:** Open Sans (självhostat via `@fontsource/open-sans`)
* **Data:** Fiktiv mockdata som JSON-filer, inget backend-API i denna iteration

Se [`docs/04_Systemarkitektur.md`](docs/04_Systemarkitektur.md) för den fullständiga
målbilden (Angular + .NET Web API + PostgreSQL) som denna mockup är ett första steg mot.

---

## Projektstruktur

```text
/
├── docs/                          Projektets styrande dokumentation
├── config/
│   ├── README.md                  Förklarar config-katalogens roll
│   └── examples/                  Mallar för framtida miljö-/backend-konfiguration
├── frontend/                      Angular-applikationen (mockupen)
│   ├── public/assets/
│   │   ├── mock/                  Fiktiv innehållsdata (README i katalogen)
│   │   └── config/                Runtime-konfiguration (README i katalogen)
│   └── src/app/
│       ├── core/                  Konfiguration, länkuppslag (SystemUrlService), mockdataåtkomst
│       ├── shared/                 Återanvändbara komponenter
│       ├── layout/                 Sidomeny, topbar, sidfot
│       ├── features/               En katalog per sida
│       ├── models/                  TypeScript-modeller (speglar informationsmodellen)
│       └── services/                 Domänspecifika mockdata-services
├── .vscode/extensions.json         Rekommenderade VS Code-extensions
└── images/                         Referensbilder, t.ex. ursprunglig designskiss
```

Se [`docs/13_Utvecklarguide.md`](docs/13_Utvecklarguide.md) för en genomgång av varje
katalogs ansvar.

---

## Förutsättningar

* [Node.js](https://nodejs.org/) (LTS) och npm
* Git (för att klona/versionshantera repot)
* Rekommenderat: Visual Studio Code med extensions enligt
  [`docs/14_Rekommenderade_extensions.md`](docs/14_Rekommenderade_extensions.md) –
  öppna repot i VS Code så föreslås dessa automatiskt via `.vscode/extensions.json`.

Ingen databas, inget internt nätverk och inga interna konton krävs.

---

## Installation

Kör från repositoryts rot. Den versionshanterade `frontend/package-lock.json` gör
`ci` till det reproducerbara normalflödet:

```powershell
npm.cmd --prefix frontend ci
```

## Starta mockupen lokalt

```powershell
npm.cmd --prefix frontend start
```

Öppna sedan i webbläsaren:

```text
http://localhost:4200
```

Ingen ytterligare konfiguration krävs. Mockupen körs helt lokalt med fiktiv exempeldata och
säker exempelkonfiguration (se [Konfiguration](#konfiguration) nedan).
Processen fortsätter köra i terminalen och stoppas med `Ctrl+C`.

## Bygga

```powershell
npm.cmd --prefix frontend run build
```

Byggartefakter hamnar i `frontend/dist/` (ingår inte i versionshantering).

## Testa

```powershell
npm.cmd --prefix frontend test -- --watch=false
```

Kör bland annat ett test för `SystemUrlService` som verifierar att URL-uppslagning och
den säkra fallback-mekanismen fungerar (se [Variabelstyrda URL:er](#variabelstyrda-urler-och-systemlänkar)).

---

## Vad ingår i mockupen

* **Startsida** – sök, genvägar, prioriterade tjänster, beställningar och status i korthet.
* **Tjänster** – tjänstekatalog med sök/filter och detaljvy för varje tjänst.
* **System & länkar** – exempel på system (Qlik Sense, Grafana, OpenMetadata, Generativ AI
  Chattportal, UiPath, Nintex m.fl.) med konfigurationsstyrda platshållarlänkar.
* **Data & katalog** – exempel på datamängder, Information Marts och BI-tillämpningar.
* **Guider & dokumentation** – guider kopplade till tjänster och system.
* **Beställ & få tillgång** – beställningstyper, inklusive exempel med flera steg och beroenden.
* **Status & drift** – samlad status, planerat underhåll och historik.
* **Kontakt & support** – kontaktvägar och vanliga frågor.
* **Om portalen** – syfte, mockupstatus och koppling till projektdokumentationen.

Se [`frontend/README.md`](frontend/README.md) för tekniska detaljer om Angular-applikationen.

---

## Var mockdata finns

All data portalen visar ligger som JSON-filer i
[`frontend/public/assets/mock/`](frontend/public/assets/mock/README.md) – en fil per
informationsobjekt (tjänster, system, guider, beställningar, kontaktvägar, datamängder,
status med mera). Katalogen har en egen `README.md` som listar samtliga filer och
förklarar hur man lägger till ny mockdata.

## Konfiguration

Portalens runtime-konfiguration ligger i
[`frontend/public/assets/config/runtime-config.json`](frontend/public/assets/config/README.md)
och läses av frontend vid uppstart. Den styr bland annat:

* `apiBaseUrl` – basväg för ett framtida backend-API (används inte ännu)
* `features` – feature flags som visar/döljer delar av UI:t
* `systemUrls` – kartan som mappar innehållets länknycklar till faktiska URL:er (se nästa avsnitt)

En dokumenterad mall för framtida miljöer finns i
[`config/examples/runtime-config.example.json`](config/examples/runtime-config.example.json),
se [`config/README.md`](config/README.md) för hur de två filerna hänger ihop.

### Variabelstyrda URL:er och systemlänkar

**Ingen komponent och ingen mockfil innehåller en riktig URL.** Mockdata beskriver
istället en nyckel (`urlKey`, `documentationUrlKey` eller `linkKey`), och
`runtime-config.json`s `systemUrls`-karta mappar nyckeln till en adress:

```json
// frontend/public/assets/mock/system-links.mock.json
{ "id": "link-openmetadata-user", "urlKey": "OPENMETADATA_URL", "linkType": "user", "...": "..." }
```

```json
// frontend/public/assets/config/runtime-config.json
{ "systemUrls": { "OPENMETADATA_URL": "https://example.local/openmetadata" } }
```

Komponenter slår upp den faktiska URL:en via `SystemUrlService`
(`frontend/src/app/core/links/system-url.service.ts`), som returnerar en säker
fallback (`"#"`, inget kastat fel) om nyckeln saknas. Det betyder att **portalen kan
flyttas mellan lokal miljö, testmiljö och en framtida intern miljö genom att bara byta
värden i `runtime-config.json` – ingen kod eller mockdata behöver ändras.**

Fullständig genomgång: [`docs/13_Utvecklarguide.md#variabelstyrda-urler-och-urlkey`](docs/13_Utvecklarguide.md#variabelstyrda-urler-och-urlkey).

### Lägga till en ny systemlänk

1. Lägg till en post med ett `urlKey` i `frontend/public/assets/mock/system-links.mock.json`.
2. Lägg till samma nyckel i **både** `frontend/public/assets/config/runtime-config.json`
   (exempelvärde, t.ex. `https://example.local/...`) och
   `config/examples/runtime-config.example.json` (platshållarvärde, t.ex. `<MITT_SYSTEM_URL>`).
3. Vänta på automatisk omladdning i den körande
   `npm.cmd --prefix frontend start`-processen, eller stoppa den med `Ctrl+C` och
   starta om samma kommando. Kontrollera sedan länken på
   `/system`.

### Lägga till en ny sida

Se [`docs/13_Utvecklarguide.md#lägga-till-ny-sida`](docs/13_Utvecklarguide.md#lägga-till-ny-sida) –
kort sagt: skapa en standalone-komponent under `frontend/src/app/features/`, registrera en
route i `frontend/src/app/app.routes.ts`, och lägg till en post i
`frontend/src/app/layout/nav-items.ts`.

### Lägga till en ny tjänst i mockdata

Lägg till ett objekt i `frontend/public/assets/mock/services.mock.json` enligt
`ServiceOffering`-modellen (`frontend/src/app/models/service-offering.model.ts`). Ingen
kodändring krävs – se [`docs/13_Utvecklarguide.md#lägga-till-ny-tjänst`](docs/13_Utvecklarguide.md#lägga-till-ny-tjänst)
för detaljer.

---

## Arbeta säkert utan interna värden

Detta repository ska förbli **generiskt**. Följ dessa regler (se
[`docs/00_Projektprinciper.md`](docs/00_Projektprinciper.md) och
[`docs/05_Konfiguration.md`](docs/05_Konfiguration.md) för den fullständiga bakgrunden):

* Lägg aldrig in interna URL:er, servernamn eller connection strings – använd
  `https://example.local/...` eller `#`.
* Lägg aldrig in secrets, tokens, certifikat eller lösenord.
* Lägg aldrig in riktiga AD-grupper eller organisationsspecifik information.
* Lägg aldrig in produktionsdata eller personuppgifter – all mockdata ska vara tydligt fiktiv.
* Nya länkar ska alltid gå via `urlKey`/`documentationUrlKey`/`linkKey` + `systemUrls`,
  aldrig hårdkodas i en komponent eller mockfil.

---

## Vanliga fel och felsökning

| Symptom                                             | Trolig orsak / åtgärd                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `npm.cmd --prefix frontend start` startar men sidan är tom/vit | Kontrollera webbläsarkonsolen. Kör `npm.cmd --prefix frontend ci` igen om beroenden saknas. |
| En länk (t.ex. systemlänk) leder till `#`              | Nyckeln (`urlKey`) saknas i `frontend/public/assets/config/runtime-config.json`s `systemUrls`. Detta är en avsiktlig, säker fallback – kontrollera webbläsarkonsolen för en varning med vilken nyckel som saknas. |
| Ändring i en `.mock.json`-fil syns inte                | Kontrollera att JSON:en är giltig (t.ex. inga saknade kommatecken). Ladda om sidan.       |
| Porten `4200` är upptagen                              | Stoppa tidigare process med `Ctrl+C`, eller kör `npm.cmd --prefix frontend start -- --port 4300` från repositoryts rot. |
| TypeScript-fel om en modell saknar ett fält            | Kontrollera att mockdata följer motsvarande interface i `frontend/src/app/models/`.        |
| Fel Node-version                                       | Använd en aktuell LTS-version av Node.js.                                                  |

---

## Rekommenderade extensions

Se [`docs/14_Rekommenderade_extensions.md`](docs/14_Rekommenderade_extensions.md) för
en fullständig, motiverad lista. Öppnas repot i VS Code föreslås dessa automatiskt via
[`.vscode/extensions.json`](.vscode/extensions.json).

---

## Viktigt om säkerhet och generiskt innehåll

Detta repository är avsett att vara **generiskt** och innehåller inte:

* interna URL:er, servernamn eller connection strings
* secrets, tokens, certifikat eller lösenord
* riktiga AD-grupper eller organisationsspecifik information
* produktionsdata eller personuppgifter

All data i mockupen (tjänster, system, datamängder, kontaktvägar med mera) är fiktiv exempeldata.
Systemlänkar pekar mot exempel-URL:er (`https://example.local/...`) eller platshållare (`#`),
mappade via `systemUrls` i `runtime-config.json` – se
[Variabelstyrda URL:er och systemlänkar](#variabelstyrda-urler-och-systemlänkar).

Se [`docs/00_Projektprinciper.md`](docs/00_Projektprinciper.md) och
[`docs/05_Konfiguration.md`](docs/05_Konfiguration.md) för fullständiga principer.
