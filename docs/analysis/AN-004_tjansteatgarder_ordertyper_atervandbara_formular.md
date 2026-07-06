# AN-004 – Relationen mellan tjänsteåtgärder, ordertyper och återanvändbara formulär

Granskad: 2026-07-07
Work item: `AN-004`
Repositoryversion: den lokala arbetskopian i `C:\dev\Portal`, efter AB-012 (länkning av
"Skapa ny rapport eller dashboard" och "Ändra behörighet" till befintliga
`/bestall`-flöden).

Detta är en analys. Den ändrar ingen kod, ingen route, ingen mockdata och ingen
informationsmodell. Den producerar fynd och rekommendationer; permanent dokumentation
och senare implementation kräver separat godkännande och separata AB-items.

## 1. Sammanfattning och rekommendation

AB-012 löste återanvändning på kortast möjliga sikt: två åtgärder inom Rapporter och
dashboards fick peka på redan existerande `OrderType`-poster istället för att få nya,
dubblerade formulär. Den analysen (AN-003) hade rätt i sak, men avslöjade ett
strukturellt problem den inte själv löste: **`/bestall/<order-type>` är inte ett
interaktivt formulär över huvud taget** – det är en läsande katalog-/detaljsida
(process, beroenden, målgrupp, ansvar) som i bästa fall länkar vidare till ett *externt*
formulär via `OrderFlow.linkKey`, eller i denna mockup oftast bara visar "kontakta
ansvarig funktion". Två åtgärder inom *samma* tjänst (Rapporter och dashboards) ger nu
alltså två helt olika användarupplevelser: "Ändra innehåll eller utseende"/"Lägg till
eller ändra data" är riktiga, interaktiva, kollapsande flerstegsformulär inuti
tjänsten; "Skapa ny rapport eller dashboard"/"Ändra behörighet" kastar användaren till
en extern-länk-sida utan något interaktivt formulär alls. Det är inte bara en
stilskillnad – det är en funktionsskillnad.

**Rekommendation i korthet:**

1. **Klassificera varje åtgärd/ordertyp som generiskt portalflöde, återanvändbart
   domänflöde eller tjänstespecifikt flöde** (avsnitt 5) – inte som en binär
   "tjänst kontra beställning"-fråga. Samtliga sex hypoteser i uppdraget prövas i
   avsnitt 6 och bekräftas, med en viktig nyansering för "Ny BI-tillämpning" (se
   nedan).
2. **Route-principen i ADR-0002 ("egen route bara vid eget flöde") är fortfarande
   rätt, men den är ofullständig**: den säger inget om VAD som ska rendera det egna
   flödet när flera tjänster delar det. Rekommendationen är att dela upp frågan i två
   lager: (a) en delad, generisk **formulärkomponent/-funktion** (redan till stor del
   byggd: `BiObjectSelectorComponent`, `OrderFormStepComponent`,
   `ReviewSummaryComponent`, sök-/chip-mönstret från AB-011) som flera tjänster
   monterar i sin egen route/kontext, och (b) en tunn, tjänsteägd route/wrapper som
   ger komponenten rätt kontext (vilken tjänst, vilket objekt) – **inte** en
   omdirigering till en gemensam, kontextlös sida (avsnitt 7–9).
3. **"Rapportera problem" är redan beslutat som ett verkligt generiskt portalflöde**
   (DEC-005) – detta AN bekräftar det ytterligare med samma bevis (`TICKETING_SYSTEM_URL`
   i `SupportComponent`) och lägger inget nytt till den frågan.
4. **"Ny BI-tillämpning" (`order-type-new-bi-app`) är inte generiskt – det är
   BI-/rapportspecifikt**, mer specifikt än till och med "Ändra behörighet". Dess
   nuvarande placering i den generiska `/bestall`-katalogen är en artefakt av att
   katalogen byggdes innan Rapporter och dashboards fick sin egen tjänstesida, inte
   ett medvetet arkitekturval. Se avsnitt 6 och 8.
