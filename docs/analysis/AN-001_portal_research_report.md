# AN-001 – Portalstudie inför nästa mockup

Granskad: 2026-07-04  
Work item: `AN-001`  
Repositoryversion: den lokala arbetskopian i `C:\dev\Portal` den 2026-07-04; arbetskopian innehöll redan ej committade ändringar från `AB-001`.

## 1. Sammanfattning

Nästa mockup bör testa en **behovsstyrd katalogarbetsyta**: en lugn startsida med en framträdande, objektsöverskridande sökfunktion och 6–8 tydliga behovsingångar, följd av katalogvyer och detaljsidor med progressiv fördjupning. Huvudfrågan ska vara **”Vad försöker du göra?”**, inte ”Vilket system vill du använda?”.

Den bästa kombinationen för projektet är:

- NYC Open Datas vägledning för både nybörjare och vana användare;
- data.govs återhållsamma sökstart;
- data.europa.eu:s tematiska utforskning och lärandestöd;
- Backstage/Port/Cortex tydliga ägarskap, relationer, status och nästa åtgärd;
- OpenMetadata/DataHub/Atlan/Collibras metadata, tillitssignaler och förhandsvisning;
- Trafikverkets uppdelning mellan att hitta, förstå och använda data – men utan att göra användaren ansvarig för att först välja teknisk leveransplattform.

Startsidan ska inte vara en komplett katalog. Den ska hjälpa användaren att formulera sitt behov, ge ett fåtal genvägar och visa status/support i korthet. Katalogen ska sedan erbjuda typ, kategori, ägare, livscykel, åtkomst och aktualitet som begripliga filter. Detaljsidan ska först besvara **vad, för vem, tillit och nästa steg**; teknisk metadata, lineage och systemkopplingar ska ligga längre ned eller under flikar.

## 2. Metod

### Underlag

Studien jämförde publika startsidor, katalog- och detaljbeskrivningar, officiell användardokumentation, produktsidor och publika produktbilder. Följande projektunderlag användes: projektvision, informationsmodell, konfigurationsprinciper, utvecklingsprinciper, designsystem/UI, utvecklarguide samt Worksmiths styr- och workflowdokument.

### Verktyg

- Webbsökning och sidextraktion för publika originalsidor och officiell dokumentation.
- Bildsökning för publika produktbilder från främst leverantörernas egna sidor och dokumentation.
- Repositoryts befintliga PowerShell-, `rg`-, npm- och Worksmith-kommandon för kontroll och validering.

Inga paket, extensions eller analysverktyg installerades. `package.json` och lockfiler ändrades inte av analysen.

### Visuell granskning och begränsningar

Den inbyggda interaktiva webbläsaren var inte tillgänglig. Ingen fristående browser installerades eftersom officiella sidor, dokumentation och produktbilder gav tillräckligt underlag för denna designnivå. Därför gjordes ingen säker pixelgranskning, interaktionsmätning eller responsiv testning över flera viewport-storlekar.

`data.trafikverket.se` svarade med ett JavaScript-skal (”Please enable JavaScript”), så dess aktuella visuella gränssnitt kunde inte verifieras direkt. Bedömningen bygger där på den publika portalsidan, Trafikverkets egna informationssidor, den officiella tillgänglighetsredogörelsen och aktuella nyheter om portalens sökfunktion. Kommersiella verktyg utan helt publik demo bedömdes genom officiell dokumentation och produktbilder; leverantörernas effektpåståenden behandlas som produktbeskrivningar, inte oberoende fakta.

Inga screenshots sparades. Därmed finns ingen screenshot-mapp att rensa eller granska.

## 3. Fynd per portal

### 3.1 Trafikverkets Datautbytesportal och publika dataingångar

