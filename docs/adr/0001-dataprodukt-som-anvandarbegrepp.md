# ADR-0001: Dataprodukt som primärt användarbegrepp för Information Mart

## Status

Accepterad

## Datum

2026-07-05

## Beslutsfattare

Projektägaren för Data- och analysportalen, via arbetsuppdrag AB-003.

## Kontext

Mockupen har hittills använt begreppet **Information Mart** i flera användarnära vyer:
sökresultat, filter, previewpanelen och Data & katalog-sidan (`docs/03_Informationsmodell.md`,
avsnittet om `InformationMart`). Information Mart är ett Data Vault 2.0-begrepp för det
leveranslager i arkitekturen som paketerar data för konsumtion.

Efter diskussion har projektägaren bedömt att det är för tekniskt för portalens bredare
målgrupper – verksamhetsanvändare, beställare och analytiker som vill hitta och förstå
data, inte nödvändigtvis förstå Data Vault-lagerarkitektur. Portalens grundprincip är att
strukturera navigation och sök utifrån användarens behov, inte utifrån bakomliggande
teknik (`docs/00_Projektprinciper.md`, `docs/03_Informationsmodell.md`).

Portalen behöver samtidigt kunna stödja tekniskt kunniga användare (data engineers,
förvaltare, granskare) som vill veta hur en dataprodukt faktiskt är implementerad.

## Beslut

Portalen inför följande begreppsmodell:

- **Datamängd** används för en bred, upptäckbar datatillgång eller ett byggblock – kan
  komma direkt från ett källsystem eller vara bearbetad, och kan ingå i flera
  dataprodukter.
- **Dataprodukt** används som primär användarterm för en ägd, dokumenterad,
  kvalitetssäkrad och konsumtionsbar datapaketering med tydligt syfte, målgrupp och
  ansvar. En dataprodukt kan bygga på flera datamängder.
- **Information Mart** behålls som teknisk implementation/arkitekturmetadata, särskilt
  relevant i Data Vault-sammanhang. Den ska inte längre vara primär användarterm i UI,
  sök, filter eller detaljrubriker, men visas som sekundär, tydligt märkt teknisk
  information (t.ex. "Teknisk implementation: Information Mart") där det är relevant för
  en teknisk användare.
- **Dashboard / Rapport / BI-tillämpning** hålls separata begrepp från dataprodukter: de
  är färdiga visualiseringar eller applikationer som konsumerar en eller flera
  dataprodukter/datamängder, med egna åtkomst- och beställningsvägar.

Konkret innebär detta:

- UI, filter, sökresultat och detaljsidor ska använda **Dataprodukt** som synlig typ och
  rubrik.
- Teknisk metadata kan visa **"Implementerad som: Information Mart"** eller motsvarande,
  normalt under en sekundär/teknisk sektion (t.ex. "Tekniska detaljer").
- Dokumentation och mockdata ska följa samma begrepp och samma relationskedja:
  källsystem → datamängd → dataprodukt → dashboard/rapport/BI-tillämpning.
- Kvalitet och tillit för en dataprodukt visas som styrnings- och kvalitetssignaler
  (tillitsnivå, dokumentationsgrad, kvalitetskontroller, ägarskap, lineage, klassning,
  senaste granskning) snarare än som en ensam teknisk term eller ett enda procenttal.

Detta beslut ändrar **inte** underliggande TypeScript-interface, modell- eller
mockfilnamn (`InformationMart`, `information-mart.model.ts`,
`information-marts.mock.json`, fältnamn som `informationMartIds` och
`relatedInformationMartId`). Dessa förblir interna, tekniska identifierare eftersom en
sådan omdöpning skulle vara en betydligt större, mer riskfylld refaktorering utan
motsvarande nytta för användarupplevelsen (se "Alternativ som övervägdes").

## Alternativ som övervägdes

### Alternativ 1: Byt endast användartext, behåll Information Mart som synlig sekundär rubrik överallt

Fortsätt visa "Information Mart" som synlig etikett, men lägg till en kort förklarande
text om vad det betyder.