5. **"Ändra behörighet" (`order-type-access-group`) är det tydligaste exemplet på ett
   äkta återanvändbart domänflöde**: dess egen beskrivning är redan skriven generiskt
   ("till en datamängd, dashboard eller system"), men informationsmodellen stödjer i
   dag inte att flera tjänster delar samma `OrderType` (se avsnitt 10, ett konkret
   modellgap: `relatedServiceId` är singular, inte en array, till skillnad från
   `ServiceOffering.orderTypeIds`/`relatedServiceIds` som redan är arrayer).
6. Föreslagen permanent dokumentation (avsnitt 11, **förslag, inte beslut**): en ny
   ADR-0004 om route-/komponentprincipen för delade formulär, plus en kort
   uppföljande DEC-006 som pekar dit.

## 2. Nuläge: `/bestall/<order-type>`

`OrderCatalogComponent` (`/bestall`) listar alla `OrderType`-poster. `OrderDetailComponent`
(`/bestall/:id`) renderar en **läsande** detaljsida:

- Rubrik, kategori, kort beskrivning (`order.description`).
- "Steg i beställningen" – en tidslinje av `OrderStep`, med en tydlig `Internt steg`-tagg
  för steg som inte är användarsynliga. Ingen `<input>`, `<select>` eller `<textarea>`
  finns någonstans på sidan.
- Beroenden (`OrderDependency`), förutsättningar, målgrupp, ansvarigt team/kontakt
  (`ContactCardComponent`).
- **En enda primär åtgärd**, uppe i headern: en knapp som antingen (a) länkar till en
  extern URL via `OrderFlow.linkKey`/`SystemUrlService.getUrl(...)` om nyckeln är
  konfigurerad i `runtime-config.json`, eller (b) om inte konfigurerad – vilket gäller
  **samtliga** `OrderFlow`-poster i dagens `runtime-config.json` – visar "Kontakta
  ansvarig funktion för att starta" och länkar till `/kontakt`.
- En andra, duplicerad version av samma länk/kontaktfallback finns i sidopanelen under
  "Hantering".

`docs/03_Informationsmodell.md`s egen beskrivning av `OrderFlow` säger uttryckligen:
"Beställningsflödet kan ligga i portalen eller i ett annat system... Om beställningen
sker i ett annat system ska portalen länka användaren vidare." Modellen förutsåg alltså
redan båda fallen (i portalen / i ett annat system) – men **ingen kod någonstans
implementerar "ligger i portalen"-fallet**. Alla nio `OrderFlow`-poster i
`order-flows.mock.json` har ett `linkKey` som pekar utåt (eller, i mockupen, till en
grafiskt identisk "ej konfigurerad"-fallback); ingen har en `routerLink` till en
tjänstespecifik, interaktiv route.

**Slutsats:** `/bestall/<order-type>` är en **katalog-/referensyta**, strukturellt
identisk med den generiska `/tjanster/:id`-tjänstedetaljen (samma mönster: rubrik,
metadata, sidopanel, en enda extern/kontakt-CTA) – inte en formulärnära route och inte
en primär, interaktiv beställningsväg. Den generiska `/tjanster/:id`-sidan listar för
övrigt sina `relatedOrderTypes` med exakt samma `OrderCard → /bestall/:id`-länk som
`/bestall`-katalogen själv använder (`service-detail.component.ts`,
`relatedOrderTypes$`) – dvs. portalen har redan, konsekvent, en "generisk katalog+
detalj"-väg för både tjänster och beställningar, parallell med den "fördjupade,
tjänsteägda"-väg ADR-0002 införde bara för tjänster med ett eget flöde.

## 3. Nuläge: `/tjanster/rapporter-och-dashboards`

`NeedsCatalogComponent` har tre routes (ADR-0002): tjänstens huvudsida (åtgärdsval),
`.../andra-innehall` och `.../lagg-till-data`. Båda de senare renderar ett **riktigt,
interaktivt** flöde:

- Kollapsande steg (`OrderFormStepComponent`) med state (`active`/`complete`/`locked`),
  klick-baserad navigering, fokushantering.
- `BiObjectSelectorComponent` (system → container → asset, ADR-0003), med ansvarig och
  mockad godkännandetext inbyggt.
- Reaktiva formulär (`FormGroup`) med riktig validering, felmeddelanden, sammanfattning
  (`ReviewSummaryComponent`) och en mockad bekräftelsevy med ett genererat demo-ärende-id.