**Källor:** [Datautbytesportalen](https://data.trafikverket.se/), [Hämta öppen data från Trafikverket](https://www.trafikverket.se/e-tjanster/hamta-data-fran-trafikverket/), [Data, kartor och geodatatjänster](https://bransch.trafikverket.se/tjanster/data-kartor-och-geodatatjanster/), [nyhet om sökning av öppna data](https://bransch.trafikverket.se/tjanster/data-kartor-och-geodatatjanster/nyheter-om-trafikverkets-data/2026/nu-ar-det-lattare-for-vara-kunder-att-soka-efter-trafikverkets-oppna-data/), [Lastkajen](https://lastkajen.trafikverket.se/) och [tillgänglighetsredogörelse](https://bransch.trafikverket.se/om-oss/kontakt/Om-webbplatsen/tillganglighetsredogorelse-for-trafikverket/). Granskade 2026-07-04.

**Kort beskrivning.** Datautbytesportalen är avsedd att hjälpa användare att hitta, förstå och använda Trafikverkets data. Trafikverkets informationssida delar upp leveransen i API för realtidsdata, Datex II för standardiserat trafikinformationsutbyte och Lastkajen för färdiga datapaket eller egna beställningar. Under 2026 har strukturerad metadatasökning lagts till för öppna data.

**Det som fungerar bra.** Syftet ”hitta, förstå och använda” är starkt och användarnära. Informationssidan ger handledning, datamodell, exempel, licens, registrering och kontakt nära respektive kanal. Lastkajen gör två konsumtionssätt begripliga: färdiga paket eller egen kombination/beställning. Den nya metadatasökningen minskar beroendet av att redan känna till produktnamn.

**Det som fungerar mindre bra.** Ingången är fortfarande tydligt uppdelad efter leveransplattform. En ovan användare måste förstå skillnaden mellan API, Datex II och Lastkajen innan uppgiften är löst. Lastkajen börjar med inloggning, vilket skapar friktion innan nyttan syns. Datautbytesportalens JavaScriptberoende gav ingen läsbar fallback. Den officiella tillgänglighetsredogörelsen nämner bland annat brister i landmärken/struktur och avsaknad av sökordsförslag vid misslyckad sökning.

**Relevans och lärdom.** Låna tredelningen *hitta–förstå–använd*, kom-igång-materialet, exempelanvändningsfall och tydlig kontakt. Undvik att låta kanalvalet vara första beslutet. Låt i stället användaren välja exempelvis ”Hitta data till en rapport”, ”Anslut till data programmatiskt” eller ”Beställ ett urval”; visa lämplig plattform först på resultat- eller detaljnivå.

### 3.2 Data.gov

**Källor:** [Data.gov](https://data.gov/), [User Guide](https://data.gov/user-guide/), [Contact/Find and search](https://data.gov/contact/) och [Catalog about](https://catalog.data.gov/about). Granskade 2026-07-04.

**Kort beskrivning.** Nationell metadatakatalog för amerikanska offentliga data. Startsidan domineras av uppdrag, datasetantal och sök, med genvägar till mest visade, nyligen tillagda, organisationer och geodata.

**Det som fungerar bra.** Sökningen är omedelbart begriplig. Startsidan har få konkurrerande val. Katalogen använder filter för geografi, nyckelord, organisation/utgivare och geospatial typ. Detaljsidan skiljer resurser/distributioner, licens/åtkomst, kontakt och metadatahistorik. Dokumentationen är tydlig med att katalogen länkar vidare och inte äger datakvaliteten.

**Det som fungerar mindre bra.** Den federala kataloglogiken och organisationsfiltret förutsätter ofta att användaren vet vem som publicerar informationen. Startsidan hjälper mindre med behovsformulering, lärande och tvärgående tjänster. En stor metadatamängd riskerar att kännas administrativ.

**Relevans och lärdom.** Låna den avskalade sökstarten, resultatsidans typ/filter och den tydliga ansvarsfördelningen. Lägg till behovsbaserade exempel och visa objektstyp i varje sökträff så att tjänst, guide, dataset och beställning inte blandas ihop.

### 3.3 data.europa.eu

**Källa:** [The European Data Portal](https://data.europa.eu/en). Granskad 2026-07-04.

**Kort beskrivning.** Europeisk dataportal som kombinerar datasetsökning med tematiskt innehåll, metadata quality, data stories, utbildning, samarbete, bulkverktyg och publiceringsstöd.

**Det som fungerar bra.** Portalen erbjuder både direkt sök och utforskning. Populära dataset och trendande ämnen sänker tröskeln när användaren inte vet exakt vad den söker. Data stories och Academy hjälper användaren förstå och omsätta data, inte bara hitta filer. Katalogens omfattning kommuniceras tydligt.

**Det som fungerar mindre bra.** Många parallella uppdrag—data, studier, utbildning, nyheter, community och publicering—gör startsidan lång och informationsrik. Datasetkort med bilder kan ge svag visuell signal i förhållande till metadata. Flerspråkighet och många innehållstyper ökar den kognitiva lasten.

**Relevans och lärdom.** Låna kombinationen sök + tema + lärande och idén om kuraterade/populära ingångar. Begränsa startsidan hårdare: 6–8 behov, högst några utvalda resurser och en kompakt statusrad.

### 3.4 NYC Open Data

**Källor:** [NYC Open Data](https://opendata.cityofnewyork.us/), [Data](https://opendata.cityofnewyork.us/data/) och [FAQ](https://opendata.cityofnewyork.us/faq/). Granskade 2026-07-04.

**Kort beskrivning.** Publik stadsdataportal som kombinerar katalogsökning med onboarding, utbildning, API-stöd, projektinspiration, kontakt och utforskning per myndighet eller kategori.

**Det som fungerar bra.** Startsidan gör målgruppssegmenteringen explicit: ”New to Open Data”, ”Data Veterans”, kontakt och ”Dive into the Data”. Sökfältets exempel använder vardagliga ämnen. Kategori, popularitet och nyligen publicerat stödjer igenkänning. Projektgalleriet visar faktisk nytta och ”How To” skapar ett kom-igång-flöde.

**Det som fungerar mindre bra.** Startsidan är mer kampanj-/innehållssajt än tät arbetsyta och användaren skickas vidare till en separat katalogupplevelse. Organisations-/agencyingången är mindre relevant för en portal som uttryckligen ska dölja organisationsstrukturen.

**Relevans och lärdom.** Detta är den starkaste förebilden för att stödja olika erfarenhetsnivåer. Låna ”ny här / jag vet vad jag söker”, vardagliga sökexempel och tydlig support. Byt agencyingång mot behov, datadomän och användningssituation.

### 3.5 Sveriges dataportal – ytterligare modern dataportal

**Källor:** [Data & API:er](https://www.dataportal.se/data-apier), [Kom igång med att dela data](https://www.dataportal.se/dela-data) och [dokumentation om datamängder](https://docs.dataportal.se/catalog/datasets/). Granskade 2026-07-04.

**Kort beskrivning.** Svensk nationell dataportal med data/API:er, begrepp, specifikationer och stöd för både konsumenter och publicerande organisationer.

**Det som fungerar bra.** Portalen förklarar kedjan hitta–förstå–använd och kopplar metadata, begrepp och specifikationer till återanvändning. Dokumentationen visar god metadatahygien: kontakt/ägare, nyckelord, kategori, tid, geografi, åtkomsträttighet och distributioner. ”Utforska API” gör nästa steg konkret.

**Det som fungerar mindre bra.** Konsument- och producentperspektiv ligger nära varandra och kan blanda roller. DCAT- och publiceringsbegrepp är nödvändiga för förvaltare men för tunga som primär användarupplevelse.

**Relevans och lärdom.** Låna kopplingen mellan dataset, distribution, ägare och åtkomst samt tydlig förhandsvisning. Separera konsumentens enkla vy från förvaltarens metadataarbete.

### 3.6 Backstage och Spotify Backstage-exempel

**Källor:** [Software Catalog](https://backstage.io/docs/features/software-catalog/), [Viewing the Catalog](https://backstage.io/docs/next/getting-started/viewing-catalog), [Search](https://backstage.io/docs/features/search/), [Backstage product overview](https://backstage.io/) och [entity relationships](https://backstage.io/docs/getting-started/viewing-entity-relationships/). Granskade 2026-07-04.

**Kort beskrivning.** Öppen developer portal-plattform med software catalog, global sök, TechDocs, mallar/scaffolding, plugins och entitetsrelationer.

**Det som fungerar bra.** Katalogen gör ägare, typ, system, livscykel, beskrivning och taggar konsekventa. Standardvyn ”Owned” och stjärnmärkning ger personlig relevans. Entitetsdetaljen samlar About, relationer, länkar, dokumentation och verktygsstatus. Global sök kan förena katalog och dokumentation. Mallar visar hur en katalog kan leda direkt till nästa handling.

**Det som fungerar mindre bra.** Informationsarkitekturen är byggd för utvecklare och tekniska entiteter. Filter som Kind, Namespace, Component och API kan bli en ny teknisk organisationskarta. Pluginbaserade entitetssidor riskerar många kort, flikar och inkonsekvent informationsdensitet.

**Relevans och lärdom.** Låna ägarskap, livscykel, relationer, favoriter, gemensam detaljstruktur och kopplingen katalog → dokumentation → handling. Undvik Backstages tekniska taxonomi som huvudnavigation; översätt den till användarbehov och visa tekniska relationer först vid fördjupning.

### 3.7 Port.io

**Källor:** [Port overview](https://docs.port.io/), [Catalog page](https://docs.port.io/customize-pages-dashboards-and-plugins/page/catalog-page/) och [praktisk IDP-guide](https://info.port.io/hubfs/The%20Practical%20Guide%20to%20Internal%20Developer%20Portals.pdf). Granskade 2026-07-04.

**Kort beskrivning.** Konfigurerbar developer portal med software catalog, egna datamodeller, sidor/dashboards, sök/filter, självservice, workflows och scorecards.

**Det som fungerar bra.** Katalogtabeller kan filtreras, sorteras, grupperas, spara vyer och dölja irrelevanta kolumner. Självserviceåtgärder knyts till katalogobjekt och kan visa körstatus. Gränssnitt kan anpassas till persona och uppgift. Scorecards gör kvalitet och efterlevnad handlingsbara.

**Det som fungerar mindre bra.** Stor konfigurationsfrihet kan skapa en portal som speglar intern modell snarare än användarbehov. Tabellcentrerade kataloger blir täta och fungerar sämre för nya användare och mobil. Scorecards och dashboards kan dominera innan användaren förstått tjänstens nytta.

**Relevans och lärdom.** Låna sparade/personliga vyer, tydlig åtgärdsstatus och möjligheten att reducera kolumner. I nästa mockup räcker en enkel statisk simulering av ”Mina beställningar” eller senaste behov—inte en full dashboardmotor.

### 3.8 Cortex – ytterligare service portal-koncept

**Källor:** [Catalogs](https://www.cortex.io/products/catalog), [Internal Developer Portal](https://www.cortex.io/post/what-is-an-internal-developer-portal) och [Cortex IDP](https://www.cortex.io/products/cortex-idp). Granskade 2026-07-04.

**Kort beskrivning.** Developer portal/engineering operations-produkt med katalog, ägarskap, beroenden, scorecards, mallar och självservice.

**Det som fungerar bra.** Katalogen behandlas som grund för synlighet och ansvar. Ägare, beroenden, hälsa och dokumentation samlas kring objektet. Scorecards kopplas till konkreta förbättringar och självservice reducerar väntan.

**Det som fungerar mindre bra.** Produktspråket och mognadsmätningen är utvecklar-/ledningscentrerade. En sådan startpunkt skulle överstyra detta projekts bredare målgrupper och behov.

**Relevans och lärdom.** Låna kompakt ansvar + status + beroende på detaljsidan och tanken att varje avvikelse ska leda till en begriplig åtgärd. Undvik mognadspoäng som saknar tydlig betydelse för slutanvändaren.

### 3.9 OpenMetadata

**Källor:** [Discovery](https://docs.open-metadata.org/v1.12.x/how-to-guides/data-discovery/discover), [asset details](https://docs.open-metadata.org/v1.12.x/how-to-guides/data-discovery/details), [quick preview](https://docs.open-metadata.org/how-to-guides/data-discovery/preview) och [features](https://docs.open-metadata.org/v1.12.x/features). Granskade 2026-07-04.

**Kort beskrivning.** Metadata- och datakatalog med global sök, assetfilter, ägarskap, tags/glossary, användning, kvalitet, profiler, lineage, aktiviteter och många assetspecifika detaljflikar.

**Det som fungerar bra.** Global sök är alltid tillgänglig och söker över namn, beskrivningar och underkomponenter. Resultaten kan filtreras på assettyp, ägare, tagg, tier och källa. Kort/lista visar beskrivning, ägare, tier och användning; en sidopanel ger snabb förhandsvisning utan att förlora resultatlistan. Detaljsidan erbjuder schema, kvalitet, lineage, aktivitet och historik.

**Det som fungerar mindre bra.** Många filter, typer, badges och flikar skapar hög informationsdensitet. Teknisk metadata och governancefunktioner ligger nära grunduppgiften och kan överväldiga ovana användare. Aktivitet som startsida prioriterar förvaltning framför upptäckt.

**Relevans och lärdom.** Låna förhandsvisningspanelen, ägarfilter, tillit/aktualitet och progressiv detalj. Begränsa initial metadata till fem–sju signaler; lägg schema, lineage och avancerad kvalitet i ”Tekniska detaljer”.

### 3.10 DataHub

**Källa:** [DataHub documentation](https://docs.datahub.com/). Granskad 2026-07-04.

**Kort beskrivning.** Modern datakatalog för sökning över dataset, dashboards, ML-modeller och filer, med ägarskap, lineage, profilering, governance, datakvalitet och kontrakt.

**Det som fungerar bra.** Brett sökomfång gör katalogen objektsöverskridande. Ownership, PII/governance, kvalitet och lineage hjälper användaren bedöma tillit. Modellen passar ett framtida läge där portalens `Dataset`, `BusinessApplication` och relaterade objekt behöver kunna hittas tillsammans.

**Det som fungerar mindre bra.** Produktens kapacitetsbredd kan göra allt till ”metadata” och sudda ut skillnaden mellan att förstå en datamängd och att utföra en beställning eller få support. Tekniska användare är implicit norm.

**Relevans och lärdom.** Låna en gemensam sökindexidé och konsekventa tillitssignaler. Behåll tydliga objekttyper och olika nästa steg för dataset, dashboard, guide, system och beställning.

### 3.11 Atlan

**Källor:** [Data Marketplace](https://atlan.com/data-marketplace/), [Discovery documentation](https://docs.atlan.com/product/capabilities/discovery), [What is Atlan](https://docs.atlan.com/get-started/what-is-atlan) och [Lineage](https://docs.atlan.com/product/capabilities/lineage). Granskade 2026-07-04.

**Kort beskrivning.** Data marketplace/context-produkt med naturligt språk, strukturerad sök, personalisering, certifiering, färskhet, ägarskap, lineage och åtkomstbegäran.

**Det som fungerar bra.** Marknadsplatsmetaforen paketerar tekniska assets som begripliga produkter. Sökresultat visar trust signals och kan leda direkt till ”Request Access”. Roll- och domänanpassning minskar brus. Naturligt språk flyttar fokus från tabellnamn till användarens fråga.

**Det som fungerar mindre bra.** Produktbilder och marknadsföring lovar ett mer automatiserat, AI-drivet och integrerat läge än nuvarande mockup kan belägga. Marknadsplatskort riskerar e-handelskänsla och kan förenkla komplexa åtkomstvillkor för mycket.

**Relevans och lärdom.** Låna data product-paketering, certifiering/färskhet och en tydlig åtkomstknapp. Simulera inte AI-svar eller automatisk provisionering i nästa mockup; använd behovsformulerade sökexempel och transparent mockstatus.

### 3.12 Collibra

**Källor:** [Data Marketplace](https://www.collibra.com/products/data-marketplace) och [Data Lineage](https://www.collibra.com/products/data-lineage). Granskade 2026-07-04.

**Kort beskrivning.** Data intelligence-/governanceplattform vars marketplace fokuserar kuraterade data products, avancerad sökning, kvalitet, certifiering, lineage och åtkomst.

**Det som fungerar bra.** Kuratering begränsar katalogbrus. Filter på domän, ägare, system och klassificering kombineras med kvalitet och certifiering. Marketplaceformuleringen gör skillnaden mellan rå asset och konsumtionsklar produkt tydlig.

**Det som fungerar mindre bra.** Enterprise governance kan ge tung terminologi och stor metadatamängd. System- och klassificeringsfilter kan bli intern organisationslogik. Produktens fulla visuella flöde kunde inte verifieras utan demo.

**Relevans och lärdom.** Låna konceptet ”redo att använda” och en tydlig skillnad mellan upptäckbar och beställningsbar. Undvik att exponera hela governance-modellen i standardvyn.

## 4. Jämförelsetabell

| Portal | Primär styrka | Svaghet/risk | Relevans för oss | Låna | Undvik |
| --- | --- | --- | --- | --- | --- |
| Trafikverket | Hitta–förstå–använd och tydliga kom-igång-spår | Plattformen blir första val | Mycket hög | Guider, exempel, kontakt, konsumtionsvägar | API/Datex/Lastkajen som huvudnavigation |
| Data.gov | Minimal sökstart och tydlig metadatakatalog | Begränsad behovsvägledning | Hög | Sök, typ/filter, ansvar | Organisationskunskap som förutsättning |
| data.europa.eu | Sök + teman + lärande | Lång, innehållstät startsida | Hög | Teman, kuratering, academy/data stories | Alla uppdrag på startsidan |
| NYC Open Data | Nybörjare/veteran och vardagliga ingångar | Katalogen känns delvis separat | Mycket hög | Personaingångar, How To, exempel | Agency som primär struktur |
| Sveriges dataportal | Metadata, begrepp och distributioner | Producent- och konsumentvy blandas | Hög | Ägare, åtkomst, API-fördjupning | DCAT-termer i grundvyn |
| Backstage | Ägarskap, relationer, docs och handling | Teknisk taxonomi och pluginbrus | Hög | Enhetlig detaljsida, owner, lifecycle, favorites | Components/APIs som huvudingång |
| Port | Anpassade vyer och självservice | Konfigurations- och tabelltäthet | Medelhög–hög | Sparade vyer, action status | Dashboard före användarbehov |
| Cortex | Ansvar, hälsa och handlingsbara signaler | Utvecklar-/mognadscentrerat | Medelhög | Status + ägare + åtgärd | Oklara scorecards |
| OpenMetadata | Djup discovery, preview och lineage | Många filter/flikar | Mycket hög för data | Preview, trust signals, progressiv metadata | All metadata samtidigt |
| DataHub | Objektsöverskridande sökning och tillit | Teknisk bredd kan sudda ut uppgifter | Hög | Gemensam sökmodell | ”Allt är metadata” |
| Atlan | Behovsnära sök och åtkomst i samma flöde | AI-/automationslöften över mockupnivå | Mycket hög | Data products, certifiering, request access | Otransparent AI och falsk automation |
| Collibra | Kuraterad marketplace | Governance- och terminologityngd | Hög | Redo-att-använda, kvalitet | Full governance i standardvyn |

## 5. Rekommenderade designriktningar

### Riktning A – Behovsstyrd katalogarbetsyta

**Koncept.** En hybrid mellan vägledande portal och katalog. Startsidan har global sök och behovskort; resultat och ämnessidor leder till en gemensam detaljmall med tydlig handling.

**Passar när.** Portalen ska stödja både ovana beställare och vana analytiker/utvecklare och förena flera objekttyper utan att göra teknik till navigation.

**Styrkor.** Balanserar upptäckt, förståelse och handling. Kan byggas med befintliga informationsobjekt och återanvändbara kort. Skalar till fler innehållstyper.

**Risker.** Sökresultat kan bli heterogena; kräver tydliga typmarkörer och prioriterad metadata. Behovskorten måste bygga på verkliga användaruppgifter, inte intern organisation.

**Sidor.** Hem, samlad sök/resultat, behovs-/katalogvy, universell objektdetalj med typanpassade sektioner, beställningsdetalj, status, support.

**UI-mönster och inspiration.** Data.govs sök, NYC:s målgruppsvägledning, Backstages ägare/livscykel, OpenMetadatas preview, Atlans tillit + åtkomst och Trafikverkets kom-igång-flöden.

### Riktning B – Minimalistisk sökportal

**Koncept.** En mycket avskalad startsida med stor sök, ett fåtal exempel och typade sökresultat; navigation och kataloger är sekundära.

**Passar när.** Innehållet är välindexerat och användarna oftast kan formulera vad de söker.

**Styrkor.** Låg visuell belastning, snabb väg till resultat, bra mobil potential.

**Risker.** Svag när användaren inte känner terminologin. En mockup utan riktig sökmotor kan lova mer än den visar. Beställningar och support kan bli svåra att upptäcka.

**Sidor.** Hem/sök, resultat, detalj, hjälp vid noll resultat.

**UI-mönster och inspiration.** Data.govs hero, OpenMetadatas typfilter, Atlans frågeformulering och NYC:s sökexempel.

### Riktning C – Service desk och beställningsportal

**Koncept.** Startsidan organiseras kring uppgifter som beställ dashboard, ändra behörighet, skapa AI/ML-yta, få support och följ status.

**Passar när.** Den största nyttan är snabbare självservice och reducerad felstyrning.

**Styrkor.** Väldigt handlingsorienterad. Bra för steg, beroenden, förutsättningar och förväntad hantering.

**Risker.** Data discovery, guider och kunskapsbyggande blir sekundärt. Kan upplevas som ännu ett ärendeverktyg.

**Sidor.** Hem, beställningskatalog, beställningsdetalj/steg, ”mina ärenden” som mockstatus, support och drift.

**UI-mönster och inspiration.** Port/Backstage templates och actions, Trafikverkets kom-igång, Atlans request access och tydliga statussteg.

### Riktning D – Datamarknad/data product-portal

**Koncept.** Kuraterade data products med syfte, användningsfall, ägare, aktualitet, kvalitet, åtkomst och relaterade dashboards/datamängder.

**Passar när.** Data discovery och återanvändning är portalens främsta prioritet och metadata är tillräckligt komplett.

**Styrkor.** Gör komplexa data assets begripliga och konsumtionsbara. Tillitssignaler hjälper användaren välja.

**Risker.** Täcker systemlänkar, generella tjänster och support sämre. Risk för ”shoppingkort” utan verklig produktförvaltning.

**Sidor.** Datamarknad, data product-detalj, dataset preview, åtkomstflöde, lineage/tekniska detaljer.

**UI-mönster och inspiration.** Atlan/Collibra marketplace, OpenMetadata preview och Sveriges dataportals distribution/ägarskap.

### Riktning E – Developer portal-inspirerad arbetsyta

**Koncept.** En Backstage-liknande sidomeny, katalogtabeller, objektägarskap, dokumentation, relationer och status, men med projektets bredare objekttyper.

**Passar när.** Den primära målgruppen är teknisk och återkommande, och portalen används dagligen som arbetsyta.

**Styrkor.** Effektiv för vana användare, hög informationskapacitet och stark objektkontext.

**Risker.** Gör teknik till norm, blir tät på små skärmar och kan motverka visionen om behovsstyrning.

**Sidor.** Personlig hemvy, katalogtabeller, entitetsdetaljer, dokumentation, status och självservice.

**UI-mönster och inspiration.** Backstage katalog/entity page, Port sparade vyer och Cortex status/ownership.

## 6. Rekommenderad nästa mockup

Testa **Riktning A – Behovsstyrd katalogarbetsyta** först.

Den riktningen passar projektets vision och nuvarande informationsmodell bäst. Den kan använda befintliga objekt—`ServiceOffering`, `Dataset`, `Guide`, `OrderType`, `System`, `ContactPoint` och `StatusItem`—utan en ny parallell modell. Den löser också portalens svåraste designproblem: hur flera slags resurser kan hittas i samma upplevelse utan att användaren behöver veta vilken organisation, plattform eller teknik som ligger bakom.

Mockupen bör särskilt testa tre hypoteser:

1. Kan en användare välja ett vardagligt behov och nå rätt katalogobjekt på högst två val?
2. Kan ett blandat sökresultat vara begripligt genom tydlig typ, kort beskrivning, ägare/kontakt, status och nästa steg?
3. Kan detaljsidan hålla teknisk metadata tillgänglig utan att den tränger undan syfte, målgrupp och handling?

Behåll projektets röda accent, gråskala och Open Sans som bas så att jämförelsen gäller informationsarkitektur och komponentmönster. Tillåt en alternativ lågmäld accentpalett i en enda variant för att prova lugnare data-/statuskodning, men ändra inte varumärkesriktningen i alla vyer samtidigt.

## 7. Underlag till nästa mockup-prompt

### Övergripande designmål

- Skapa en behovsstyrd, lugn och tillgänglig katalogarbetsyta för både ovana och vana användare.
- Gör huvudfrågan ”Vad försöker du göra?” och håll system/plattform som sekundär metadata.
- Visa vägen från behov till förståelse och nästa handling: hitta → bedöma → använda/beställa/få hjälp.
- Använd progressiv fördjupning: startsida = ingångar, katalog = jämförelse, detalj = kontext och handling, tekniska flikar = fördjupning.
- Allt innehåll ska vara fiktivt och generiskt; alla externa länkar representeras som `urlKey`/runtime-konfigurerade handlingar.

### Sidor som ska visas

1. **Hem** med stor global sök, 6–8 behovskort, ”Ny här?”/”Jag vet vad jag söker”, utvalda resurser, kompakt status och support.
2. **Samlat sökresultat** för tjänster, datamängder, guider, beställningar och systemlänkar med objekttyp och relevanta filter.
3. **Behovs-/katalogvy** för exempelvis ”Skapa eller ändra en rapport” med kort/listväxling och filter.
4. **Datamängd/data product-detalj** med nytta, ägare/kontakt, aktualitet, kvalitet/tillit, åtkomst, relaterade objekt och infällda tekniska detaljer.
5. **Beställningsdetalj** med förutsättningar, beroenden, 3–5 steg, förväntad hantering och tydlig primär åtgärd.
6. **Status och support** med lugn statusöversikt, berörd tjänst, senast uppdaterad och rätt kontaktväg.
7. **Tomt sökresultat** som föreslår enklare ord, andra objekttyper, populära behov och kontakt.

### Informationshierarki

På kort och sökträff: objekttyp → namn → kort nyttobeskrivning → 1–3 relevanta signaler → nästa steg.  
På detaljsida: namn/syfte → målgrupp och tillit/status → primär handling → hur det fungerar/förutsättningar → relaterade resurser → ägare/support → teknisk metadata.  
Visa högst fem primära filter samtidigt; placera resten under ”Fler filter”.

### Komponenter

- Global `SearchBox` med vardagliga exempel och typade förslag.
- Behovskort med verbfraser, inte systemnamn.
- Typade resultatrader/kort med konsekvent typbadge.
- Filterchips/panel för typ, behov/kategori, ägare/kontakt, status/livscykel, åtkomst och aktualitet.
- Förhandsvisningspanel på desktop; separat detaljnavigation på mindre skärm.
- Trust/statusrad med både text, ikon och färg: exempelvis ”Verifierad”, ”Uppdaterad nyligen”, ”Åtkomst krävs”.
- Tydlig ägar-/kontaktmodul med funktion, inte personuppgifter.
- Stegkomponent för beställningar och åtkomst.
- Relaterade resurser grupperade efter ”Guider”, ”Beställningar”, ”Data” och ”System”.
- `EmptyState`, loading- och felstatus med återhämtningsväg.

### Ska undvikas

- System eller tekniska plattformar som primär navigation eller första fråga.
- En startsida som återger hela katalogen, alla nyheter och alla statusobjekt.
- Fler än en primär knapp per tydlig yta.
- Täta dashboardgrids, många badges och fler än 5–7 metadatafält i standardvyn.
- Oklara mognadspoäng, falsk realtidsstatus, AI-svar eller automatisk provisionering som mockupen inte kan förklara.
- Färg som enda informationsbärare, dolda fokuslägen eller tabeller utan mobil alternativvy.
- Hårdkodade URL:er, interna namn, verkliga personer eller produktionsdata.

### Frihetsgrad för nästa designagent

Agenten får fritt föreslå layout, spacing, kort/listbalans, ikonval och mikrocopy inom befintlig informationsmodell och återanvändbara komponentprinciper. Den får inte ändra arkitektur, informationsmodell, mockdata- eller runtime-konfigurationsprinciper utan separat godkännande. Mockupen ska prioritera två tydligt jämförbara varianter av hem + sökresultat framför många halvlösta sidor.

### Färgtema

Basvarianten ska följa befintligt designsystem: Open Sans, vit/ljusgrå arbetsyta, mörk text och röd accent sparsamt för primär handling. En andra variant får prova en dämpad blågrön informationsaccent för data och en separat funktionell statuspalett, men rött ska fortsatt vara portalens identitetsaccent. Kontrast och betydelse ska fungera utan färg.

## Käll- och täckningskontroll

Alla efterfrågade källfamiljer täcks: Trafikverkets Datautbytesportal och publika API/Datex II/Lastkajen-ingångar; data.gov; data.europa.eu; NYC Open Data; ytterligare dataportal (Sveriges dataportal); Backstage/Spotify-exempel; Port; ytterligare IDP (Cortex); OpenMetadata; DataHub; Atlan; Collibra.

Begränsningen för direkt visuell kontroll av JavaScriptportaler och kommersiella demos är redovisad ovan. Inga screenshots, interna sidor, credentials eller skyddade system användes.
