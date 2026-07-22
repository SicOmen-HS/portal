# AN-011 — Avgränsa datamängd, dataprodukt och direkta relationer mellan DM, IM och rapport/dashboard

## Bakgrund

Två tidigare, skrivskyddade planerings- och resonemangsfaser i en assistentkonversation
(icke-persisterade, inga Worksmith-item) inventerade om repositoryts befintliga begrepp
för `Dataset`, `InformationMart` och `BusinessApplication` kan återanvändas för att på
en datamängdssida visa var en datamängd kommer ifrån och var den används, utan att bygga
full teknisk lineage. De identifierade att `InformationMart.relatedDatasetIds` och
`InformationMart.relatedBusinessApplicationIds`/`BusinessApplication.informationMartIds`
redan är direkta, deklarerade relationsfält, att dataproduktsidan
(`data-product-detail.component.html`) redan har ett fungerande UI-mönster ("Bygger på
datamängder"/"Används av dashboards/rapporter"), och lämnade kvar tre olösta frågor som
detta AN tar vidare: om `InformationMart` faktiskt motsvarar verksamhetens IM eller bara
råkar dela namn, om `Dataset` kan representera DM, IM eller båda, och en dubbellagrad
relation mellan `InformationMart.relatedBusinessApplicationIds` och
`BusinessApplication.informationMartIds` utan uttalat ägarskap.

## Syfte

Utreda hur repositoryts befintliga begrepp `Dataset`, `InformationMart` och Dataprodukt
kan mappas mot verksamhetens DM och IM, så att portalen på en datamängdssida kan visa ett
litet, direkt relationsutsnitt (direkt föregående datamängd → aktuell datamängd → direkt
användning) utan att skapa parallella begrepp eller beskriva utsnittet som full lineage.

## Metod och avgränsning

Statisk analys: läsning av styrande dokumentation, ADR:er, tidigare AN-rapporter,
TypeScript-modeller, mockdata och komponentkod. Ingen kod kördes, ingen mockdata, kod
eller styrande dokumentation ändrades. Given verksamhetskontext (nedan) behandlas som
tillhandahållen av uppdragsgivaren, inte som något denna analys självständigt ska
verifiera eller ifrågasätta.

### Given verksamhetskontext (ej analysfråga)

- Endast DM och IM ska i första portalversionen vara beställningsbara datamängder.
- DM modelleras enligt Kimball.
- IM är ett konsumtionsnära lager som kan kombinera en eller flera DM.
- Rapporter och dashboards kan i nuläget konsumera både DM och IM.
- Målbilden är att konsumtion framöver normalt ska ske från IM.

### Granskat underlag

Styrning: `AGENTS.md`, `docs/07_AI_Instruktioner.md`, `docs/project/PROJECT_RULES.md`,
`docs/project/PROJECT_WORKFLOW.md`, `docs/project/DOCUMENT_INDEX.md`.

Informationsmodell och ADR: `docs/03_Informationsmodell.md`,
`docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`,
`docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md`.

Tidigare AN/AB: `docs/work-items/AN-006.md`, `docs/work-items/AN-008.md`,
`docs/work-items/AN-010.md`, `docs/work-items/AB-027.md`, `docs/work-items/AB-028.md`,
`docs/analysis/AN-006_malbild_datamarknad_anvandarupplevelse.md`,
`docs/analysis/AN-008_dubbelmodell_datamarknad_tjanstekatalog.md`,
`docs/analysis/AN-010_klassificera_lakehouse_poc_backendansvar.md`.

Modeller: `frontend/src/app/models/dataset.model.ts`,
`frontend/src/app/models/information-mart.model.ts`,
`frontend/src/app/models/business-application.model.ts`,
`frontend/src/app/models/system.model.ts`,
`frontend/src/app/models/reporting-asset.model.ts`,
`frontend/src/app/models/reporting-container.model.ts`.

Komponenter/service: `frontend/src/app/features/data-detail/data-detail.component.ts`/`.html`,
`frontend/src/app/features/data-product-detail/data-product-detail.component.ts`/`.html`,
`frontend/src/app/services/data-catalog.service.ts`.

Mockdata (endast läst, ej ändrad): `frontend/public/assets/mock/datasets.mock.json`,
`information-marts.mock.json`, `business-applications.mock.json`, `systems.mock.json`,
`frontend/public/assets/mock/README.md`.

Sökning: `Kimball`, `Data Mart`, fristående `DM`/`IM` som termer söktes över hela
`docs/*.md` — inga träffar utöver denna analys egen text och work item-filen. `WhereScape`
söktes i `docs/04_Systemarkitektur.md` — en enda träff, ett listat teknisk
komponent-namn (rad 397) utan vidare beskrivning.

## 1. Kärnfråga och begreppsmappning

> Hur kan repositoryts befintliga begrepp `Dataset`, `InformationMart` och Dataprodukt
> mappas mot verksamhetens DM och IM, så att portalen kan visa direkta relationer utan
> att skapa parallella begrepp eller beskriva utsnittet som full lineage?

### 1.1 Vad repositoryt faktiskt säger (Verifierat i repositoryt)

- `Dataset` definieras teknikoberoende: "en bred, upptäckbar datatillgång eller ett
  byggblock" (`docs/adr/0001-dataprodukt-som-anvandarbegrepp.md` rad 35–37),
  "beskriver en datamängd som användare kan hitta, förstå, begära åtkomst till eller
  konsumera" (`docs/03_Informationsmodell.md` rad 389–391). Inget i definitionen
  nämner DM, IM, Kimball, vylager eller SQL Server.
- `Dataset.source: string` och `Dataset.technicalSource?: string` är fria textfält utan
  koppling till ett typat objekt (`dataset.model.ts` rad 17–18). Exempeldata varierar:
  `dataset-sales-transactions-demo.technicalSource = "Iceberg-tabell (exempel)"`
  (`datasets.mock.json` rad 10), men `dataset-product-register-demo` och flera andra
  poster saknar `technicalSource` helt.
- `InformationMart` definieras som "en strukturerad informationsprodukt eller
  konsumtionsyta som bygger på Data Vault 2.1 och används för rapportering, analys eller
  vidare konsumtion" (`docs/03_Informationsmodell.md` rad 530–534), kan bygga på "en
  eller flera datamängder" (rad 331), och bär styrnings-/kvalitetsmetadata: `owner`,
  `ownerTeamId`, `documentationUrlKey`, `trust` (`documentationCoverage`,
  `qualityChecksPassed`, `ownerAssigned`, `lastReviewed`) (`information-mart.model.ts`
  rad 38–48, 54–81).
- ADR-0001 fastslår uttryckligen att "Dataprodukt" **enbart** är UI-namnet för
  `InformationMart`; inget separat `DataProduct`-objekt finns eller är avsett i denna
  iteration (ADR-0001 rad 62–67, `docs/03_Informationsmodell.md` rad 486–489).
- Sökning bekräftar att termerna "Kimball", "Data Mart", eller fristående "DM"/"IM" som
  affärsbegrepp **inte förekommer någonstans** i `docs/00`–`docs/14`, ADR:erna eller
  tidigare analyser. `WhereScape` förekommer en gång, som ett olänkat namn i en lista
  över tekniska komponenter (`docs/04_Systemarkitektur.md` rad 397), utan att kedjan
  DM/IM/Kimball beskrivs där.

### 1.2 Tolkning mot given verksamhetskontext

`InformationMart`s egen motivering — "bygger på Data Vault 2.1", "konsumtionsyta",
"kan kombinera flera datamängder", bär styrnings-/kvalitetsmetadata — **överlappar
funktionellt** med verksamhetens beskrivning av IM som "ett konsumtionsnära lager som
kan kombinera en eller flera DM". Det är rimligt, men **inte bevisat**, att
`InformationMart` avsågs representera samma lager som verksamhetens IM, eftersom repots
egen text konsekvent talar om Data Vault-terminologi och aldrig nämner Kimball, DM eller
ett mellanliggande DW-steg. Namnlikheten ("Information Mart" i båda) är ett observerat
faktum, inte i sig ett bevis på att de är samma tekniska lager — de kan mycket väl
råka beskriva samma verkliga skikt från två olika terminologitraditioner (Data
Vault-litteratur respektive verksamhetens egen Kimball/IM-vokabulär), men repot
dokumenterar inte denna koppling uttryckligen.

`Dataset` är, till skillnad från `InformationMart`, inte beskrivet med någon
teknisk lagerreferens alls — varken Data Vault, DW, DM eller råskikt. Det är ett
medvetet generiskt, teknikoberoende begrepp. Detta betyder att `Dataset` **kan**
representera en DM (eller i princip vilket lager som helst), men modellen ger inget stöd
för att skilja en DM-nivå-`Dataset` från ett hypotetiskt råskiktsobjekt — det finns inget
typfält för detta.

**Om `technicalSource: "Iceberg-tabell (exempel)"`:** `technicalSource` är ett fritt
textfält utan definierat kontrollerat värdeschema (`dataset.model.ts` rad 18:
`technicalSource?: string`), och `docs/03_Informationsmodell.md` beskriver fältet
konceptuellt bara som "teknisk källa" utan att ange vilket lager i kedjan det ska peka
på. Fältets semantik är alltså inte tillräckligt definierad för att fastställa vilken
katalog- eller lagernivå objektet representerar. Värdet `"Iceberg-tabell (exempel)"`
bevisar därför **inte** att katalogobjektet representerar rådata — men repositoryt ger
heller inte underlag för att avgöra vilken nivå objektet faktiskt representerar. Detta är
en öppen fråga som denna analys inte kan besvara åt något håll utifrån befintligt
underlag.

### 1.3 Preliminära observationer

| Verksamhetsbegrepp | Repobegrepp | Status |
| --- | --- | --- |
| DM | `Dataset` | **Tolkning**: rimlig, ej motsägd av repot, men repot saknar ett typfält som uttryckligen skiljer DM från andra datamängdstyper |
| IM | `InformationMart` | **Tolkning**: funktionell överlappning (konsumtionslager, kombinerar flera underliggande objekt, bär styrningsmetadata) är stark, men den terminologiska kopplingen (Data Vault kontra Kimball/IM) är inte dokumenterad i repot — **namnlikhet är inte bevis** |
| Dataprodukt | UI-etikett för `InformationMart`, enligt ADR-0001 | **Verifierat i repositoryt** att detta är dagens beslut; **öppen fråga** om det fortsatt är korrekt givet verksamhetens bredare "exponeras genom DM eller IM"-tanke (se avsnitt 3) |
| DW, rådata/S3, Data Vault, WhereScape-transformationer | Inget repobegrepp | **Verifierat i repositoryt**: saknas helt, i linje med att endast DM och IM ska vara beställningsbara i v1 |

### 1.4 Begreppsmotsägelsen mellan arbetsantagandet och given verksamhetskontext

Given verksamhetskontext anger att **både DM och IM** ska kunna vara beställningsbara
datamängder i första portalversionen. Om observationerna i 1.3 tillämpas rakt av som
arbetsantagandet "DM ≈ `Dataset`, IM ≈ `InformationMart`" uppstår en konsekvens som
måste göras uttrycklig, inte antas bort:

- DM representeras som `Dataset` och visas på datamängdssidan
  (`data-detail.component.ts`, route `/data/:id`).
- IM representeras som `InformationMart`/Dataprodukt och visas på dataproduktsidan
  (`data-product-detail.component.ts`, route `/data/dataprodukt/:id`) — en **separat**
  sida med sitt eget UI-mönster.
- IM representeras **därmed inte** som ett `Dataset`-datamängdsobjekt i dagens modell.
  Det finns ingen "IM-datamängdssida" i repositoryt under detta arbetsantagande —
  `InformationMart` har sin egen, redan existerande detaljsida, skild från
  datamängdssidan.

Om "datamängd" i portalen strikt tolkas som "det objekt som visas på datamängdssidan,
dvs. `Dataset`", avviker detta arbetsantagande alltså från verksamhetskravet att **båda**
DM och IM ska vara beställningsbara datamängder — eftersom IM under antagandet inte är
ett `Dataset`, utan ett separat objekt med egen sida och eget UI-mönster. Nedan redovisas
tre alternativ, neutralt och utan beslut.

#### Alternativ A — DM som Dataset, IM som InformationMart

- DM motsvarar `Dataset`.
- IM motsvarar `InformationMart`/Dataprodukt.
- **Konsekvens:** IM är inte ett `Dataset`-datamängdsobjekt i den nuvarande modellen —
  den syns på dataproduktsidan, inte på datamängdssidan.
- **Avvikelse:** detta avviker från verksamhetskravet att både DM och IM ska vara
  beställningsbara datamängder, om "datamängd" i portalen strikt motsvarar `Dataset`.

#### Alternativ B — både DM och IM som Dataset

- Både DM och IM representeras som `Dataset`.
- `InformationMart`/Dataprodukt är en separat produktpaketering som kan bygga på en
  eller flera datamängder, oavsett om de i sin tur är DM- eller IM-nivå.
- **Konsekvens:** kan kräva någon form av typ, roll eller teknisk realisering på
  `Dataset` för att skilja en DM-`Dataset` från en IM-`Dataset` (t.ex. för UI, filter
  eller vilka relationer som är relevanta för respektive nivå).
- **Prövning mot ADR-0001:** ADR-0001 reglerar att "Dataprodukt" är UI-namnet för
  `InformationMart` — den tar inte ställning till om `Dataset` kan ha undertyper.
  Alternativ B motsäger alltså inte ADR-0001 direkt, men skulle kräva en ny
  distinktion på `Dataset` som ADR-0001 inte förutsåg eller reglerade. Inget nytt
  parallellt begrepp föreslås — endast en möjlig utökning av `Dataset` självt.

#### Alternativ C — logiskt Dataset med teknisk realisering

- `Dataset` är ett logiskt, beställningsbart katalogobjekt.
- Datamängden kan tekniskt realiseras i DM eller IM (eller på sikt fler nivåer).
- DM och IM blir realiseringsnivåer snarare än separata katalogobjekttyper.
- **Konsekvens:** saknar uttryckligt stöd i dagens modell — `Dataset` har inget fält för
  "teknisk realiseringsnivå" eller motsvarande. Kräver egen analys och beslut före
  implementation.

**Ingen av dessa tre alternativ väljs eller rekommenderas av detta AN.** Arbetsantagandet
"DM ≈ `Dataset`, IM ≈ `InformationMart`" (alternativ A) kan **endast** rekommenderas för
ett efterföljande AB om avvikelsen mot verksamhetskravet (att båda DM och IM ska vara
beställningsbara datamängder) uttryckligen accepteras och dokumenteras av
uppdragsgivaren — inte tillämpas tyst, som en tidigare version av denna rapport
riskerade att göra genom att beskriva en "IM-datamängdssida" som om repositoryt redan
stödjer en sådan. Det gör det inte: det finns bara datamängdssidan (för `Dataset`) och
den separata dataproduktsidan (för `InformationMart`).

Skapa inget nytt parallellt begrepp (t.ex. ett separat `DM`- eller `IM`-TypeScript-objekt)
oavsett vilket alternativ som senare väljs — de befintliga begreppen (`Dataset`,
`InformationMart`) är strukturellt tillräckliga för samtliga tre alternativ, i linje med
`docs/07_AI_Instruktioner.md`s princip om att inte skapa parallella begrepp när ett
befintligt räcker (rad 332–338).

## 2. Relationsklassificering

| Relation | Repobelägg | Klassificering |
| --- | --- | --- |
| IM bygger på en/flera DM | `InformationMart.relatedDatasetIds: string[]` (`information-mart.model.ts` rad 72); verifierat med flera datamängder i `mart-sales-demo.relatedDatasetIds` (5 poster, `information-marts.mock.json` rad 24–30) | **Direkt deklarerad relation** |
| DM används i en/flera IM | Samma fält, läst i motsatt riktning (omvänd uppslagning). Redan implementerat i `data-detail.component.ts` rad 41: `marts.filter(mart => mart.relatedDatasetIds?.includes(dataset.id))` | **Omvänd uppslagning av direkt deklarerad relation** — inte härledd, eftersom det är samma ett-hopps fält bara läst från andra hållet, i linje med uppdragsgivarens precisering |
| IM används direkt av rapport/dashboard | Dubbelt deklarerat: `BusinessApplication.informationMartIds: string[]` (`business-application.model.ts` rad 13) **och** `InformationMart.relatedBusinessApplicationIds?: string[]` (`information-mart.model.ts` rad 73). Båda pekar på samma relation i mockdata, t.ex. `mart-sales-demo.relatedBusinessApplicationIds = ["bi-app-sales-dashboard-demo"]` och `bi-app-sales-dashboard-demo.informationMartIds = ["mart-sales-demo"]` | **Direkt deklarerad relation, men dubbellagrad** — se avsnitt 4 |
| DM används direkt av rapport/dashboard (dagens nuläge) | `BusinessApplication` har inget fält mot `Dataset` (`business-application.model.ts`, fullständigt granskad) | **Saknar modellstöd** |
| DM används indirekt av dashboard via IM | Beräknad i `data-detail.component.ts` rad 42–44: filter över `marts` (som redan är en omvänd uppslagning) kombinerat med `app.informationMartIds.includes(mart.id)` — två separata uppslagningssteg | **Härledd relation, två hopp** |

**Ytterligare observation (traverseringsinkonsekvens, ej efterfrågad i scope men
relevant för avsnitt 4):** `data-product-detail.component.ts` rad 42 hämtar
BI-tillämpningar via `catalog.getBusinessApplicationsByIds(product.relatedBusinessApplicationIds ?? [])`
— dvs. **framåtriktat, direkt** via `InformationMart`s eget fält. `data-detail.component.ts`
hämtar samma i praktiken via en **härledd, omvänd** väg genom `BusinessApplication.informationMartIds`.
Detta är två olika traverseringsstrategier för vad som i mockdata är en och samma
deklarerade relation — en konsekvens av dubbellagringen i avsnitt 4, inte ett fel i sig
eftersom dagens mockdata råkar vara konsekvent åt båda hållen.

### Bör en första version strikt visa endast direkta relationer?

**Rekommendation:** ja. Given verksamhetskontext säger att rapporter/dashboards *idag*
kan konsumera DM direkt, men repositoryt har **inget modellstöd** för att uttrycka den
relationen (se tabellen ovan). Att införa stöd för den skulle kräva ett nytt fält på
`BusinessApplication` (eller motsvarande), vilket är en informationsmodelländring utanför
detta AN:s och ett efterföljande, litet ABs troliga scope. En strikt "endast direkta
relationer"-avgränsning i första versionen innebär konkret, under arbetsantagandet i
alternativ A (avsnitt 1.4) — DM som `Dataset`, IM som `InformationMart` — och med
avvikelsen mot verksamhetskravet uttryckligen accepterad (se avsnitt 1.4):

- Dataproduktsidan (för IM/`InformationMart`) visar redan i dag "Bygger på datamängder"
  (DM:ar/`Dataset` den bygger på, direkt) och "Används av dashboards/rapporter"
  (rapporter/dashboards som använder den, direkt) — detta kräver ingen ny
  implementation, bara eventuell konsekvensjustering beroende på avsnitt 4:s
  ägarskapsfråga.
- Datamängdssidan (för DM/`Dataset`) kan, genom omvänd uppslagning, visa vilka
  IM:ar/`InformationMart`-poster som bygger på den — **detta är fortsatt en direkt
  relation enligt uppdragsgivarens precisering, inte härledd**, trots att den läses i
  motsatt riktning mot det lagrade fältet.
- Datamängdssidan visar **inte** vilka rapporter/dashboards som indirekt använder den
  via en IM (2 hopp, härlett) — och visar inte heller direkt DM→rapport-konsumtion,
  eftersom modellen saknar stöd för det. Se avsnitt 7 för hur denna begränsning bör
  kommuniceras i UI utan att vilseleda om vad vyn täcker.

## 3. Dataprodukt, datamängd och IM — tolkningsalternativ

Jämförelse: ADR-0001 binder "Dataprodukt" strikt till `InformationMart`. Verksamhetens
preliminära tanke är att en dataprodukt är "det som exponeras genom DM eller IM" — en
potentiellt bredare definition.

Detta är en **separat beslutsaxel** från alternativ A/B/C i avsnitt 1.4 (som gäller om
`Dataset` kan representera DM, IM eller båda). Alternativen 1–3 nedan gäller specifikt
dataproduktbegreppets räckvidd, givet vilket A/B/C-alternativ som senare väljs.

| Alternativ | Beskrivning | Konsekvens för datamängdssidan |
| --- | --- | --- |
| **1. Oförändrad bindning (ADR-0001 kvarstår)** | Dataprodukt = alltid `InformationMart`; en DM-nivå-`Dataset` kallas eller visas aldrig "Dataprodukt" | Enklast, ingen ADR-ändring. En DM som exponeras direkt till en rapport (utan IM-lager) skulle sakna ett "dataprodukt"-uttryck i UI:t, trots att verksamheten kan uppleva den som en produkt |
| **2. Bredare dataproduktbegrepp** | Dataprodukt = "det som exponeras", vilket kan vara antingen ett `Dataset` (DM) eller en `InformationMart` (IM), beroende på om den har produktegenskaper (ägare, dokumentation, kvalitet) | Kräver att ADR-0001 omprövas eller kompletteras — **inte föreslaget genomfört av detta AN**, bara identifierat som alternativ |
| **3. Oförändrad bindning, men uttrycklig avgränsning dokumenterad** | Dataprodukt = `InformationMart`, men dokumentationen förtydligar uttryckligen att en DM som ännu inte har ett IM-lager ovanför sig medvetet **inte** kallas dataprodukt i denna version — en känd, tillfällig begränsning snarare än en modellbrist | Minsta ändring (endast dokumentationsprecisering, inte kod), löser inte den bredare frågan men gör avgränsningen synlig och medveten i stället för tyst |

Ingen av dessa tre rekommenderas som beslut av detta AN. Alternativ 3 kräver minst
ändring och är den som bäst är förenlig med kravet att inte fatta produkt-/
arkitekturbeslut utan stöd i given kontext eller befintlig dokumentation — men valet är
en produktfråga, se avsnitt 9.

**Kan flera datamängder ingå i samma dataprodukt?** Ja, **verifierat**:
`InformationMart.relatedDatasetIds` är en array, och `mart-sales-demo` refererar fem
separata `Dataset`-poster (`information-marts.mock.json` rad 24–30).

**Kan en datamängd ingå i flera dataprodukter?** Ja, **verifierat**:
`dataset-customer-register-demo` förekommer både i `mart-sales-demo.relatedDatasetIds`
och `mart-customer-demo.relatedDatasetIds` (`information-marts.mock.json` rad 28, 61).

**Finns tecken på att dataprodukten är ett förvaltat erbjudande snarare än bara en
teknisk vy?** Ja, **verifierat**: `owner`, `ownerTeamId`, `documentationUrlKey` och hela
`trust`-strukturen (dokumentationsgrad, kvalitetskontroller, ägarskap, lineage-signal,
senaste granskning) finns bara på `InformationMart`, inte på `Dataset`
(`information-mart.model.ts` rad 38–48, 63–71). Detta stödjer att `InformationMart`
redan idag är modellerad som ett förvaltat erbjudande, i linje med ADR-0001s egen
motivering (data mesh/data-as-a-product-referenser, ADR-0001 rad 144–147).

## 4. Relationens ägarskap — dubbellagringen

**Nuläge (Verifierat i repositoryt):** relationen mellan en `InformationMart` och en
`BusinessApplication` är deklarerad på båda objekten samtidigt:
`InformationMart.relatedBusinessApplicationIds` och
`BusinessApplication.informationMartIds`. I dagens fyra mockposter i
`business-applications.mock.json` och fyra poster i `information-marts.mock.json` är de
två fälten konsekventa sinsemellan (ingen motsägelse hittades vid genomläsning), men
**inget i modellen, dokumentationen eller koden hindrar att de driver isär** — det finns
ingen validering motsvarande `data-classification-validation.ts` som kontrollerar att de
två fälten är ömsesidigt konsekventa.

**Konsekvenser om detta lämnas åtgärdat:**
- Framtida mockdataändringar (t.ex. en ny BI-tillämpning som läggs till av en
  utvecklare som bara uppdaterar det ena fältet) kan tyst skapa en relation som bara syns
  från ett håll — `data-product-detail` (som läser `InformationMart`s eget fält) och
  `data-detail` (som härleder via `BusinessApplication`s fält, se avsnitt 2) skulle då
  visa olika resultat för samma verkliga relation.
- Ingen tydlig "källa till sanningen" gör kod-granskning och framtida
  UI-konsekvens svårare att resonera om.

**Möjliga principer (redovisas, inget val görs här):**
1. **`InformationMart` äger relationen** (`relatedBusinessApplicationIds` är sanningen);
   `BusinessApplication.informationMartIds` blir härlett/beräknat vid behov, inte lagrat.
   Motivering: `InformationMart` är den "rikare", styrningsbärande sidan av relationen
   (ägare, dokumentation, kvalitet) — naturligt att den deklarerar vad den exponeras
   genom.
2. **`BusinessApplication` äger relationen** (`informationMartIds` är sanningen);
   `InformationMart.relatedBusinessApplicationIds` blir härlett. Motivering: en
   BI-tillämpning "vet" vilka källor den konsumerar, symmetriskt med hur andra
   konsumtionsobjekt i modellen (t.ex. `DataService.relatedDatasetIds`) redan pekar
   framåt mot det de konsumerar.
3. **Behåll dubbellagring, men lägg till validering** liknande
   `data-classification-validation.ts`-mönstret, som vid inläsning kontrollerar att de
   två fälten är ömsesidigt konsekventa och larmar annars.

**Tydligare, fortsatt icke-beslutad rekommendation:** `BusinessApplication.informationMartIds`
(princip 2) är en rimlig kandidat till ägare av konsumtionsrelationen. Motivering:
konsumenten (BI-tillämpningen) deklarerar vilka informationsprodukter eller datakällor
den använder — samma riktning som redan används av andra konsumtionsobjekt i modellen,
t.ex. `DataService.relatedDatasetIds`, där ett konsumtionsobjekt pekar framåt mot det det
konsumerar. Den omvända vyn ("InformationMart används av BusinessApplication", dvs.
dagens `InformationMart.relatedBusinessApplicationIds`) skulle då kunna beräknas/härledas
i stället för att lagras separat. Samma konsumentriktning är dessutom lättare att utöka
om en direkt DM→rapport-relation senare ska modelleras (den relation som avsnitt 2
konstaterar helt saknar modellstöd i dag) — det skulle bara innebära att lägga till ett
nytt fält på `BusinessApplication` i samma mönster, inte att införa en ny
relationsriktning.

**Repobelägg som talar mot denna rekommendation:** `InformationMart` är redan i dag den
styrningsbärande, "rikare" sidan av andra relationer i modellen — `relatedDatasetIds`
gör att `InformationMart` pekar mot de datamängder den bygger på, inte tvärtom. Om
`InformationMart` konsekvent ska vara den sida som deklarerar sina egna relationer talar
det för princip 1 (`InformationMart` äger) i stället, för ett enhetligt mönster inom
objektet självt. `data-product-detail.component.ts` rad 42 använder redan i dag
`InformationMart.relatedBusinessApplicationIds` direkt — att flytta ägarskapet till
`BusinessApplication` skulle kräva att den komponenten ändras till en omvänd
uppslagning i stället, en känd konsekvens, inte i sig ett avgörande hinder.

En av principerna 1–3 bör beslutas explicit innan ett efterföljande AB bygger vidare på
relationen, eftersom valet påverkar vilken traverseringskod som är "den kanoniska" och
vilken som är en bekvämlighetsgenväg. Denna analys lutar nu mot princip 2 som en rimlig
kandidat, men **fattar inget beslut och ändrar ingen modell** — detta är en
informationsmodellsfråga för uppdragsgivaren, avgränsad exakt till denna relation, i
linje med kravet att inte bredda till en generell relationsrefaktorering.

## 5. Bedömning av dokumentationsuppföljning

`docs/project/DOCUMENT_INDEX.md`s Situation Guide anger att en "concept/information-model
or user-terminology change" kräver ett ADR (rad 53). Två delvis sammanlänkade men
separata beslutsaxlar avgör om detta blir aktuellt:

**A) Vilket av alternativen A/B/C (avsnitt 1.4) väljs, för hur `Dataset` förhåller sig
till DM och IM:**