Fördelar:

- Minimal ändring.
- Ingen risk för begreppsförvirring mellan "Dataprodukt" och "Information Mart".

Nackdelar:

- Löser inte det egentliga problemet: användaren möter fortfarande ett Data
  Vault-begrepp som första intryck.
- Motsvarar inte projektägarens uttryckliga beslut.

### Alternativ 2: Fullständig refaktorering till ett nytt `DataProduct`-objekt i informationsmodellen

Inför ett helt nytt informationsobjekt `DataProduct` i modellen, med `InformationMart`
som en av flera möjliga tekniska implementationer (vy, tabellstruktur, API, m.m.), och
byt alla TypeScript-interface, mockfiler och routes i samma iteration.

Fördelar:

- Mest "korrekt" långsiktig modellering – en dataprodukt kan i praktiken implementeras
  på fler sätt än just Information Mart.
- Renodlar begreppen fullt ut i koden, inte bara i UI-text.

Nackdelar:

- Betydligt större ändringsyta: nya modeller, nya mockfiler, migrering av alla
  korsreferenser (`informationMartIds`, `relatedInformationMartId`,
  `relatedDatasetIds` m.fl.) och uppdaterade routes.
- Risk för att bryta redan fungerande vyer (sök, Data & katalog, datamängdsdetalj) som
  byggdes ut i föregående iteration (AB-002).
- Inte nödvändigt för att lösa det uttalade problemet, som är begripligheten i
  användargränssnittet, inte den interna datamodellen.

### Alternativ 3 (valt): Minimal, UI-/metadatadriven ändring med ny detaljsida

Behåll `InformationMart` som internt tekniskt begrepp i modell, mockfiler och service,
men lägg till valfria fält för användarnära metadata (syfte, målgrupp, åtkomst,
aktualitet, tillit, teknisk modelltyp) och en tydlig "teknisk implementation"-etikett.
Byt den synliga typetiketten i sök, filter och rubriker till "Dataprodukt". Skapa en ny,
dedikerad detaljsida för dataprodukten som svarar på användarens frågor (vad, för vem,
bygger på vad, tillit, åtkomst, ansvar, nästa steg) och visar tekniska detaljer separat.

Fördelar:

- Löser det uttalade problemet med minimal risk.
- Bevarar all befintlig funktionalitet och korsreferenser från AB-002.
- Tydlig väg till en eventuell framtida fullständig `DataProduct`-modellering, om det
  senare visar sig nödvändigt.

Nackdelar:

- Den interna datamodellen är fortsatt något inkonsekvent med den nya användarterminologin
  (kod säger `InformationMart`, gränssnittet säger "Dataprodukt"). Detta bedöms vara en
  acceptabel, tydligt dokumenterad avvägning för en mockup i detta skede.

## Motivering

Alternativ 3 valdes eftersom:

- **Säkerhet först och konfiguration före kod** (`docs/00_Projektprinciper.md`)
  förutsätter inte att interna identifierare byts – det är gränssnittet och
  dokumentationen som ska vara begripliga, inte den tekniska koden.
- **Innehåll före implementation** (samma dokument, princip 3): begreppsändringen kan i
  huvudsak lösas med UI-text, ny detaljsida och mockdata snarare än en ny
  informationsmodell.
- Data Vault/Information Mart-litteraturen (se referenser nedan) beskriver Information
  Mart som ett **leverans-/arkitekturlager**, inte som ett konsumentvänt begrepp – vilket
  stödjer att det hör hemma i tekniska detaljer, inte i primär navigation.
- Litteratur om data mesh och data-as-a-product beskriver en dataprodukt som något med
  tydlig ägare, dokumentation, kvalitet och konsumtionsgränssnitt – vilket matchar
  portalens behov av ett användarvänligt, ägarskaps- och tillitsorienterat begrepp bättre
  än ett rent tekniskt lagerbegrepp.
- Data marketplace-mönster visar att tillit och åtkomst bör kommuniceras som tydliga
  signaler (certifiering, kvalitet, färskhet) snarare än som ett enda tekniskt ord eller
  en falskt precis procentsats.
