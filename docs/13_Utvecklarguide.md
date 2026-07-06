# 13_Utvecklarguide.md

# Utvecklarguide

## Dokumentinformation

| Egenskap | Värde                                                                             |
| -------- | ---------------------------------------------------------------------------------- |
| Dokument | 13_Utvecklarguide.md                                                              |
| Typ      | Praktisk utvecklarguide                                                          |
| Status   | Utkast                                                                            |
| Ägare    | Data- och analysportalen                                                         |
| Syfte    | Hjälpa en ny utvecklare komma igång med koden utan muntlig överlämning |

---

## Syfte

Detta dokument är den praktiska motsvarigheten till projektets principdokument. Där
`00`–`12` beskriver *varför* portalen är byggd som den är, beskriver detta dokument *hur*
den faktiska koden hänger ihop, och hur man konkret lägger till en ny sida, tjänst,
systemlänk eller komponent.

Dokumentet förutsätter att du har läst:

* `00_Projektprinciper.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`
* `06_Utvecklingsprinciper.md`
* `12_Designsystem_och_UI.md`

Om något i koden avviker från dessa dokument är koden fel, inte dokumentationen –
avvikelser ska antingen rättas eller motiveras med en ADR (`11_ADR_mall.md`).

---

## Teknisk översikt

Detta repository innehåller för närvarande **bara frontend** – en Angular-mockup utan
backend, databas eller riktiga integrationer (se `04_Systemarkitektur.md` för den
fullständiga målbilden med .NET-backend och PostgreSQL).

```text
Webbläsare
   |
   v
Angular frontend (frontend/)
   |
   v
Lokal mockdata (frontend/public/assets/mock/*.json)
   +
Lokal runtime-konfiguration (frontend/public/assets/config/runtime-config.json)
```

Frontend är byggd med:

* Angular (standalone components, signals, ny kontrollflödessyntax `@if`/`@for`)
* TypeScript
* Bootstrap 5 + Bootstrap Icons (layout- och komponentstöd, se `12_Designsystem_och_UI.md`)
* SCSS med projektets egna design tokens
* RxJS (för dataflöden i services) tillsammans med Angular signals (för state i komponenter)

