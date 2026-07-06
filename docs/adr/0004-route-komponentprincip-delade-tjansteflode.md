# ADR-0004: Route- och komponentprincip för tjänstespecifika, återanvändbara och generiska flöden

## Status

Accepterad

## Datum

2026-07-07

## Kontext

AB-012 länkade åtgärderna "Skapa ny rapport eller dashboard" och "Ändra behörighet"
inom tjänsten Rapporter och dashboards till befintliga `OrderType`-poster under
`/bestall` (`order-type-new-bi-app`, `order-type-access-group`), istället för att
bygga nya, rapportspecifika formulär. Det undvek dubblerad kod på kort sikt, men
`AN-004` ("Förtydliga relationen mellan tjänsteåtgärder, ordertyper och
återanvändbara formulär") visade att detta samtidigt skapar en oavsiktlig
**funktionsskillnad**, inte bara en stilskillnad, inom en och samma tjänst:
`/tjanster/rapporter-och-dashboards/andra-innehall` och `.../lagg-till-data` är
riktiga, interaktiva, kollapsande flerstegsformulär i portalen, medan
`/bestall/<order-type>` (`OrderDetailComponent`) är en läsande katalog-/detaljsida
utan något interaktivt fält – dess enda åtgärd är en extern länk
(`OrderFlow.linkKey`) eller en kontakt-fallback, aldrig ett formulär i portalen.

Portalen saknade en uttalad princip för när en åtgärd ska vara helt tjänsteägd, när
den bör vara ett formulär flera tjänster delar, och när den bör vara ett enda,
portalövergripande flöde – samt, viktigast, **var** ett delat formulär då ska
renderas utan att användaren tappar sin tjänstekontext. `ADR-0002` beslutade redan
att en åtgärd med ett eget, meningsfullt flöde ska få en egen route under sin tjänst,
men tog inte ställning till vad som händer när flera tjänster behöver samma flöde.

## Beslut

Varje åtgärd/flöde klassificeras som en av tre typer, med en egen route- och
komponentprincip per typ:

- **Tjänstespecifikt flöde.** Fält, process och komponentimplementation är unika för
  en tjänst. Får en egen route under tjänsten
  (`/tjanster/<tjänst>/<åtgärd-slug>`, redan `ADR-0002`) och en egen, dedikerad
  komponent. Exempel: "Ändra innehåll eller utseende", "Lägg till eller ändra data".
- **Återanvändbart domänflöde.** Samma steg och fält är relevanta för flera
  tjänster/objekt; bara "vilket objekt/vilken tjänst gäller detta" varierar, och det
  svaret kommer naturligt från den anropande tjänstekontexten. Byggs som **en enda,
  delad formulärkomponent** som monteras direkt i respektive tjänsts egen route, med
  kontext (tjänst, objekt, förvalda listor) skickad in via komponentens `input()`
  – inte nås genom att omdirigera användaren till en gemensam, kontextlös sida.
  Samma komponent kan även monteras från en katalogväg (t.ex. `/bestall/<id>`) med
  ett tomt/generiskt utgångsläge, om flödet även ska vara nåbart utan
  tjänstekontext. Exempel: "Ändra behörighet".
- **Generiskt portalflöde.** Inget naturligt tjänstehemvist finns – frågan "vilken
  tjänst/system/rapport gäller detta" måste vara ett steg i formuläret självt,
  eftersom flödet nås lika ofta utan en föregående tjänstekontext. Får **en enda,
  portalägd route** (naturligt under Kontakt & support) som valfritt antal tjänster
  länkar till – det är här korrekt, inte en brist, att flera tjänster pekar på exakt
  samma sida. Exempel: "Rapportera problem" (redan beslutat, `DEC-005`).

`order-type-new-bi-app`s nuvarande länkning från "Skapa ny rapport eller dashboard"
till den generiska `/bestall`-katalogen (`AB-012`) är en **känd, tillfällig
kompromiss** – ordertypen är i sak tjänstespecifik för Rapporter och dashboards
(se `AN-004`, avsnitt 5), inte ett återanvändbart domänflöde eller ett generiskt
portalflöde. Den ska på sikt få en egen, fördjupad väg under tjänsten, inte förbli
länkad till den generiska katalogsidan.

## Motivering

Klassificeringen och route-principen bygger direkt på `docs/03_Informationsmodell.md`s
princip att användaren ska mötas av tjänster och behov, inte av portalens interna
tekniska struktur – ett delat formulär som kastar användaren till en kontextlös sida
bryter den principen lika mycket som att sakna routing alls gör. Att kräva att ett
återanvändbart domänflöde är **en enda komponent** (monterad på flera routes) snarare
än flera separata implementationer följer redan etablerad praxis i detta repository
(`BiObjectSelectorComponent`, `OrderFormStepComponent`, `ReviewSummaryComponent`
återanvänds redan oförändrade mellan "Ändra innehåll eller utseende" och "Lägg till
eller ändra data", `AB-010`/`AB-011`) – denna ADR formaliserar samma mönster för
flöden som delas mellan *tjänster*, inte bara mellan åtgärder inom en tjänst.
Att låta genuint generiska flöden ha en enda, delad route är konsekvent med hur
`SupportComponent` redan är förberedd för "Rapportera problem" via den avsiktligt
osatta `TICKETING_SYSTEM_URL`-nyckeln (`DEC-005`).

## Konsekvenser

### Positiva konsekvenser

- En tydlig regel för var en ny åtgärd ska implementeras, istället för att varje
  AB-item behöver uppfinna sin egen lösning.
- Återanvändbara domänflöden kan byggas en gång och delas av flera tjänster utan att
  användaren möter en annan interaktionsnivå eller tappar sin tjänstekontext.
- Genuint generiska flöden slipper dupliceras per tjänst.

### Negativa konsekvenser eller risker

- Kräver att en delad formulärkomponent designas med kontext-input från början
  (tjänstenamn, returroute, eventuellt förfiltrerade objektlistor), vilket är mer
  arbete än att bara länka till en befintlig sida.
- Tills en delad domänflödeskomponent faktiskt byggs (se `AN-004`s föreslagna
  AB-items) fortsätter "Skapa ny rapport eller dashboard" och "Ändra behörighet" att
  peka på den generiska `/bestall`-katalogen – en känd, redan dokumenterad, tillfällig
  avvikelse från denna princip, inte ett brott mot den.

### Saker att följa upp

- Bygg en delad "Ändra behörighet"-formulärkomponent och montera den under
  tjänstens egen route (`AN-004`, föreslaget AB-item).
- Ge "Skapa ny rapport eller dashboard" en egen, fördjupad väg under Rapporter och
  dashboards istället för att länka till `/bestall/order-type-new-bi-app`.
- Bedöm om `OrderType.relatedServiceId` (i dag singular) behöver bli
  `relatedServiceIds` (en array, symmetriskt med `ServiceOffering`s egna fält) när ett
  konkret, andra delat-formulär-fall bekräftar behovet (`AN-004`, avsnitt 10).

## Påverkade delar

- frontend (framtida komponentstruktur för delade domänflöden)
- routing
- dokumentation

## Relaterade dokument

- `docs/analysis/AN-004_tjansteatgarder_ordertyper_atervandbara_formular.md`
- `docs/project/DECISIONS.md` (DEC-005, DEC-006)
- `docs/03_Informationsmodell.md`
- `docs/13_Utvecklarguide.md`

## Relaterade ADR:er

- ADR-0002 (canonical URL-struktur) – denna ADR bygger vidare på dess regel att en
  åtgärd med ett eget flöde ska ha en egen route, och lägger till principen för när
  flera tjänster delar samma flöde.
- ADR-0003 (generisk BI-objektmodell) – opåverkad, men ett exempel på samma
  återanvändningsmönster (en delad komponent, `BiObjectSelectorComponent`) som denna
  ADR nu formaliserar för tjänstenivå.