- **Alternativ A** (DM som `Dataset`, IM som `InformationMart`, med avvikelsen mot
  verksamhetskravet uttryckligen accepterad och dokumenterad) ändrar ingen
  informationsmodell — bara en dokumenterad avgränsning. Räcker sannolikt med en kort
  notis i `docs/project/DECISIONS.md`.
- **Alternativ B** (både DM och IM som `Dataset`, med ny typ/roll/realisering) är en
  informationsmodelländring (nytt fält eller ny distinktion på `Dataset`) och talar,
  enligt `DOCUMENT_INDEX.md`s egen regel, för ett nytt eller kompletterande ADR.
- **Alternativ C** (logiskt `Dataset` med teknisk realisering) omdefinierar vad
  `Dataset` principiellt representerar och talar starkast för ett ADR av de tre.

**B) Vilket av alternativen 1/2/3 (avsnitt 3) väljs, för dataproduktbegreppets
räckvidd:**

- **Alternativ 1 eller 3** — dataprodukt förblir strikt bunden till `InformationMart`,
  ADR-0001s beslut ändras inte — räcker sannolikt med en kort notis i
  `docs/project/DECISIONS.md`. Detta är **inte** en ändring av ett tidigare ADR-beslut,
  bara en precisering av hur det tillämpas mot ny verksamhetskontext.