- Sedan AB-011: ett sök- och lägg-till-mönster (`app-search-results`/`app-chip*`,
  `_base.scss`) för att välja befintliga dataprodukter/datamängder.

De två återstående, ännu inte byggda åtgärderna (`owner`, `problem`) visar fortfarande
en generisk, inert platshållare (`.simple-next`). De två åtgärder AB-012 kopplade om
(`create`, `access`) visar sedan AB-012 **varken** ett eget formulär **eller** den
gamla platshållaren – de visar en kort text plus en länk ut till `/bestall/<id>`, dvs.
till den läsande katalogsidan i avsnitt 2.

## 4. Vad AB-012 faktiskt löste, och vilken inkonsekvens den synliggjorde

AB-012 var rätt beslut givet sitt eget, avgränsade scope (inget nytt formulär, ingen ny
orderstegsmodell): det förhindrade att exakt samma "beställ en ny BI-tillämpning"- och
"ändra behörighet"-logik byggdes två gånger. Men det gjorde det genom att **byta ut en
sidas interaktionsnivå, inte bara dess plats**. Inom en och samma tjänst
(Rapporter och dashboards) möter användaren nu:

| Åtgärd | Var | Interaktionsnivå |
| --- | --- | --- |
| Ändra innehåll eller utseende | `/tjanster/rapporter-och-dashboards/andra-innehall` | Fullt interaktivt formulär i portalen |
| Lägg till eller ändra data | `/tjanster/rapporter-och-dashboards/lagg-till-data` | Fullt interaktivt formulär i portalen |
| Skapa ny rapport eller dashboard | `/bestall/order-type-new-bi-app` | Läsande katalogsida, extern länk/kontakt-fallback |
| Ändra behörighet | `/bestall/order-type-access-group` | Läsande katalogsida, extern länk/kontakt-fallback |

Detta är den konkreta observation som gör "koppla bara till `/bestall`" otillräckligt
som en generell, framtida princip: den är rätt **tillfälligt** (bättre än att bygga en
tredje dubblett), men fel som **slutlägen** eftersom den bryter den i övrigt konsekventa
interaktionsnivån inom en och samma tjänst.

## 5. Klassificering: generiskt, återanvändbart domänflöde eller tjänstespecifikt

| Åtgärd / OrderType | Klassificering | Motivering |
| --- | --- | --- |
| Ändra innehåll eller utseende | **Tjänstespecifikt** | Fält (flikar/vyer, mått) och process är unika för ett BI-objekts innehåll; ger inget värde utanför Rapporter och dashboards. |
| Lägg till eller ändra data | **Tjänstespecifikt** | Databehovstyper och kopplingen till ett specifikt BI-objekt är rapport-/dashboard-specifika, även om den lutar sig mot den generiska Dataprodukt-/Datasetkedjan. |
| Skapa ny rapport eller dashboard / `order-type-new-bi-app` | **Tjänstespecifikt** (felplacerat som "generiskt" i dagens katalogstruktur) | Beskrivning, steg (`Koppla till dataprodukt`, `Utveckla BI-tillämpning`, `systemsAffected: [system-qlik-sense]`) är rakt igenom BI-/rapportspecifika. Den enda anledningen den *ser* generisk ut är att den ligger i den platta `/bestall`-katalogen tillsammans med faktiskt generiska poster – inte för att dess innehåll är generiskt. |
| Ändra behörighet / `order-type-access-group` | **Återanvändbart domänflöde** | Beskrivningen är redan medvetet skriven brett ("datamängd, dashboard eller system"); behovet ("ändra vem som har åtkomst till X") är strukturellt identiskt oavsett vilket X är – bara objektväljaren behöver bytas ut. |
| Ändra ägare eller kontaktväg | **Sannolikt återanvändbart domänflöde** (ej byggd) | Ägarbyte är konceptuellt lika generellt som behörighetsbyte (`ResponsibilityBoundary`/`Team`/`ContactPoint` är redan tjänsteoberoende begrepp i informationsmodellen), men inget konkret bevis finns ännu eftersom ingen `OrderType` för detta finns – se avsnitt 12, öppen fråga. |
| Rapportera problem | **Generiskt portalflöde** (redan beslutat, DEC-005) | Inget tjänstespecifikt innehåll alls; `SupportComponent`s redan existerande, avsiktligt osatta `TICKETING_SYSTEM_URL`-hook är den redan tänkta, enda ingången. |

