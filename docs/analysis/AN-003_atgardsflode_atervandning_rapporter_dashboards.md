# AN-003 – Åtgärdsflöden och återanvändning för Rapporter och dashboards

Granskad: 2026-07-06
Work item: `AN-003` (inte ännu registrerat i Worksmith-kön, se "Process-avvikelse" nedan)
Repositoryversion: den lokala arbetskopian i `C:\dev\Portal` den 2026-07-06, efter AB-010
("Ändra innehåll eller utseende" med BI-objektval) och den senaste, ej ännu registrerade
navigations-/startsidesändringen.

Detta är en analys. Den ändrar ingen kod, ingen route, ingen mockdata och ingen
informationsmodell. Den producerar fynd och rekommendationer; senare implementation ska
ske i separata, godkända AB-items.

## Process-avvikelse

Uppdraget angav `<AN-ID>` utan ett faktiskt tilldelat nummer, och `docs/WORK_QUEUE.md`
har inga poster i `ready`/`in_progress` som matchar detta scope. Jag har genomfört
analysen ändå (den är läsande och ändrar ingen källkod), men rekommenderar att
projektägaren registrerar den som `AN-003` i efterhand så att den är spårbar enligt
`docs/project/PROJECT_WORKFLOW.md`.

## 1. Sammanfattning och rekommendation