- **Alternativ 2** — dataproduktbegreppet breddas till att kunna omfatta en
  DM-nivå-`Dataset` — är en informationsmodell-/terminologiändring som enligt
  `DOCUMENT_INDEX.md`s egen regel bör gå genom ett nytt eller kompletterande ADR
  (t.ex. ADR-0007), inte bara en `DECISIONS.md`-notis.

**Oavsett utfall på A) och B)** bedöms dubbellagringsfrågan (avsnitt 4) **inte** kräva
ett eget ADR — det är en mindre, avgränsad modellprecisering (vilket fält är källan)
snarare än ett begreppsbeslut. En kort rad i work item-beskrivningen för ett
efterföljande AB, eller en `DECISIONS.md`-notis, bedöms tillräcklig.

En precisering av `docs/03_Informationsmodell.md` (t.ex. att uttryckligen dokumentera
vilket A/B/C-alternativ som gäller som arbetsantagande) kan vara värdefull oavsett
utfall, men är en dokumentationsuppdatering snarare än ett ADR-krävande beslut i sig.

**Sammanfattad rekommendation:** invänta uppdragsgivarens beslut på båda axlarna (A/B/C i
avsnitt 1.4, och 1/2/3 i avsnitt 3) samt ägarskapsprincipen (avsnitt 4) innan det
slutgiltigt avgörs om ett ADR krävs. Denna analys identifierar **ingen ytterligare
repoanalys** som skulle klargöra frågorna vidare — det som återstår är uttryckliga
uppdragsgivarbeslut, inte mer läsning eller granskning av repositoryt (se avsnitt 9 och
Disposition nedan). Om det minst brytande utfallet väljs på båda axlarna (alternativ A
och alternativ 1/3) räcker en `DECISIONS.md`-notis och en mindre precisering av
`docs/03_Informationsmodell.md`. Denna analys **rekommenderar inte** ett ADR som
obligatoriskt nästa steg, men utesluter det inte heller om uppdragsgivaren väljer ett
bredare alternativ på någon av axlarna.

