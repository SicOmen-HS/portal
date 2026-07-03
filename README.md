# Data- och analysportalen – lokal mockup

Detta repository innehåller en lokal, körbar **mockup** av den framtida interna portalen för
**Data- och analysportalen**.

Mockupen är en visuell och funktionell prototyp som visar hur portalen kan struktureras, se ut och
kännas. Den är **inte** en färdig produktionslösning – det finns ingen backend, ingen databas och
inga riktiga integrationer. All data är fiktiv mockdata.

Fullständig projektdokumentation (vision, verksamhet, informationsmodell, arkitektur,
konfigurationsprinciper med mera) finns i [`docs/`](docs/), se särskilt [`docs/README.md`](docs/README.md).

---

## Snabbstart

Krav: [Node.js](https://nodejs.org/) (LTS) och npm.

```bash
cd frontend
npm install
npm start
```

Öppna sedan i webbläsaren:

```text
http://localhost:4200
```

Ingen ytterligare konfiguration, databas eller nätverksåtkomst krävs. Mockupen körs helt lokalt med
fiktiv exempeldata.

---

## Vad ingår i mockupen

* **Startsida** – sök, genvägar, prioriterade tjänster, beställningar och status i korthet.
* **Tjänster** – tjänstekatalog med sök/filter och detaljvy för varje tjänst.
* **System & länkar** – exempel på system (Qlik Sense, Grafana, OpenMetadata, Generativ AI
  Chattportal, UiPath, Nintex m.fl.) med platshållarlänkar.
* **Data & katalog** – exempel på datamängder, Information Marts och BI-tillämpningar.
* **Guider & dokumentation** – guider kopplade till tjänster och system.
* **Beställ & få tillgång** – beställningstyper, inklusive exempel med flera steg och beroenden.
* **Status & drift** – samlad status, planerat underhåll och historik.
* **Kontakt & support** – kontaktvägar och vanliga frågor.
* **Om portalen** – syfte, mockupstatus och koppling till projektdokumentationen.

Se [`frontend/README.md`](frontend/README.md) för tekniska detaljer om Angular-applikationen.

---

## Repositorystruktur

```text
/
├── docs/            Projektets styrande dokumentation
├── config/examples/ Exempel på framtida konfiguration (backend, runtime)
├── frontend/         Angular-applikationen (mockupen)
└── images/           Referensbilder, t.ex. den ursprungliga designskissen
```

---

## Viktigt om säkerhet och generiskt innehåll

Detta repository är avsett att vara **generiskt** och innehåller inte:

* interna URL:er, servernamn eller connection strings
* secrets, tokens, certifikat eller lösenord
* riktiga AD-grupper eller organisationsspecifik information
* produktionsdata eller personuppgifter

All data i mockupen (tjänster, system, datamängder, kontaktvägar med mera) är fiktiv exempeldata.
Systemlänkar pekar mot exempel-URL:er (`https://example.local/...`) eller platshållare (`#`).

Se [`docs/00_Projektprinciper.md`](docs/00_Projektprinciper.md) och
[`docs/05_Konfiguration.md`](docs/05_Konfiguration.md) för fullständiga principer.
