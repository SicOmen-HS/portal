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

- Datum: 2026-07-07
- Kategori: UI
- Observation: Saker går inte i linje med varandra. Exempelvis Sökfältet är inte i linje med de andra boxarna nedan. Vanliga frågor rutan går inte i linje med den vita rutan. 
- Var i portalen: Startsidan
- Varför det kan vara värt att titta på: 
- Möjlig hantering: Rätta till att allt går i linje med varandra.
- Status: Ny observation 
- Länkat Worksmith-item: -

- Datum: 2026-07-07
- Kategori: UI | Mindre bugg
- Observation: Breadcrumbs stämmer inte med resten. Saknas tjänster som breadcrumb.
- Var i portalen: tjanster/rapporter-och-dashboards
- Varför det kan vara värt att titta på: Lättare navigation
- Möjlig hantering: Lägg in rätt breadcrumbs.
- Status: Ny observation 
- Länkat Worksmith-item: -

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