## 6. Föreslaget scope för ett efterföljande AB

Under arbetsantagandet i alternativ A (avsnitt 1.4) — DM som `Dataset`, IM som
`InformationMart`/Dataprodukt — gäller att:

- datamängdssidan (`data-detail`) visar DM/`Dataset`,
- föregående DW- eller Data Vault-nivå (bakom DM) saknar modellstöd,
- "Bygger på" för `InformationMart` finns redan på dataproduktsidan,
- datamängdssidan kan genom omvänd uppslagning visa vilka `InformationMart`-poster som
  bygger på aktuell `Dataset`.

Möjlig uppföljning delas därför upp i två nivåer, beroende på vilket alternativ (avsnitt
1.4) uppdragsgivaren väljer.

### 6.1 Minsta AB utan informationsmodellsändring (om alternativ A väljs, avvikelsen
accepterad)

Ett litet frontend- och mockmetadata-AB kan begränsas till:

- renodla eller skapa sektionen "Används i" på datamängdssidan,
- visa endast `InformationMart`/dataprodukter som direkt bygger på aktuell `Dataset`,
- behandla omvänd uppslagning som presentation av samma direkta relation, inte som en ny,
  härledd relationstyp,
- exkludera dashboards och rapporter som endast nås via två hopp (via en IM),
- behålla dataproduktsidans befintliga "Bygger på datamängder" och "Används av
  dashboards/rapporter" oförändrade,