- En fullständig ombyggnad till ett nytt `DataProduct`-objekt (alternativ 2) är inte
  nödvändig för att uppnå den efterfrågade användarupplevelsen i detta skede och skulle
  öka risken utan motsvarande nytta – se `docs/06_Utvecklingsprinciper.md` om att undvika
  onödig komplexitet.

## Konsekvenser

### Positiva konsekvenser

- Användare möter ett begripligt begrepp ("Dataprodukt") i sök, filter och detaljsidor
  utan att behöva förstå Data Vault-terminologi.
- Tekniskt kunniga användare kan fortfarande se den faktiska implementationen
  ("Information Mart") som sekundär metadata.
- Tillit och kvalitet kommuniceras som flera begripliga signaler istället för en enda
  teknisk eller falskt exakt siffra.
- Ingen befintlig funktionalitet från AB-002 (sökresultat, previewpanel,
  datamängdsdetalj) behöver byggas om i grunden.

### Negativa konsekvenser eller risker

- Viss begreppsmässig glidning mellan kodnamn (`InformationMart`) och användartext
  ("Dataprodukt") kvarstår internt, vilket kräver att framtida utvecklare läser denna
  ADR för att förstå varför.
- Om portalen senare behöver modellera fler tekniska implementationstyper för en
  dataprodukt (t.ex. vy, API, flat table som egna växlingsbara objekt snarare än ett
  fritextfält) kan en mer genomgripande modellering ändå bli nödvändig.

### Saker att följa upp

- Utvärdera efter denna iteration om en fullständig `DataProduct`-modellering
  (alternativ 2) bör planeras som separat, godkänt arbete.
- Bedöm om motsvarande begreppsstädning behövs för andra tekniska termer som i dag
  förekommer i användarnära text (t.ex. "BI-tillämpning" kontra "Dashboard/Rapport") –
  hölls uttryckligen utanför denna ADR:s omfattning.

## Påverkade delar

- frontend (sök, filter, previewpanel, Data & katalog, datamängdsdetalj, ny
  dataprodukt-detaljsida)
- mockdata (`information-marts.mock.json`, `datasets.mock.json` och relaterade filer)
- informationsmodell (`docs/03_Informationsmodell.md`)
- dokumentation (`docs/project/DECISIONS.md`, `docs/project/DOCUMENT_INDEX.md`)

## Relaterade dokument

- `docs/03_Informationsmodell.md`
- `docs/00_Projektprinciper.md`
- `docs/06_Utvecklingsprinciper.md`
- `docs/project/DECISIONS.md`
- `docs/work-items/AB-003.md`

## Relaterade ADR:er

Inga tidigare ADR:er finns i repositoryt. Detta är ADR-0001.

## Externa referenser

Referenserna stödjer resonemanget ovan men ersätter inte projektets egna begreppsbeslut.
Inga interna länkar eller företagsspecifika värden ingår.

**Data Vault / Information Mart**

- Scalefree: "About Information Marts in Data Vault 2.0 – Part 1"
- Scalefree: Data Vault-ordlista/artikel om Information Mart som leveranslager
  ("delivery layer")

**Data mart / ämnesorienterad mart**

- IBM: "What Is a Data Mart?"

**Data product / data as a product**

- Martin Fowler: "Data Mesh Principles and Logical Architecture"
- dbt Labs: "Key components of data mesh: Creating and managing data products"

**Data marketplace / katalog**

- Collibra: "Data marketplace for trusted data products"
- Collibra: Data Catalog – material om upptäckt (discovery) och åtkomst

**Metadata och kvalitet**

- W3C: "Data Catalog Vocabulary (DCAT) – Version 3"
- W3C: "Data Quality Vocabulary (DQV)"
- IBM: "Data quality dimensions"

## Kommentarer

Denna ADR är den första i repositoryt (`docs/adr/`). Framtida ADR:er ska numreras löpande
enligt `docs/11_ADR_mall.md`.
