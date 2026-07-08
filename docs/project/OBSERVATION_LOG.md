# Observation Log

## Syfte och status

Observationsloggen fångar små UI-observationer, framtidsidéer, friktion och mindre
buggar som ännu inte är beslutade eller godkända work items.

Detta är ett **operativt, icke-styrande dokument**. Loggen är inte en backlog, inte en
prioriteringslista och ersätter inte Worksmith. En observation innebär varken att
arbete är godkänt eller att den föreslagna hanteringen är beslutad.

När en observation blir verkligt arbete ska ett AB- eller AN-item skapas enligt
Worksmith-flödet och länkas från observationen. Listan bör ses över med jämna
mellanrum och i samband med nya UI- eller designitems.

## Mall för observationer

Kopiera mallen till lämplig sektion och fyll i den. `Status` beskriver endast
observationens placering i denna logg; det är inte en Worksmith-status.

```markdown
### ÅÅÅÅ-MM-DD — <kategori> — <kort beskrivning>

- Datum: ÅÅÅÅ-MM-DD
- Kategori: UI | UX | Tillgänglighet | Friktion | Mindre bugg | Framtidsidé | Annat
- Observation:
- Var i portalen:
- Varför det kan vara värt att titta på:
- Möjlig hantering:
- Status: Ny observation | Kandidat för framtida AB/AN | Åtgärdat | Parkerat
- Länkat Worksmith-item: -
```

## Nya observationer

### 2026-07-07 — UI — Justering av linjering på startsidan

- Datum: 2026-07-07
- Kategori: UI
- Observation: Vissa element på startsidan linjerar inte helt med varandra. Exempelvis upplevs sökfältet inte ligga i linje med boxarna nedanför, och sektionen med vanliga frågor linjerar inte konsekvent med intilliggande vit innehållsyta.
- Var i portalen: Startsidan
- Varför det kan vara värt att titta på: Startsidan är portalens primära ingång och små linjeringsskillnader kan göra helheten mindre polerad, särskilt när layouten används som referens för övriga sidor.
- Möjlig hantering: Se över grid, maxbredd, kolumnindelning och spacing för startsidans sökfält, kortytor och FAQ-/informationsytor. Samordna gärna med ett framtida UI-polish- eller startsidesitem.
- Status: Ny observation
- Länkat Worksmith-item: -

### 2026-07-07 — UI | Mindre bugg — Breadcrumbs saknar tjänstenivå

- Datum: 2026-07-07
- Kategori: UI | Mindre bugg
- Observation: Breadcrumbs på Rapporter och dashboards-sidan stämmer inte helt med informationshierarkin. Tjänster-nivån saknas eller visas inte konsekvent, vilket gör att vägen inte speglar portalens struktur.
- Var i portalen: `/tjanster/rapporter-och-dashboards`
- Varför det kan vara värt att titta på: Tydliga breadcrumbs gör det lättare att förstå var användaren befinner sig och stärker den beslutade principen att tjänster är primär kontext för tjänsteflöden.
- Möjlig hantering: Lägg till eller justera breadcrumb-strukturen så att den visar en konsekvent väg, exempelvis `Hem > Tjänster > Rapporter och dashboards`, och kontrollera samma mönster för underliggande tjänsteåtgärder.
- Status: Ny observation
- Länkat Worksmith-item: -

### 2026-07-08 — UI | UX — Långa processflöden bryter ojämnt

- Datum: 2026-07-08
- Kategori: UI | UX
- Observation: Process-steppen för det nya flödet "Skapa ny rapport eller dashboard" har sju steg. På bredare vy kan steg 7 hamna på en egen rad, vilket gör att flödet visuellt känns mindre sammanhållet än kortare beställningsflöden.
- Var i portalen: `/tjanster/rapporter-och-dashboards/skapa-ny-rapport-dashboard`
- Varför det kan vara värt att titta på: Processvisaren används som återkommande mönster i tjänstebeställningar. När antalet steg ökar behöver komponenten fortfarande vara lätt att överblicka på desktop, tablet och mobil.
- Möjlig hantering: Se över hur `ProcessStepperComponent` eller motsvarande processvisning hanterar många steg. Möjliga lösningar är kompaktare steg, horisontell scroll på mindre ytor, två-radslayout med bättre balans, eller en alternativ sammanfattad progressindikator för långa flöden.
- Status: Ny observation
- Länkat Worksmith-item: AB-016

### 2026-07-08 — Informationsmodell | Framtidsidé — Gemensam informationssäkerhetsklassning för dataobjekt

- Datum: 2026-07-08
- Kategori: Framtidsidé
- Observation: Dataprodukter och datamängder bör båda kunna bära informationssäkerhetsklassning. Nuvarande Datamarknad visar klassningsfilter som främst gäller datamängder, medan dataprodukter visar andra trust-/governance-signaler. Målbilden bör stödja en gemensam klassningsskala: Öppen data, Intern data, Känslig och Mycket känslig. Nivå 5.X ska inte hanteras i nuläget.
- Var i portalen: `/tjanster/datamarknad`, `/data`, dataprodukt- och datamängdsdetaljer
- Varför det kan vara värt att titta på: Klassning är ett centralt beslutsunderlag för åtkomst, användning, governance och vidare rapport-/dashboardflöden. Om dataprodukter saknar samma typ av klassningssignal som datamängder kan användaren få en ofullständig bild av informationssäkerheten.
- Möjlig hantering: Skapa ett separat AN- eller AB-item för att analysera och införa gemensam informationssäkerhetsklassning i informationsmodell, mockdata och UI. Bör samordnas med framtida åtkomst- och governance-flöden.
- Status: Ny observation
- Länkat Worksmith-item: AB-018

### 2026-07-08 — UI | UX — Datamarknadens list- och previewlayout behöver polish

- Datum: 2026-07-08
- Kategori: UI | UX
- Observation: Den nya utforskningsytan i Datamarknad uppfyller grundscopet men layouten kan upplevas tung och något obalanserad. Resultatlistan har egen scrollbar, previewpanelen dominerar ytan och filterraden kan kännas ojämn när klassningsfiltret hamnar avskilt.
- Var i portalen: `/tjanster/datamarknad`
- Varför det kan vara värt att titta på: Datamarknadens utforskningsyta är central för upplevelsen av tjänsten. Små layoutproblem kan göra att sidan känns mindre polerad och att användaren missar att fler resultat finns i listan.
- Möjlig hantering: Se över balans mellan lista och preview, scrollbeteende, filterradens placering och responsiv layout. Överväg kompaktare resultatlista, tydligare vald rad, bättre previewhöjd och en mer sammanhållen filteryta.
- Status: Ny observation
- Länkat Worksmith-item: AB-018


## Kandidater för framtida AB/AN

Observationer som bedöms värda att utreda eller genomföra kan flyttas hit. Placering
här är fortfarande inte ett prioriteringsbeslut eller ett godkännande att starta
arbete.

Inga kandidater registrerade ännu.

## Åtgärdat via annat arbete

Flytta hit observationer som lösts inom ett godkänt Worksmith-item och ange itemets
identifierare under `Länkat Worksmith-item`.

Inga åtgärdade observationer registrerade ännu.

## Parkerat / inte aktuellt

Flytta hit observationer som inte ska tas vidare nu och dokumentera skälet under
`Möjlig hantering` eller i observationstexten.

Inga parkerade observationer registrerade ännu.