- centralisera relevant uppslagningslogik i `DataCatalogService`, i stället för att
  duplicera den i komponentkod (se traverseringsinkonsekvensen i avsnitt 2),
- lägga till tester för relationsklassificering (att omvänd uppslagning ger korrekt
  resultat, att härledda 2-hoppsrelationer medvetet exkluderas) och för presentation,
  samt tydliga tomlägen, inklusive UI-texten i avsnitt 7 om vad vyn medvetet inte täcker.

**Vilka beslut krävs innan minsta AB kan avgränsas, och vilka är separata:**

- **Krävs före minsta AB:** beslut om alternativ A/B/C (avsnitt 1.4) för hur `Dataset`
  förhåller sig till DM och IM — minsta AB förutsätter uttryckligen alternativ A.
- **Krävs före minsta AB:** beslut om dataproduktalternativ 1/2/3 (avsnitt 3) för
  dataproduktbegreppets räckvidd — detta avgör hur `InformationMart`-poster ska benämnas
  och förstås i UI:t (som "Dataprodukt" eller inte) när de visas i den nya "Används
  i"-sektionen, och kan därför inte lämnas obeslutat.
- **Krävs INTE före minsta AB:** ägarskapsprincipen (avsnitt 4) för relationen mellan
  `InformationMart` och `BusinessApplication`. Minsta AB rör bara
  `InformationMart.relatedDatasetIds` (Dataset↔InformationMart), inte relationen mellan
  `InformationMart` och `BusinessApplication` — så länge AB:t inte ändrar
  dataproduktsidans befintliga "Används av dashboards/rapporter"-sektion, den
  dubbellagrade BI-relationen, eller inför stöd för direkt DM→rapport/dashboard-
  konsumtion. `data-product-detail` och `data-detail` kan fortsätta använda sina
  nuvarande, inbördes olika traverseringsvägar för den relationen oförändrat.