**Skillnaden mellan "återanvändbart domänflöde" och "generiskt portalflöde"** (svar på
en av uppdragets frågor): ett återanvändbart domänflöde har ett naturligt "vilken
tjänst/vilket objekt gäller detta"-svar som kommer **från den anropande kontexten**
(användaren är redan inne i Rapporter och dashboards, så "dashboard" är redan
underförstått) – bara formens *steg och fält* delas, inte dess ingångspunkt. Ett
generiskt portalflöde har **inget** naturligt hemvist alls; frågan "vilken
tjänst/system/rapport gäller detta" måste vara ett steg *i* formuläret självt, eftersom
det lika ofta nås från Kontakt & support, sökresultat eller en helt annan tjänst som
från Rapporter och dashboards.

## 6. Prövning av hypoteserna

1. **"Det är klokt att flera tjänster kan länka till samma formulärdefinition."**
   **Bekräftad**, men bara för genuint återanvändbara domänflöden (t.ex. behörighet),
   inte för `order-type-new-bi-app` (avsnitt 5) – att låta *den* delas mellan tjänster
   vore fel, eftersom den redan bara har en (1) rimlig tjänsteägare.
2. **"Formulär som återanvänds från flera tjänster bör kunna visas i respektive
   tjänstekontext."** **Bekräftad.** Dagens `/bestall/<id>`-fallback gör motsatsen:
   den flyttar användaren till en kontextlös sida (ingen "du kom hit från Rapporter och
   dashboards"-tråd, bara en generisk `relatedService`-chip längst upp). Se avsnitt 7–9
   för hur.
3. **"Återanvändning bör framför allt ske genom formulärfunktioner och gemensamma
   stegkomponenter, inte genom att användaren skickas till en visuellt annorlunda
   formulärupplevelse."** **Bekräftad**, och redan delvis bevisad i praktiken: AB-010/
   AB-011 visade att `BiObjectSelectorComponent`, `OrderFormStepComponent`,
   `ReviewSummaryComponent` och sök-/chip-mönstret redan återanvänds rakt av mellan två
   tjänsteflöden utan att låsa något – exakt den återanvändningsnivå uppdraget efterfrågar.
4. **"'Rapportera problem' är ett verkligt generiskt portalflöde."** **Bekräftad**,
   redan beslutad (DEC-005). Inget nytt bevis krävdes utöver det redan dokumenterade.
5. **"'Ny BI-tillämpning' är inte generiskt, utan BI-/rapport-/dashboard-specifikt."**
   **Bekräftad**, med den skärpning att den bör betraktas som tillhörande Rapporter och
   dashboards specifikt (inte "BI-plattformen" i stort) – se avsnitt 5.
6. **"'Ändra behörighet' är återanvändbart över flera objekt och tjänster, men inte ett
   helt generiskt portalflöde."** **Bekräftad** – se avsnitt 5 för skillnaden mot
   "Rapportera problem".

## 7. Rekommenderad route- och UX-princip

Utöka ADR-0002s redan gällande regel ("en åtgärd med ett eget, meningsfullt flöde ska
ha en egen route under sin tjänst") med en andra regel för när flödet är delat:

- **En tjänstespecifik åtgärd** (avsnitt 5, t.ex. "Ändra innehåll eller utseende")
  fortsätter att få en egen route och en egen, dedikerad komponentimplementation under
  sin tjänst, precis som i dag.
- **Ett återanvändbart domänflöde** (t.ex. "Ändra behörighet") bör:
  1. Finnas som **en enda, delad formulärkomponent** (t.ex. en framtida
     `AccessRequestFormComponent`) byggd av samma generiska byggstenar som redan finns
     (`OrderFormStepComponent`, ett nytt "Välj accessgrupp"-steg, `ReviewSummaryComponent`).
  2. **Monteras direkt i respektive tjänsts egen route**
     (`/tjanster/rapporter-och-dashboards/andra-behorighet`,
     och likadant för andra tjänster som behöver samma flöde) – inte nås via en
     omdirigering till en gemensam, kontextlös sida. Tjänstens route ger komponenten
     kontext (vilket objekt/vilken tjänst) som input, likt hur `NeedsCatalogComponent`
     redan ger `BiObjectSelectorComponent` sin lista av system/containrar/assets.
  3. Om flödet även ska vara nåbart utan en tjänstekontext (t.ex. direkt från
     `/bestall`-katalogen, för en användare som inte utgår från en specifik tjänst),
     kan **samma komponent** monteras där också, med ett tomt/generiskt
     utgångsläge – en ren återmontering av samma implementation, inte en andra,
     parallell kod-kopia.
- **Ett generiskt portalflöde** (t.ex. "Rapportera problem") bör ha **en enda,
  portalägd route** (naturligt under Kontakt & support, i linje med den redan
  existerande `TICKETING_SYSTEM_URL`-hooken), med tjänster/sidor länkande **till**
  den – aldrig tvärtom. Här är det korrekt, inte en brist, att flera tjänster pekar på
  exakt samma sida, eftersom "vilken tjänst gäller detta" redan är ett steg i det
  generiska flödet snarare än något tjänstekontexten ska tillhandahålla.
- **En genuint tjänstespecifik `OrderType`** (t.ex. `order-type-new-bi-app`) bör på
  sikt visas via sin tjänsts egen, fördjupade väg (`/tjanster/rapporter-och-dashboards/
  skapa-ny-rapport` eller motsvarande) snarare än länkas ut till den generiska
  `/bestall/:id`-sidan – men **att bygga om detta är ett eget, separat AB-item**
  (avsnitt 12), inte en del av denna analys.

## 8. Rekommenderad princip för återanvändbara formulärfunktioner

| Funktion/mönster | Status | Var |
| --- | --- | --- |
| Kollapsande steg | **Byggd, generisk** | `OrderFormStepComponent` |
| Granska och skicka (visning) | **Byggd, generisk** | `ReviewSummaryComponent` |
| Sammanfattning (hopsättning av `ReviewEntry[]`) | Byggd, men **hand-upprepad per flöde** | Lokala `review*Request()`-metoder i `NeedsCatalogComponent` – medvetet inte utbruten ännu (AN-003/AB-011s princip: vänta på ett tredje verkligt fall) |
| Välj BI-objekt | **Byggd, generisk** | `BiObjectSelectorComponent` (ADR-0003) |
| Välj dataprodukt/datamängd (sök + chips) | **Byggd**, men logiken (`combinedDataOptions`, `dataSearchResults`, `addDataReference`/`removeDataReference`) är fortfarande lokal i `NeedsCatalogComponent`, bara CSS-delen (`app-search-results`/`app-chip*`) är global | `needs-catalog.component.ts` / `_base.scss` – kandidat för att brytas ut till en egen komponent om ett tredje flöde behöver samma sök-/lägg-till-mönster |
| Kontakt-/ansvarsinformation | Byggd, men **två parallella, oförenade mönster** | `ContactCardComponent` (team/`ContactPoint`-baserad, används i `OrderDetailComponent`/tjänstedetalj) kontra `reportingApprovalMessage()`/`responsibleLabel` (fri text på `ReportingAsset`, används i `BiObjectSelectorComponent`) – ingen delar kod med den andra i dag |
| Välj ansvarig (byt/tilldela en ny ansvarig person/funktion) | **Saknas** | Skulle krävas av en riktig "Ändra ägare eller kontaktväg" |
| Sök person | **Saknas** | Ingen `ContactPoint`- eller persondatakälla har en sökbar/väljbar UI i dag; all kontaktvisning är read-only |
| Välj accessgrupp | **Saknas** | `AccessGroup`-modellen finns (mockdata), men ingen selector-komponent – skulle krävas av en riktig "Ändra behörighet" |

**Princip:** en formulärfunktion blir en delad, generisk komponent när den **redan
används identiskt av två oberoende flöden** (bekräftat två gånger nu: BI-objektval,
kollapsande steg, granska-och-skicka-visning) – inte i förväg, baserat på en enda,
hypotetisk framtida användning. Det är samma försiktighetsprincip DEC-004 och AN-003
redan etablerat för `ServiceAction`/ordersteg-modellen, och den bör gälla lika för
UI-funktioner som för informationsmodellobjekt.

## 9. Förslag: dela ett formulär mellan tjänster utan att tappa kontext

Konkret mönster (inget av detta implementeras i detta AN):

1. Den delade formulärkomponenten tar emot kontext via `input()`-signaler – t.ex.
   `serviceContextLabel` (visningstext, "Gäller: Rapporter och dashboards"),
   `returnRoute` (vart "Avbryt"/"Tillbaka" ska gå), och eventuellt en förifylld/
   begränsad lista av valbara objekt (t.ex. bara rapporterings-BI-objekt när
   komponenten monteras från Rapporter och dashboards, i motsats till alla objekttyper
   när den nås utan tjänstekontext).
2. Varje tjänst som behöver flödet lägger till en **egen, tunn route**
   (`/tjanster/<tjänst>/<åtgärd-slug>`) vars enda jobb är att montera den delade
   komponenten med rätt kontext – exakt som `NeedsCatalogComponent`s egna routes redan
   gör för `actionId`, fast med en annan, delad komponent istället för
   `NeedsCatalogComponent` självt.
3. Brödsmule-/rubriknavigeringen (redan ett etablerat mönster, `breadcrumb-small` i
   `needs-catalog.component.html`) fortsätter att visa "Hem → [Tjänstenamn] → [Åtgärd]"
   oavsett att formuläret återanvänds – kontexten kommer från routen, inte från
   komponentens egen kod.
4. Om samma flöde även ska nås utan tjänstekontext (från `/bestall`-katalogen), får
   `/bestall/<order-type>` (eller en ny, tunn route) montera **samma** komponent med
   `serviceContextLabel` satt till tomt/generiskt läge – en ren återmontering, inte en
   ny implementation.

Detta kräver inget nytt informationsmodellobjekt. Det enda konkreta modellgapet är
beskrivet i avsnitt 10.

## 10. Ett konkret modellgap (observation, inte ett beslut)

`ServiceOffering.orderTypeIds: string[]` och `ServiceOffering.relatedServiceIds?:
string[]` är redan arrayer (en tjänst kan redan peka på flera beställningstyper och
flera relaterade tjänster). Men `OrderType.relatedServiceId?: string` är **singular**.
Om "Ändra behörighet" (eller en framtida delad `OrderType`) verkligen ska kunna nås
från flera tjänster samtidigt, är dagens fält strukturellt otillräckligt för att
uttrycka det – det finns bara plats för en (1) relaterad tjänst. Detta är en
observation, inte ett förslag att ändra modellen i detta AN; en eventuell
`relatedServiceIds?: string[]`-ändring (symmetrisk med `ServiceOffering`s eget fält)
bör beslutas och göras i ett eget, litet AB-item om/när ett andra, konkret
återanvändningsfall (utöver det ospecificerade, framtida behovet) bekräftar behovet.

## 11. Rekommenderad permanent dokumentation (förslag – ej beslutat här)

Separerat tydligt från analysens egna observationer ovan. Kräver projektägarens
godkännande innan det skrivs:

- **Ny ADR-0004** (näst lediga numret efter 0001–0003): "Route- och komponentprincip
  för delade tjänsteflöden" – formaliserar avsnitt 7–9: tjänstespecifika åtgärder får
  egna komponenter under sin tjänst; återanvändbara domänflöden är en delad komponent
  monterad per tjänsteroute med kontext via input-signaler, inte en omdirigering till
  en kontextlös sida; generiska portalflöden har en enda, portalägd route som tjänster
  länkar till.
- **Ny DEC-006** i `docs/project/DECISIONS.md` (näst lediga numret efter DEC-005): en
  kort sammanfattning som pekar på ADR-0004 och uttryckligen noterar att
  `order-type-new-bi-app`s nuvarande placering i den generiska `/bestall`-katalogen är
  en känd, accepterad, tillfällig kompromiss (från AB-012) i väntan på att tjänsten får
  en egen, fördjupad väg för "Skapa ny rapport eller dashboard" (avsnitt 12).

## 12. Föreslagna kommande AB-items

Namn och grovt scope, inga manifest – kräver eget godkännande per item:

1. **Bygg en delad "Ändra behörighet"-formulärkomponent** och montera den under
   `/tjanster/rapporter-och-dashboards/andra-behorighet` (ersätter dagens länk till
   `/bestall/order-type-access-group`). Kräver sannolikt en ny "Välj accessgrupp"-
   selector (avsnitt 8).
2. **Ge "Skapa ny rapport eller dashboard" en egen, fördjupad väg** under Rapporter och
   dashboards (t.ex. `/tjanster/rapporter-och-dashboards/skapa-ny-rapport`) som
   återanvänder `OrderStep`/`OrderDependency`-informationen från `order-type-new-bi-app`
   men presenterar den i tjänstens egen, interaktiva stil – istället för att länka ut
   till `/bestall/order-type-new-bi-app`.
3. **Utred och bygg "Ändra ägare eller kontaktväg"** – första konkreta AB som skulle
   kräva en riktig "Välj ansvarig"/"Sök person"-funktion (avsnitt 8), vilket saknas
   helt i dag.
4. **Bedöm `OrderType.relatedServiceId` → `relatedServiceIds`** (avsnitt 10) när ett
   andra konkret delat-formulär-fall finns.
5. **(Redan beslutad, DEC-005, ej en följd av detta AN)** Bygg "Rapportera problem" som
   ett generellt, portalövergripande flöde kopplat till Kontakt & support.

## 13. Risker och öppna frågor

- **Risk:** om fler åtgärder länkas till `/bestall/<id>` innan en delad
  komponentprincip finns, växer samma inkonsekvens (avsnitt 4) för varje ny länkning –
  dyrare att reda ut senare än att besluta route-/komponentprincipen nu.
- **Öppen fråga:** exakt vilken tjänst (om någon utöver Rapporter och dashboards) som
  faktiskt kommer behöva "Ändra behörighet" är inte känt ännu – rekommendationen i
  avsnitt 7 fungerar även om Rapporter och dashboards länge förblir den enda
  användaren, men den fulla nyttan (en verkligt delad komponent) realiseras först när
  ett andra konkret fall dyker upp.
- **Öppen fråga:** om `/bestall`-katalogen på sikt ska fortsätta lista
  tjänstespecifika `OrderType`-poster (som `order-type-new-bi-app`) som om de vore
  fristående, generiska beställningar, eller om katalogen bör markera/dölja
  tjänsteägda poster och istället peka besökaren till tjänstens egen sida – inte
  avgjort här.
- **Känd begränsning:** denna analys bygger på kod, routes, mockdata och dokumentation
  i arbetskopian per 2026-07-07. Klassificeringen i avsnitt 5 är en strukturell/teknisk
  bedömning utifrån redan skriven mockdata-text, inte en verksamhetsmässig
  behovsanalys av vilka tjänster som faktiskt kommer dela vilka flöden i praktiken.

## 14. Underlag som granskats

Kod: `frontend/src/app/features/orders/order-detail/order-detail.component.ts/.html`,
`frontend/src/app/features/orders/order-catalog/`,
`frontend/src/app/features/services/service-detail/service-detail.component.ts/.html`,
`frontend/src/app/features/needs-catalog/needs-catalog.component.ts/.html`,
`frontend/src/app/shared/components/{bi-object-selector,order-form-step,
review-summary,object-selector,contact-card}/`, `frontend/src/app/app.routes.ts`,
`frontend/src/app/models/{order-type,service-offering,order-flow}.model.ts`.

Mockdata: `order-types.mock.json`, `order-flows.mock.json`, `services.mock.json`.

Dokumentation: `docs/project/PROJECT_RULES.md`, `docs/project/DOCUMENT_INDEX.md`,
`docs/project/DECISIONS.md` (DEC-001–DEC-005), `docs/03_Informationsmodell.md`,
`docs/12_Designsystem_och_UI.md`, `docs/13_Utvecklarguide.md`,
`docs/adr/0002-canonical-url-struktur-tjanster.md`,
`docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md`,
`docs/analysis/AN-003_atgardsflode_atervandning_rapporter_dashboards.md`,
`docs/work-items/AB-010.md`, `docs/work-items/AB-011.md`, `docs/work-items/AB-012.md`.