Tjänstesidan "Rapporter och dashboards" har i dag en enda, fullt byggd åtgärd ("Ändra
innehåll eller utseende") och fem oimplementerade platshållare. De byggstenar som redan
finns (kollapsande formulärsteg, BI-objektval, ansvarig/godkännande, sammanfattning av
val, route-/action-mönstret) är genomgående generiska och direkt återanvändbara – inget
nytt gemensamt ramverk behöver byggas för att gå vidare.

Den viktigaste, konkreta upptäckten i denna analys är att **två av de fem återstående
åtgärderna redan har en existerande, generisk motsvarighet i portalens
beställningskatalog** som inte är kopplad till Rapporter och dashboards än:

- **"Skapa ny rapport eller dashboard"** överlappar helt med den redan existerande
  `OrderType` **`order-type-new-bi-app`** ("Ny BI-tillämpning", med fullständiga steg
  och beroenden), nåbar på `/bestall/order-type-new-bi-app` och redan länkad från
  `service-reports-dashboards.relatedServiceIds` till den äldre tjänsten
  `service-order-dashboard` ("Beställ dashboard").
- **"Ändra behörighet"** överlappar med `order-type-access-group`
  ("Behörighet/accessgrupp"), vars egen beskrivning redan är avsiktligt generisk: "ny
  åtkomst eller ändring av behörighet till en **datamängd, dashboard eller system**" –
  den är i dag bara kopplad till `service-request-dataset-access`, inte till Rapporter
  och dashboards.

**Rekommendation i korthet:**

1. Bygg **"Lägg till eller ändra data"** som nästa riktiga guidade åtgärd (avsnitt 6) –
   den är genuint unik för rapportdomänen och kräver minst ny kod.
2. Länka **"Skapa ny rapport eller dashboard"** och **"Ändra behörighet"** till
   respektive befintliga `OrderType`/`/bestall/…`-flöden istället för att bygga nya,
   parallella formulär (avsnitt 4–5).
3. Bygg **inte** en ny gemensam ordersteg-modell eller -komponent ännu (avsnitt 3) –
   de befintliga komponenterna räcker, och en generalisering bör vänta tills ett andra
   verkligt flöde bekräftar det gemensamma mönstret (samma princip som redan valdes i
   DEC-004).
4. **"Rapportera problem" ska inte byggas rapportspecifikt nu.** Den bekräftar den
   hypotes uppdraget angav – se avsnitt 7 – och bör dokumenteras permanent i
   `docs/project/DECISIONS.md` som ett nytt beslut (DEC-005), inte bara i detta AN.

## 2. Nuläge

### 2.1 Sidan och dess state

`frontend/src/app/features/needs-catalog/needs-catalog.component.ts` renderar
`/tjanster/rapporter-och-dashboards` (och åtgärdsrouten
`/tjanster/rapporter-och-dashboards/andra-innehall`, ADR-0002). Sex åtgärder finns som
en lokal, hårdkodad `ServiceAction[]`-array (inte ett modellerat informationsobjekt –
ett medvetet val enligt DEC-004, som uttryckligen skjuter upp en egen `ServiceAction`
tills flera tjänstesidor visar samma behov):

| id | Titel | Status i koden |
| --- | --- | --- |
| `create` | Skapa ny rapport eller dashboard | Platshållare (statisk CTA-knapp, ingen logik) |
| `change` | Ändra innehåll eller utseende | **Fullt byggd**: egen route, 6-stegs guidat formulär |
| `data` | Lägg till eller ändra data | Platshållare |
| `access` | Ändra behörighet | Platshållare |
| `owner` | Ändra ägare eller kontaktväg | Platshållare |
| `problem` | Rapportera problem | Platshållare |

En platshållaråtgärd renderar bara: `<div class="simple-next">…<button>{{action.cta}}</button></div>`
utan formulär, steg eller validering (`needs-catalog.component.html`, raden med
`@else { <div class="simple-next">… }`). Endast `change` har en riktig, adresserbar
route (ADR-0002 §7: en åtgärd får en egen route när den har ett eget flöde; övriga är
fortfarande bara komponent-state tills de byggs ut).

### 2.2 Redan byggda, generiska byggstenar

| Komponent/mönster | Fil | Rapportspecifik? |
| --- | --- | --- |
| `OrderFormStepComponent` (kollapsande steg: `active`/`complete`/`locked`/`summary`) | `shared/components/order-form-step/` | Nej – helt generisk |
| `ProcessStepperComponent` (klickbar, tillgänglig processöversikt) | `shared/components/process-stepper/` | Nej – tar en godtycklig `ProcessStepView[]` |
| `BiObjectSelectorComponent` (system → container → asset, typdrivna etiketter) | `shared/components/bi-object-selector/` | Nej – källsystemsoberoende per ADR-0003 |
| `reportingApprovalMessage`, `responsibleLabel`, `approvalPolicy` | `models/reporting-asset.model.ts` | Nej – ren funktion, asset-driven |
| `ReviewSummaryComponent` (`ReviewEntry[]` → sammanfattning) | `shared/components/review-summary/` | Nej – helt generisk |
| `ObjectSelectorComponent` (kryssrutor mot en `SelectableObject[]`) | `shared/components/object-selector/` | Nej – används i dag mot en hårdkodad `reportScopes`-lista |
| Steg-signalmönster (`activeFormStep`/`completedFormStep`/`openFormStep`/`continueForm`) | `needs-catalog.component.ts` | **Ja, i praktiken** – skrivet en gång, direkt i sidkomponenten, inte utbrutet |
| Valideringsmönster (`Validators.required` + `touched` + fokus-på-fel + `.field-error`) | `needs-catalog.component.ts` | Nej i sig, men hand-upprepat per steg i `controlsByStep`-arrayen, inte en delad helper |
| Route-/action-mönster (egen route bara vid eget flöde) | ADR-0002, `app.routes.ts` | Nej – redan en uttalad, generell princip |

### 2.3 Redan existerande, generella beställningsobjekt som INTE är kopplade hit

`frontend/public/assets/mock/order-types.mock.json` och `services.mock.json`
innehåller redan två `OrderType`/`ServiceOffering`-par som konceptuellt matchar två av
de fem återstående åtgärderna, men som i dag lever helt separat från
`service-reports-dashboards`:

- **`order-type-new-bi-app`** ("Ny BI-tillämpning") – beskrivning: "Beställ en ny
  dashboard eller rapport. Kan kräva ny accessgrupp och koppling till en dataprodukt
  innan tillämpningen kan publiceras." Har fem riktiga `OrderStep`-poster och en
  `OrderDependency` mot accessgrupp/dataprodukt. `relatedServiceId` pekar på
  `service-order-dashboard` ("Beställ dashboard"), inte på `service-reports-dashboards`.
  Nåbar redan i dag via `/bestall/order-type-new-bi-app` (`OrderDetailComponent`).
  `service-reports-dashboards.relatedServiceIds` innehåller redan
  `"service-order-dashboard"` – alltså en enkelriktad, redan existerande relation, men
  ingen länk syns någonstans i `NeedsCatalogComponent`s UI.
- **`order-type-access-group`** ("Behörighet/accessgrupp") – beskrivning: "Beställ ny
  åtkomst eller ändring av behörighet till en datamängd, **dashboard** eller system."
  Redan avsiktligt bredare än ett enskilt tjänsteflöde. `relatedServiceId` pekar i dag
  på `service-request-dataset-access`, inte på Rapporter och dashboards.

`SupportComponent` (`/kontakt`) har redan en `ticketingSystemUrlKey = 'TICKETING_SYSTEM_URL'`
som **medvetet lämnas osatt** i `runtime-config.json` "för att visa hur `SystemUrlService`
degraderar säkert när en länk saknas" (kommentar i koden). Det är redan ett uttalat,
generellt "hela portalens ärende-/ticketingväg"-koncept – inget rapportspecifikt
motsvarande finns någonstans.

Ingen `problem`/`incident`/`ticket`-liknande `OrderType` finns i mockdata över huvud
taget – konceptet "rapportera ett fel" saknar helt en generisk modell i dag, inte bara
en rapportspecifik.

## 3. Behövs en gemensam komponent eller modell för ordersteg?

**Nej, inte ännu.** Skälen:

- Endast **ett** flöde (`change`) använder i dag steg-signalmönstret
  (`activeFormStep`/`completedFormStep`/`openFormStep`/`continueForm`). Att generalisera
  ett mönster utifrån ett enda konkret exempel gissar på formen istället för att
  bekräfta den – exakt den avvägning DEC-004 redan gjorde medvetet för `ServiceAction`
  ("bedöm en återanvändbar modell bara efter att mönstret används av fler
  tjänstesidor").
- De byggstenar mönstret består av (`OrderFormStepComponent`, `ReviewSummaryComponent`,
  `BiObjectSelectorComponent`, `ObjectSelectorComponent`) är redan generiska
  komponenter, inte kopplade till en specifik orderstegsmodell – de kan återanvändas
  rakt av i nästa guidade åtgärd utan någon ny abstraktion.
- Informationsmodellen har redan `OrderStep`/`OrderFlow`/`OrderDependency`
  (`docs/03_Informationsmodell.md`) som en generisk, dokumenterad beställningsmodell.
  Den är i dag oanvänd av Rapporter och dashboards-sidan, men är den naturliga
  målmodellen om/när `create`- och `access`-åtgärderna kopplas till de befintliga
  `OrderType`-flödena (avsnitt 4–5) istället för att uppfinna en ny, parallell modell.

**Rekommendation:** vänta med en delad "ordersteg-komponent/-modell" tills nästa
guidade åtgärd (avsnitt 6) är byggd. Om steg-signalmönstret då visar sig identiskt
kopieras, är det rätt tidpunkt att bryta ut det till en liten delad helper eller
directive – inte förr.

## 4. Åtgärder som bör vara unika rapport-/dashboardflöden

- **"Ändra innehåll eller utseende"** (redan byggd) – genuint specifik för ett BI-objekt
  (flikar/vyer/mått/layout inom en befintlig rapport/dashboard).
- **"Lägg till eller ändra data"** – rapportspecifik i meningen "koppla data till *just
  denna* rapport/dashboard", även om den lutar sig mot den redan existerande, generella
  Dataprodukt-/Dataset-kedjan (`docs/03_Informationsmodell.md`: Källsystem → Datamängd →
  Dataprodukt → Dashboard/Rapport). Se avsnitt 6 för varför den bör byggas näst.
- **"Ändra ägare eller kontaktväg"** – den enda återstående åtgärden **utan** en redan
  existerande generisk modell (ingen `OrderType` eller motsvarande hanterar
  "ägarbyte" i dag). Den är konceptuellt generell (vilken tjänst/system/BI-tillämpning
  som helst kan byta ansvarig), men saknar en färdig plats att koppla till – därför
  räknas den här som "byggs för rapportdomänen först", inte för att den är unikt
  rapportspecifik i sak, utan för att inget generellt alternativ finns att återanvända
  ännu (jämför avsnitt 8, öppen fråga).

## 5. Åtgärder som bör vara generella portalflöden

- **"Skapa ny rapport eller dashboard"** → bör länka till/återanvända
  `order-type-new-bi-app` (`/bestall/order-type-new-bi-app`) istället för ett nytt,
  parallellt formulär. Den beställningen är redan fullt modellerad (steg, beroenden,
  ägande team) och skulle annars byggas om från grunden på tjänstesidan – exakt den typ
  av dubblering AN-002 varnade för på routenivå, nu på beställningsnivå.
- **"Ändra behörighet"** → bör länka till/utöka `order-type-access-group`, vars egen
  beskrivning redan omfattar "dashboard". En tunn variant (BI-objektval ovanpå den
  redan existerande beställningen) kan behövas för att peka ut *vilken* rapport, men
  själva behörighetsflödet ska inte byggas som en ny, konkurrerande modell.
- **"Rapportera problem"** → generellt, portalövergripande flöde. Se avsnitt 7 för det
  fullständiga resonemanget och den föreslagna permanenta dokumentationen.

## 6. Vilken åtgärd bör byggas härnäst, och varför

**Rekommendation: "Lägg till eller ändra data".**

Skäl:

1. **Genuint unik** för rapportdomänen (avsnitt 4) – till skillnad från `create` och
   `access` dupliceras inget befintligt, färdigt beställningsflöde om den byggs nu.
2. **Minst ny kod av de återstående alternativen.** Den kan återanvända, oförändrat:
   `BiObjectSelectorComponent` (vilken rapport/dashboard gäller det – identiskt första
   steg som `change` redan har), `OrderFormStepComponent`, `ReviewSummaryComponent`, och
   samma `ObjectSelectorComponent`-mönster som redan används för `reportScopes` (fast
   mot en lista av datamängder/dataprodukter istället för rapportvyer).
3. Ger **den andra verkliga datapunkten** steg-signalmönstret behöver (avsnitt 3) innan
   en generalisering övervägs – exakt den tröskel DEC-004 redan satte för liknande
   generaliseringsbeslut.
4. Har redan en dokumenterad, konkret nyans att modellera
   (`action.note`-fältet i `needs-catalog.component.ts`: skilj "koppla befintlig
   data/dataprodukt" från "data saknas, kräver en separat beställning först") – ett
   naturligt, redan skrivet startvillkor för formulärets förgrening, utan att någon ny
   domänkunskap behöver uppfinnas.

`access` och `create` övervägdes men nedprioriterades: båda är i grunden ett
länknings-/innehållsbeslut (peka på en befintlig `OrderType` snarare än att bygga ett
nytt formulär), vilket är ett mindre, annorlunda arbete än att bygga nästa guidade
flöde – de passar bättre som egna, senare AB-items (avsnitt 8, punkt 3–4).

## 7. "Rapportera problem" – prövning av hypotesen

**Hypotesen bekräftas: "Rapportera problem" bör inte byggas rapportspecifikt nu.**

Bevis från koden och mockdatan, inte bara antagande:

- **Inget problem-/incident-/ärendekoncept finns i informationsmodellen eller
  mockdatan över huvud taget** – varken som `OrderType`, som eget objekt eller som
  fält på `ServiceOffering`. Att bygga det första exemplet av ett sådant flöde
  rapportspecifikt låser en form innan portalen vet hur den ska se ut generellt.
- **Portalen har redan ett uttalat, medvetet hål för exakt detta på rätt nivå**:
  `SupportComponent.ticketingSystemUrlKey = 'TICKETING_SYSTEM_URL'` finns redan, är
  medvetet osatt i `runtime-config.json`, och kommentaren i koden säger uttryckligen
  att den demonstrerar hur portalen ska bete sig **innan** ett riktigt ärendesystem
  kopplas in – dvs. samma generella flöde är redan tänkt att gälla "Kontakt & support"
  för hela portalen, inte per tjänst.
  - Detta är alltså inte en spekulativ, uppfunnen rekommendation i denna analys – det
    är en bekräftelse av ett beslut som redan är inbyggt i kodens struktur men aldrig
    skrivits ner som ett beslut någon kan hitta utan att läsa `support.component.ts`.
- **Risk om den byggs rapportspecifikt ändå**: när ett generellt ärendeflöde sedan
  byggs (naturligt, eftersom `TICKETING_SYSTEM_URL` redan finns som hook) måste
  rapportversionen antingen göras om eller leva kvar som en inkonsekvent
  specialvariant – samma "bygg om senare är dyrare än att vänta"-mönster AN-002 redan
  identifierade för BI-integrationen.

**Rekommenderad permanent dokumentation:** ett nytt beslut i `docs/project/DECISIONS.md`,
**DEC-005** (näst lediga numret efter DEC-004), ungefär:

> **DEC-005 – "Rapportera problem" är ett generellt, portalövergripande flöde, inte en
> per-tjänst-åtgärd.** Kontext: `SupportComponent` har redan en avsiktligt osatt
> `TICKETING_SYSTEM_URL`-hook; ingen problem-/ärendemodell finns i informationsmodellen.
> Beslut: bygg "Rapportera problem" (för Rapporter och dashboards och för framtida
> tjänster) som ett gemensamt flöde kopplat till Kontakt & support-ytan/en framtida
> ärendemodell, inte som ett rapportspecifikt formulär i `NeedsCatalogComponent`.
> Relaterat: `docs/analysis/AN-003_...md`, `frontend/src/app/features/support/support.component.ts`.

Detta AN skapar inte den posten – det är en rekommendation för projektägaren att
godkänna och för ett kommande AB (eller en lättviktig dokumentationsändring enligt
`PROJECT_WORKFLOW.md`s lightweight-policy, eftersom det bara är ett tillägg till en
redan existerande, godkänd logg) att genomföra.

## 8. Föreslagna kommande AB-items och sekvensering

Namn och grovt scope, inte fullständiga manifest – kräver eget godkännande per item:

1. **Bygg "Lägg till eller ändra data"** som näst guidade åtgärd (avsnitt 6),
   återanvänder `BiObjectSelectorComponent`, `OrderFormStepComponent`,
   `ReviewSummaryComponent`, `ObjectSelectorComponent` oförändrade.
2. **Utvärdera steg-signalmönstret för utbrytning** – bara som en delfråga i eller
   direkt efter AB(1), inte ett eget stort item; om mönstret visar sig identiskt
   kopierat, bryt ut det till en liten delad helper.
3. **Länka "Skapa ny rapport eller dashboard" till `/bestall/order-type-new-bi-app`**
   istället för att bygga ett nytt formulär. Litet, innehålls-/länkningsfokuserat item;
   bedöm samtidigt om `service-order-dashboard` ska bli en alias-/redirect-tjänst till
   `service-reports-dashboards` (öppen fråga, avsnitt 9) eller förbli en egen, länkad
   tjänst.
4. **Länka/utöka "Ändra behörighet" mot `order-type-access-group`** – bedöm om ett tunt,
   BI-objektmedvetet lager (samma `BiObjectSelectorComponent`) behövs ovanpå den
   befintliga beställningen, eller om en ren länk räcker i denna iteration.
5. **Bygg "Ändra ägare eller kontaktväg"** – efter att mönstret från AB(1)–(2) är
   stabilt, eftersom den saknar en befintlig generisk modell att luta sig mot och
   därför är den åtgärd där en ny, eventuellt delad "ändra ansvarig"-komponent är mest
   sannolik att behövas (om fler tjänster visar samma behov).
6. **(Separat, redan identifierat i AN-002/ADR-0003, inte en följd av detta AN)**
   Bedöm `ReportingPart`/`ReportingDataBinding` om AB(1) visar ett konkret behov av att
   peka på ett enskilt ark/panel snarare än hela asset.

"Rapportera problem" tas medvetet **inte** upp som ett kommande AB inom Rapporter och
dashboards-serien (avsnitt 7).

## 9. Risker och öppna frågor

- **Risk:** om `create`- eller `access`-åtgärderna byggs som nya, rapportspecifika
  formulär innan länkningen till `order-type-new-bi-app`/`order-type-access-group`
  beslutas, uppstår två parallella, delvis överlappande beställningsvägar för samma
  sak – dyrare att sanera senare än att besluta nu (samma mönster AN-002 beskrev för
  routing, nu på beställningsnivå).
- **Öppen fråga (kräver projektägarbeslut, inte antaget här):** ska
  `service-order-dashboard` ("Beställ dashboard") bli en alias-/redirect-tjänst till
  `service-reports-dashboards` på samma sätt som `/behov/rapport` blev en redirect
  (ADR-0002), eller ska de förbli två avsiktligt separata, relaterade tjänster (en
  katalog-/beställningsorienterad, en processorienterad)?
- **Öppen fråga:** räcker `order-type-access-group`s redan generiska omfattning
  ("datamängd, dashboard eller system") som den är för Rapporter och dashboards, eller
  behövs ett tunt, BI-objektmedvetet lager (samma `BiObjectSelectorComponent`) ovanpå
  den befintliga beställningen för att peka ut exakt vilken rapport/dashboard det
  gäller?
- **Känd begränsning:** denna analys bygger på kod, mockdata och dokumentation i
  arbetskopian per 2026-07-06. Ingen användartestning eller verklig efterfrågedata
  ligger bakom prioriteringsordningen i avsnitt 6 och 8 – den är en teknisk/strukturell
  bedömning av återanvändning och risk, inte en verksamhetsmässig behovsprioritering.
- **Process:** se "Process-avvikelse" ovan angående saknad Worksmith-registrering för
  detta AN-item.

## 10. Underlag som granskats

Kod: `frontend/src/app/features/needs-catalog/needs-catalog.component.ts/.html`,
`frontend/src/app/shared/components/{order-form-step,process-stepper,bi-object-selector,object-selector,review-summary}/`,
`frontend/src/app/features/orders/order-detail/order-detail.component.ts`,
`frontend/src/app/features/support/support.component.ts`, `frontend/src/app/app.routes.ts`.

Mockdata: `order-types.mock.json`, `services.mock.json`, `reporting-containers.mock.json`,
`reporting-assets.mock.json`, `systems.mock.json`.

Dokumentation: `docs/project/PROJECT_RULES.md`, `docs/project/DOCUMENT_INDEX.md`,
`docs/project/DECISIONS.md`, `docs/03_Informationsmodell.md`,
`docs/12_Designsystem_och_UI.md`, `docs/13_Utvecklarguide.md`,
`docs/adr/0002-canonical-url-struktur-tjanster.md`,
`docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md`,
`docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md`,
`docs/work-items/AB-004.md`, `docs/work-items/AB-010.md`.