- Ägarskapsprincipen **måste** dock beslutas separat, före ett senare arbete som ändrar
  eller bygger vidare på just `InformationMart`–`BusinessApplication`-relationen (t.ex.
  om dataproduktsidans "Används av"-sektion refaktoreras, om en centraliserad
  servicemetod för den relationen skapas, eller om direkt DM→rapport-konsumtion senare
  modelleras och behöver samma mönster).

### 6.2 Större AB efter informationsmodellsbeslut (om alternativ B eller C väljs)

Blir aktuellt **endast** om uppdragsgivaren väljer alternativ B eller C (avsnitt 1.4) —
dvs. om både DM och IM ska representeras som datamängder på samma typ av datamängdssida.
Kan då omfatta:

- "Bygger på",
- "Används i",
- skillnad mellan DM- och IM-baserade datamängder (typ, roll eller realiseringsfält på
  `Dataset`),
- eventuella mindre modelljusteringar.

Detta kräver först ett beslut om hur `Dataset`, `InformationMart`, Dataprodukt, DM och IM
förhåller sig (avsnitt 1.4). **Denna analys rekommenderar inte det större alternativet
som genomförbart med oförändrad modell** — det är uttryckligen beroende av ett
föregående, separat beslut, inte en variant av 6.1 som kan påbörjas direkt.