Det finns ingen backend i denna iteration. Services i `frontend/src/app/services/` spelar
den roll som annars hade tillhört ett API-anrop – se avsnittet
[Mockdata](#mockdata) nedan för hur det är tänkt att bytas ut senare.

---

## Projektstruktur

```text
/
├── docs/                         Styrande dokumentation (detta dokument ingår)
├── config/examples/              Exempel på framtida backend-/miljökonfiguration
├── frontend/                     Angular-applikationen (mockupen)
│   ├── public/assets/
│   │   ├── mock/                 Fiktiv innehållsdata (se mock/README.md)
│   │   └── config/               Runtime-konfiguration (se config/README.md)
│   └── src/app/
│       ├── core/                 Konfiguration, länkuppslag, generisk mockdataåtkomst
│       ├── shared/                Återanvändbara komponenter (kort, badges, sökruta …)
│       ├── layout/                Applikationsskal: sidomeny, topbar, sidfot
│       ├── features/              En katalog per sida/informationsområde
│       ├── models/                 TypeScript-modeller som speglar informationsmodellen
│       └── services/                Domänspecifika mockdata-services
└── images/                        Referensbilder (t.ex. ursprunglig designskiss)
```

---

## Frontendstruktur

### `core/`

Applikationsgemensam infrastruktur som bara ska finnas en gång:

* `core/config/runtime-config.model.ts` – TypeScript-typ för runtime-konfigurationen.
* `core/config/runtime-config.service.ts` – laddar `runtime-config.json` vid uppstart
  och exponerar den som en Angular-signal. Detta är projektets motsvarighet till den
  "AppConfigService" som ofta nämns i liknande projekt – namnet skiljer sig, rollen är
  densamma.
* `core/links/system-url.service.ts` – slår upp `urlKey`/`documentationUrlKey`/`linkKey`
  mot `runtime-config.json`s `systemUrls`-karta. Se
  [Variabelstyrda URL:er och urlKey](#variabelstyrda-urler-och-urlkey).
* `core/services/mock-data.service.ts` – generisk hämtning av JSON-filer under
  `public/assets/mock/`. Domänspecifika services i `app/services/` bygger vidare på den
  här klassen.

### `shared/`

Återanvändbara, generiska UI-komponenter utan egen affärslogik: `ServiceCard`,
`SystemCard`, `GuideCard`, `OrderCard`, `DatasetCard`, `ContactCard`, `LifecycleBadge`,
`StatusBadge`, `SearchBox`, `TypedResultCard`, `PageHeader`, `EmptyState`. Se
[Återanvändbara komponenter](#lägga-till-ny-komponent) för principerna bakom dessa.

`SearchBox` exponerar även fokusstatus för typade, tangentbordsnåbara sökförslag.
På startsidan hanterar förslagslistan dessutom upp-/nerpil och behåller vanliga
knappkontroller för Tab, Shift+Tab och Enter.
`TypedResultCard` används som en kompakt valbar resultatrad; den valda raden styr
previewpanelen på den samlade söksidan utan att användaren tappar listkontexten.

### `layout/`

Applikationsskalet: `ShellComponent` (top-level layout), `SidenavComponent`
(huvudnavigation), `TopbarComponent` (mobil hamburgermeny + global sökruta),
`FooterComponent`.

Skalet är route-medvetet på presentationsnivå: startsidan använder ett expanderbart
ikonrail och döljer toppsöket, medan arbetsvyer visar full sidomeny och toppsök. Den
centrala sökningen är därmed startsidans enda primära sökingång utan att routing eller
söktjänst dupliceras.
Den minimerade navigationen visar etiketter vid både hover och tangentbordsfokus. Variant B
begränsar breda skärmar med separata maxbredder för hero, uppgifter och resursytor så
att layouten växer på desktop utan att bli fullbredd på ultrawide.

### `features/`

En katalog per sida, namngiven efter portalens informationsområden – inte efter teknik
eller organisation (se `00_Projektprinciper.md`, princip 6: domändriven utveckling):

```text
features/
├── home/                          Startsida
├── search-results/                Samlad typad sökning och tomt sökresultat
├── needs-catalog/                 Behovsstyrd katalogresa
├── data-detail/                   Progressiv datamängdsdetalj
├── services/
│   ├── service-catalog/           Tjänster (lista, sök, filter)
│   └── service-detail/            Tjänstedetalj
├── systems/                       System & länkar
├── data-catalog/                  Data & katalog
├── guides/                        Guider & dokumentation
├── orders/
│   ├── order-catalog/             Beställ & få tillgång (lista)
│   └── order-detail/              Beställningsdetalj (steg, beroenden)
├── status/                        Status & drift
├── support/                       Kontakt & support
└── about/                         Om portalen
```

### `models/` och `services/`

Se [Informationsmodell i koden](#informationsmodell-i-koden) respektive
[Mockdata](#mockdata) nedan.

---

## Routing

Routing definieras i `frontend/src/app/app.routes.ts`. Varje sida är en fristående,
lazy-loadad standalone-komponent:

```ts
{
  path: 'tjanster',
  loadComponent: () =>
    import('./features/services/service-catalog/service-catalog.component').then(
      (m) => m.ServiceCatalogComponent
    ),
  title: 'Tjänster – Data- och analysportalen',
},
```

Fördelar med detta mönster:

* En ny sida kan läggas till utan att någon `NgModule` eller delad routingfil behöver
  ändras mer än denna lista.
* Sidor laddas bara ner till webbläsaren när användaren faktiskt navigerar dit
  (mindre initial bundle).
* `title` sätts automatiskt av Angulars router – ingen extra kod krävs.

URL-strukturen är på svenska (`/tjanster`, `/system`, `/data`, `/guider`, `/bestall`,
`/status`, `/kontakt`, `/om-portalen`) eftersom målgruppen och UI-språket är svenskt.

### Canonical route, alias och redirect

En tjänst med ett fördjupat, dedikerat sidflöde (t.ex. Rapporter och dashboards) har
sin canonical route under `/tjanster/<service-slug>`, med en egen underroute per
åtgärd som har ett eget flöde (`/tjanster/<service-slug>/<action-slug>`). Äldre eller
alternativa vägar (t.ex. en behovsingång under `/behov/...` eller en tidigare
id-baserad slug) ska registreras som `redirectTo` till canonical routen istället för
att rendera en egen kopia av sidan – se `ADR-0002` (`docs/adr/`). `ServiceOffering`s
valfria `detailRoute`-fält pekar alltid på canonical routen och används av
`ServiceCardComponent` och `SearchService` istället för den generiska `/tjanster/:id`.

---

## Mockdata

All data portalen visar (tjänster, system, guider, beställningar, kontaktvägar,
datamängder, status …) kommer från JSON-filer under
`frontend/public/assets/mock/`. Se `frontend/public/assets/mock/README.md` för en
fullständig filöversikt.

### Hur en mockfil laddas

1. En domänspecifik service i `frontend/src/app/services/`, t.ex.
   `service-offering.service.ts`, injicerar `MockDataService`
   (`core/services/mock-data.service.ts`).
2. `MockDataService.load<T>(fileName)` gör ett `HttpClient.get`-anrop mot
   `assets/mock/<fileName>` och returnerar en `Observable<T>`.
3. Domänservicen cachar resultatet med `shareReplay(1)` så att flera komponenter kan
   prenumerera utan att filen hämtas flera gånger, och exponerar uppslagsmetoder som
   `getAll()`, `getById(id)`, `getByIds(ids)`.

```ts
// frontend/src/app/services/service-offering.service.ts (utdrag)
private readonly services$: Observable<ServiceOffering[]> = this.mockData
  .load<ServiceOffering[]>('services.mock.json')
  .pipe(shareReplay(1));

getById(id: string): Observable<ServiceOffering | undefined> {
  return this.services$.pipe(map((items) => items.find((item) => item.id === id)));
}
```

### Varför JSON-filer och inte ett riktigt API?

Mockupen ska kunna köras helt lokalt utan tillgång till företagets interna miljö
(`08_Lokal_utvecklingsmiljö.md`). Genom att kapsla datahämtningen i en tunn
service-abstraktion (steg 1–3 ovan) kan filerna senare bytas ut mot riktiga
HTTP-anrop mot ett framtida .NET-API utan att någon komponent behöver ändras – bara
domänservicens `load(...)`-anrop.

### Komponenter i mallarna

Komponenter ska aldrig hämta mockdata direkt. De ska injicera en domänservice och
använda Angular signals (`toSignal(...)`) eller async-pipe för att rendera resultatet.

---

## Runtime-konfiguration

Portalens publika, säkra frontend-konfiguration ligger i
`frontend/public/assets/config/runtime-config.json` och läses vid uppstart av
`RuntimeConfigService` (`core/config/runtime-config.service.ts`) via en Angular
`provideAppInitializer` i `app.config.ts` – innan appen renderas.

```ts
// frontend/src/app/core/config/runtime-config.model.ts
export interface RuntimeConfig {
  apiBaseUrl: string;
  applicationName: string;
  environmentLabel: string;
  features: { showStatusPanel: boolean; /* … */ };
  systemUrls: Record<string, string>;
}
```

Om filen saknas eller är trasig faller `RuntimeConfigService` tillbaka på
`DEFAULT_RUNTIME_CONFIG` (samma fil) istället för att krascha appen. Det gör att
portalen alltid startar, även i ett felaktigt konfigurerat läge – med tomma
`systemUrls` och mockläge som säker standard.

Se `frontend/public/assets/config/README.md` för fullständig beskrivning av vad
filen får och inte får innehålla.

---

## Variabelstyrda URL:er och urlKey

Detta är den viktigaste principen att förstå innan du lägger till en ny länk någonstans
i portalen.

**Ingen komponent och ingen mockfil innehåller någonsin en riktig URL.** Istället
beskriver innehållet en nyckel, och runtime-konfigurationen mappar nyckeln till en
faktisk adress för den aktuella miljön.

```json
// frontend/public/assets/mock/system-links.mock.json (utdrag)
{
  "id": "link-openmetadata-user",
  "name": "Öppna OpenMetadata",
  "linkType": "user",
  "urlKey": "OPENMETADATA_URL",
  "opensInNewWindow": true,
  "relatedSystemId": "system-openmetadata"
}
```

```json
// frontend/public/assets/config/runtime-config.json (utdrag)
{
  "systemUrls": {
    "OPENMETADATA_URL": "https://example.local/openmetadata"
  }
}
```

Komponenter slår upp den faktiska URL:en via `SystemUrlService`
(`core/links/system-url.service.ts`) – aldrig genom att läsa fältet direkt:

```ts
// t.ex. i system-card.component.ts
protected readonly resolvedUrl = computed(() =>
  this.systemUrlService.getUrl(this.primaryLink()?.urlKey)
);
```

`SystemUrlService` har två metoder:

* `getUrl(urlKey)` – returnerar den mappade URL:en, eller `"#"` om nyckeln saknas.
  Detta kastar aldrig ett fel; en saknad länk är ett säkert, degraderat läge.
* `isConfigured(urlKey)` – `true` om nyckeln faktiskt finns i `systemUrls`. Används av
  komponenter för att visa länken som text istället för en klickbar (men trasig) länk
  när den inte är konfigurerad – se t.ex. `support.component.html`, där
  `TICKETING_SYSTEM_URL` avsiktligt saknas i `runtime-config.json` för att visa detta
  beteende live i mockupen.

### Samma mönster används för fler fält än systemlänkar

| Fält                          | Modell           | Betydelse                                             |
| ------------------------------ | ---------------- | ------------------------------------------------------ |
| `urlKey`                      | `SystemLink`     | Länk till ett system (t.ex. Qlik Sense, OpenMetadata) |
| `documentationUrlKey`         | `Guide`          | Länk till guidens fullständiga dokumentation           |
| `documentationUrlKey`         | `OrderType`      | Länk till dokumentation för en beställningstyp        |
| `documentationUrlKey`         | `InformationMart`| Länk till dokumentation för en Information Mart       |
| `documentationUrlKey`         | `TechnicalComponent` | Länk till teknisk dokumentation (om satt)         |
| `linkKey`                     | `OrderFlow`      | Länk till beställningsformulär                        |

Alla dessa löses upp med samma `SystemUrlService.getUrl(...)` mot samma
`systemUrls`-karta.

### Varför detta löser miljöbytesproblemet

Att flytta portalen från lokal miljö till test eller framtida intern drift innebär
**bara att byta värdena i `runtime-config.json`**. Ingen mockfil, ingen komponent och
ingen routingkonfiguration behöver ändras. Det är den konkreta implementationen av
principen "konfiguration före kod" (`00_Projektprinciper.md`, princip 2).

---

## Informationsmodell i koden

TypeScript-modellerna i `frontend/src/app/models/` speglar begreppen i
`03_Informationsmodell.md` rakt av – samma namn, samma relationer. Skapa aldrig en ny
modell utan att först kontrollera om ett befintligt objekt redan täcker behovet
(`07_AI_Instruktioner.md`).

| Modell (kod)          | Fil                                | Används för                                                  |
| ---------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `ServiceOffering`      | `service-offering.model.ts`         | Tjänstekort och tjänstedetalj (`/tjanster`)                    |
| `PlatformCapability`   | `platform-capability.model.ts`      | Plattformsnamn i tjänstedetaljens sidopanel                   |
| `SystemEntity`         | `system.model.ts`                   | System- och länksidan (`/system`)                              |
| `SystemLink`           | `system-link.model.ts`              | Enskilda länkar kopplade till ett system                       |
| `TechnicalComponent`   | `technical-component.model.ts`      | Teknisk metadata i tjänstedetaljens sidopanel                  |
| `Dataset`              | `dataset.model.ts`                  | Datamängdskort på Data & katalog (`/data`)                     |
| `DataService`          | `data-service.model.ts`             | Datatjänster (används internt av `DataCatalogService`)         |
| `InformationMart`      | `information-mart.model.ts`         | Information Mart-kort på Data & katalog                        |
| `BusinessApplication`  | `business-application.model.ts`     | BI-tillämpningskort på Data & katalog                          |
| `Guide`                | `guide.model.ts`                    | Guidekort (`/guider`) och relaterade guider i tjänstedetalj    |
| `OrderFlow`            | `order-flow.model.ts`               | Hanteringsinformation på beställningsdetalj                     |
| `OrderType`            | `order-type.model.ts`               | Beställningskort och -detalj (`/bestall`)                       |
| `OrderStep`            | `order-step.model.ts`               | Stegvisning på beställningsdetalj                                |
| `OrderDependency`      | `order-dependency.model.ts`         | Beroendevisning på beställningsdetalj                            |
| `AccessGroup`          | `access-group.model.ts`             | Kopplad till Information Mart (för närvarande ej egen vy)      |
| `ContactPoint`         | `contact-point.model.ts`            | Kontaktkort (`/kontakt`) och kontaktväg i tjänstedetalj        |
| `StatusItem`           | `status-item.model.ts`              | Status & drift (`/status`)                                     |
| `MonitoringSubscription` | `monitoring-subscription.model.ts` | Larm kopplade till Information Mart (för närvarande ej egen vy) |
| `LifecycleStatus`      | `lifecycle-status.model.ts`         | `LifecycleBadge` – används av i stort sett alla korttyper      |
| `Visibility`           | `visibility.model.ts`               | Synlighetsnivå per objekt (visas i tjänstedetaljens metadata)  |
| `Team`                 | `team.model.ts`                     | Ansvarigt team (metadata, ingen egen vy)                       |

`models/index.ts` är en barrel-export – importera alltid modeller via
`'../../models'` (relativ till din fil) istället för att peka på enskilda filer.

---

## Styling och designsystem

Designtoken-principerna beskrivs i `12_Designsystem_och_UI.md`. I kod:

* `frontend/src/styles/_tokens.scss` – CSS-variabler för färg, typografi och spacing,
  direkt hämtade från designdokumentet (t.ex. `--color-brand-red: #D70000`).
* `frontend/src/styles/_base.scss` – globala, återanvändbara klasser
  (`.app-card`, `.app-card-icon`, `.section-title` med mera) som delas av flera
  korttyper. Nya korttyper ska återanvända dessa klasser istället för att skapa egna.
* `frontend/src/styles.scss` – importerar tokens, Bootstrap och bas-stilarna i rätt
  ordning, samt Bootstrap Icons och Open Sans (självhostat via `@fontsource/open-sans`,
  se avsnittet om externa beroenden nedan).

Använd alltid CSS-variablerna (`var(--color-brand-red)` osv.) istället för
hårdkodade hex-värden i komponent-scss.

---

## Lägga till ny sida

1. Skapa en katalog under `frontend/src/app/features/<sidnamn>/` med en standalone
   component (`.ts`, `.html`, `.scss`).
2. Bygg sidan av befintliga `shared`-komponenter där det går
   (`PageHeader`, `SearchBox`, kort-komponenter, `EmptyState`).
3. Lägg till en route i `frontend/src/app/app.routes.ts` med `loadComponent` och en
   svensk `title`.
4. Lägg till en post i navigationen: `frontend/src/app/layout/nav-items.ts`.
5. Om sidan behöver ny data: se [Lägga till ny tjänst](#lägga-till-ny-tjänst) och
   [Lägga till ny systemlänk](#lägga-till-ny-systemlänk) för mönstret.

---

## Lägga till ny tjänst

1. Lägg till ett nytt objekt i `frontend/public/assets/mock/services.mock.json` som
   följer `ServiceOffering`-interfacet (`frontend/src/app/models/service-offering.model.ts`).
2. Sätt `id` enligt namnkonventionen i `03_Informationsmodell.md`, t.ex.
   `service-order-<kort-namn>`.
3. Referera befintliga `platformCapabilityIds`, `relatedSystemIds`, `guideIds` och
   `orderTypeIds` istället för att duplicera information.
4. Ingen kodändring krävs – `ServiceOfferingService` läser filen dynamiskt och
   `/tjanster` samt `/tjanster/:id` visar tjänsten automatiskt.
5. Sätt `"featured": true` om tjänsten även ska visas som genväg på startsidan.

---

## Lägga till ny systemlänk

1. Lägg till en ny post i `frontend/public/assets/mock/system-links.mock.json` med ett
   `urlKey` (använd `VERSALER_MED_UNDERSTRECK`, sluta gärna på `_URL`).
2. Lägg till motsvarande nyckel i **både**:
   * `frontend/public/assets/config/runtime-config.json` (används av mockupen när den
     körs) – med ett `https://example.local/...`-värde eller `#`.
   * `config/examples/runtime-config.example.json` (den versionerade mallen) – med ett
     `<VERSALER_MED_UNDERSTRECK>`-platshållarvärde.
3. Använd aldrig en riktig intern URL i något av stegen ovan.
4. Om nyckeln glöms bort i `runtime-config.json` kraschar ingenting – `SystemUrlService`
   visar länken som "inte konfigurerad" och loggar en varning i webbläsarkonsolen.

---

## Lägga till ny beställningstyp

1. Lägg till en ny post i `frontend/public/assets/mock/order-types.mock.json` som
   följer `OrderType`-interfacet, inklusive `steps` (se `OrderStep`) och eventuella
   `dependencies` (se `OrderDependency`).
2. Peka `orderFlowId` mot en befintlig eller ny post i
   `frontend/public/assets/mock/order-flows.mock.json`.
3. Om beställningstypen har egen dokumentation: sätt `documentationUrlKey` och lägg
   till motsvarande nyckel i runtime-config enligt föregående avsnitt.
4. `/bestall` och `/bestall/:id` visar den nya beställningstypen automatiskt.

---

## Lägga till ny komponent

Följ mönstret för befintliga `shared`-komponenter:

* En component-fil, en template-fil, en scss-fil (inte inline template/styles).
* Ett tydligt, smalt ansvar – en `ServiceCardComponent` vet hur man visar en
  `ServiceOffering`, inte hur man hämtar den.
* Data kommer in via `input()` (Angular signal inputs), aldrig genom att komponenten
  själv injicerar en domänservice för att hämta sina egna data (undantag: uppslag av
  `urlKey` via `SystemUrlService`, eftersom det är en ren, side-effect-fri
  presentationsdetalj).
* Återanvänd `.app-card`-klasserna i `_base.scss` för nya korttyper istället för att
  skriva om kortlayouten.

---

## Test och verifiering

Se `09_Teststrategi.md` för den fullständiga strategin. I kodbasen finns idag:

* `frontend/src/app/app.spec.ts` – att appen kan skapas.
* `frontend/src/app/core/links/system-url.service.spec.ts` – att `SystemUrlService`
  slår upp konfigurerade nycklar korrekt och faller tillbaka säkert på `"#"` för
  saknade eller ospecificerade nycklar, utan att kasta fel.

Kör testerna med:

```bash
cd frontend
npm test
```

Innan större ändringar, verifiera även manuellt att applikationen bygger och startar:

```bash
npm run build
npm start
```

---

## Säkerhetsregler

Dessa regler gäller all kod, mockdata och konfiguration i detta repository (se
`00_Projektprinciper.md` och `05_Konfiguration.md` för den fullständiga bakgrunden):

* Ingen riktig intern URL, oavsett om det är i en komponent, en mockfil eller
  `runtime-config.json`. Använd `https://example.local/...` eller `#`.
* Inga secrets, tokens, lösenord, connection strings eller certifikat – varken riktiga
  eller påhittade som ser riktiga ut.
* Inga riktiga AD-grupper, servernamn, miljönamn eller organisationsspecifika värden.
* Ingen produktionsdata eller personuppgifter i mockdata – all data ska vara tydligt
  fiktiv (se `frontend/public/assets/mock/README.md`).
* Nya konfigurationsvärden läggs alltid till i **både** `runtime-config.json` (för att
  mockupen ska fungera lokalt) och `config/examples/runtime-config.example.json` (som
  dokumenterad mall), aldrig bara i den ena.
* Frontend ansluter aldrig direkt mot ett internt system eller en databas – det finns
  ingen sådan kod i detta repository, och det ska förbli så tills en backend införs
  enligt `04_Systemarkitektur.md`.

---

## Checklista innan commit

```text
- [ ] Ändringen följer projektets dokumentation i docs/.
- [ ] Inga riktiga interna URL:er, secrets, certifikat eller personuppgifter har lagts till.
- [ ] Nya systemlänkar/dokumentationslänkar använder urlKey/documentationUrlKey/linkKey,
      inte en direkt URL.
- [ ] Nya konfigurationsnycklar finns i BÅDE runtime-config.json OCH
      runtime-config.example.json.
- [ ] Ny mockdata är fiktiv och följer ett befintligt informationsobjekt.
- [ ] Nya komponenter återanvänder shared/-komponenter och _base.scss-klasser där möjligt.
- [ ] `npm run build` och `npm test` körs utan fel.
- [ ] Dokumentation (docs/) är uppdaterad om ändringen påverkar struktur, modell eller
      konfigurationsprinciper.
```