**Uttryckligen utanför båda ABs scope:** breddning av dataproduktbegreppet (alternativ 2,
avsnitt 3) utan föregående beslut, direkt DM→rapport-relation (saknar modellstöd, se
avsnitt 2) utan föregående beslut, all integration mot OpenMetadata/WhereScape/Trino, och
full lineage.

## 7. Preliminärt UI-förslag för den begränsade vyn (arbetsmaterial)

Given verksamhetskontext säger att rapporter och dashboards **i dag** kan konsumera DM
direkt, men avsnitt 2 konstaterar att repositoryt saknar modellstöd för att uttrycka
`DM/Dataset → BusinessApplication`. Om denna relation utesluts ur en första version (se
avsnitt 2 och 6.1) får UI-texten **inte** antyda att portalen visar all direkt
användning, och inte heller att datamängden saknar all användning när den faktiskt
används direkt av en rapport utanför vad vyn täcker.

Följande är **arbetsmaterial, inte beslutade UI-texter**:

- **Hjälptext för "Används i":**
  > "Visar registrerade dataprodukter som bygger direkt på datamängden. Direkt
  > användning i rapporter och dashboards ingår ännu inte i denna vy."
- **Tomläge:** ska beskriva att ingen sådan **registrerad relation** finns — inte att
  datamängden saknar all användning. Exempel:
  > "Ingen dataprodukt är registrerad som direkt byggd på denna datamängd i denna
  > mockup."

Denna distinktion (registrerad relation kontra faktisk användning) gäller genomgående
för första versionens samtliga tomlägen, inte bara detta specifika fall, eftersom
modellen redan i grunden bara kan uttrycka *registrerade* relationer, aldrig
verifierad, fullständig användning.

## 8. Framtida verifieringshypotes: lokal SQL-POC (endast kort omnämnande)

En separat, planerad lokal POC nämndes av uppdragsgivaren som framtida sammanhang — inte
som en del av detta AN:s analys eller implementation. Den är konceptuellt: fiktiv DM
Göteborg + fiktiv DM Stockholm → fiktiv IM Regional väderöversikt.

Ett efterföljande, separat lokalt POC-scenario kan använda fiktiva DM- och IM-vyer i SQL
Server för datapreview, genom den befintliga lokala `.NET Web API`-POC:n (AB-027), medan
relationerna "Bygger på" och "Används i" fortsatt registreras som deklarerad
portalmetadata, separat från SQL-vyerna. Förekomsten av SQL-vyer eller fungerande
dataåtkomst för preview ska **inte** behandlas som verifierad metadata eller lineage —
det förblir en dataåtkomst-POC, i linje med AN-010s tidigare klassificering av
motsvarande tidigare POC.

Detta AN utformar inga SQL-vyer, inget API-kontrakt, ändrar ingen backend, skapar ingen
mockdata för denna POC och implementerar den inte. Detta avsnitt registrerar enbart en
framtida verifieringshypotes för sammanhang — det är inte en ny analysfråga och kräver
ingen fortsatt analys i detta AN.

## 9. Kvarstående produkt- och arkitekturfrågor

**Produktfrågor (kräver uppdragsgivarbeslut — inget ytterligare repoanalys identifierat
för dessa, se Disposition nedan):**
- Vilket av alternativen A/B/C (avsnitt 1.4) ska gälla för hur `Dataset` förhåller sig
  till DM och IM — och, om alternativ A väljs, accepteras då uttryckligen att detta
  avviker från verksamhetskravet att både DM och IM ska vara beställningsbara
  datamängder?
- Vilket tolkningsalternativ (avsnitt 3, 1–3) ska gälla för dataproduktbegreppets
  räckvidd relativt DM/IM — en separat men relaterad fråga till A/B/C ovan?
- Ska en direkt DM→rapport-relation (dagens verksamhetsnuläge) modelleras alls i en
  första version, eller medvetet uteslutas tills IM-only är målbild (se avsnitt 7 för
  hur uteslutningen bör kommuniceras i UI)?

**Informationsmodellsfrågor:**
- Vilken ägarskapsprincip (avsnitt 4, 1–3) ska gälla för
  `InformationMart`↔`BusinessApplication`-relationen? Denna analys lutar mot princip 2
  (`BusinessApplication` äger) men fattar inget beslut.
- Behövs på sikt ett typfält på `Dataset` för att skilja DM-nivå, IM-nivå och ett
  eventuellt råskiktsobjekt (relevant främst om alternativ B eller C väljs), eller är
  detta onödigt givet att endast DM/IM ska vara beställningsbara i v1?

**Arkitekturfrågor (uttryckligen utanför detta AN, men bör vara medvetna inför
implementation):**
- Ska relationsdata ("Bygger på"/"Används i") fortsätta vara ren, portalägd
  mockdata/metadata, eller på sikt konsumeras via en backendadapter (`.NET Web API`) mot
  en auktoritativ källa? Ingen del av denna fråga besvaras här — den ligger bortom detta
  AN:s scope och kräver separat beslut, i linje med AN-010s tidigare slutsatser om
  metadata/lineage.

**Uttryckligen kvar utanför all vidare analys i detta spår (bekräftat av given kontext,
inte omprövat):** full lineage över hela kedjan, OpenMetadata- och WhereScape-integration,
kolumn-/fältnivålineage, den planerade lokala SQL-POC:n (avsnitt 8, endast registrerad
som framtida hypotes).

## Sammanfattning

Repositoryts `Dataset` och `InformationMart` är strukturellt tillräckliga för att bära
ett litet, direkt relationsutsnitt motsvarande verksamhetens DM→IM→rapport/dashboard-kedja
— men **endast** under ett av tre uttryckligt redovisade alternativ (A/B/C, avsnitt 1.4)
för hur `Dataset` förhåller sig till DM och IM. Det enklaste alternativet (A: DM som
`Dataset`, IM som `InformationMart`) innebär att IM **inte** blir ett
`Dataset`-datamängdsobjekt i dagens modell, vilket avviker från verksamhetskravet att
både DM och IM ska vara beställningsbara datamängder — en avvikelse som måste accepteras
och dokumenteras uttryckligen, inte antas bort. Alternativ B och C kräver i stället en
informationsmodelländring innan de kan realiseras.

Den enda relationen som helt saknar modellstöd, oavsett alternativ, är direkt
DM→rapport-konsumtion (dagens verksamhetsnuläge) — detta bör medvetet uteslutas eller
separat beslutas, inte tystas ihjäl, och UI-texten för en första version måste vara
tydlig om att den bara visar registrerade relationer, inte all faktisk användning (se
avsnitt 7).

Tre separata beslutspunkter identifieras: **(1)** alternativ A/B/C (avsnitt 1.4) för hur
`Dataset` förhåller sig till DM och IM, **(2)** dataproduktalternativ 1/2/3 (avsnitt 3)
för dataproduktbegreppets räckvidd, och **(3)** ägarskapsprincipen (avsnitt 4) för
relationen mellan `InformationMart` och `BusinessApplication`. Beslutspunkt 1 och 2
**blockerar** ett minsta, mockbaserat frontend-AB (avsnitt 6.1) — AB:t förutsätter
alternativ A, och behöver ett beslutat dataproduktalternativ för att veta hur
`InformationMart`-poster ska benämnas i UI:t. Beslutspunkt 3 blockerar **inte** minsta
AB, eftersom det AB:t bara rör `InformationMart.relatedDatasetIds`
(Dataset↔InformationMart), en annan relation än den dubbellagrade
InformationMart–BusinessApplication-relationen — men beslutspunkt 3 måste ändå avgöras
separat, före ett senare arbete som ändrar eller bygger vidare på just den relationen.
Denna analys lutar mot att `BusinessApplication` äger relationen, men fattar inget
beslut. Inget ADR bedöms obligatoriskt om det minst brytande utfallet väljs på
beslutspunkt 1 och 2 (alternativ A och alternativ 1/3); en `DECISIONS.md`-notis och en
mindre precisering av `docs/03_Informationsmodell.md` bedöms då tillräckliga. Ett litet,
mockbaserat frontend-AB (avsnitt 6.1) bedöms möjligt att avgränsa så snart
beslutspunkt 1 och 2 är beslutade; ett större AB (avsnitt 6.2) blir aktuellt bara om
alternativ B eller C väljs på beslutspunkt 1. En separat, planerad lokal SQL-POC
(avsnitt 8) registreras endast som framtida sammanhang, inte som del av detta AN.

Primary topic: data-catalog
Secondary topics: documentation, information-model
Disposition: needs_more_analysis
Disposition note: AN-011:s analys är genomförd; ingen ytterligare repoanalys har identifierats som skulle klargöra frågorna vidare. Vad som återstår är tre uttryckliga, separata uppdragsgivarbeslut: (1) vilket alternativ A/B/C (avsnitt 1.4) som ska gälla för hur Dataset förhåller sig till DM och IM; (2) vilket alternativ 1/2/3 (avsnitt 3) som ska gälla för dataproduktbegreppets räckvidd; och (3) vilken sida som ska äga relationen mellan InformationMart och BusinessApplication (avsnitt 4). Beslut 1 och 2 blockerar avgränsningen av ett minsta, mockbaserat frontend-AB (avsnitt 6.1). Beslut 3 blockerar inte minsta AB — det rör en annan relation (InformationMart–BusinessApplication) än den minsta AB:t bygger på (InformationMart.relatedDatasetIds) — men måste beslutas separat, före ett senare arbete som ändrar eller bygger vidare på just den relationen. "needs_more_analysis" är det närmast tillgängliga registrerade Disposition-värdet (repositoryts vokabulär, scripts/project-administration/topic-convention.ts, innehåller inget "ready_for_decision" eller "decision_needed"); det ska läsas som "väntar på uttryckliga uppdragsgivarbeslut", inte som att ytterligare repoanalys återstår.
Follow-up: Litet, mockbaserat AB (avsnitt 6.1) för datamängdssidans "Används i"-sektion, begränsat till direkta relationer, när beslutspunkt 1 (alternativ A/B/C) och beslutspunkt 2 (dataproduktalternativ 1/2/3) är beslutade — beslutspunkt 3 (ägarskapsprincip) blockerar inte detta AB. Ett större AB (avsnitt 6.2) blir aktuellt först om alternativ B eller C väljs på beslutspunkt 1. Ägarskapsprincipen (beslutspunkt 3) bör beslutas separat, före ett senare arbete som ändrar eller bygger vidare på InformationMart–BusinessApplication-relationen specifikt. Möjlig DECISIONS.md-notis och mindre precisering av docs/03_Informationsmodell.md om det minst brytande utfallet väljs på beslutspunkt 1 och 2. Möjligt nytt/kompletterande ADR endast om alternativ B/C (avsnitt 1.4) eller det bredare dataproduktalternativet 2 (avsnitt 3) väljs. Den planerade lokala SQL-POC:n (avsnitt 8) är en separat, framtida hypotes, inte en del av denna uppföljning.
