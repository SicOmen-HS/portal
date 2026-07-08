# AN-007 – Informationssäkerhetsklassning för dataprodukter och datamängder

## 1. Sammanfattning

Portalen bör ha ett gemensamt begrepp och en gemensam ordnad typ för informationssäkerhetsklassning på både `Dataset` och `InformationMart`/Dataprodukt. Klassning ska vara en egen säkerhetsegenskap och hållas skild från åtkomstmodell, synlighet, trustnivå, dokumentationsgrad och datakvalitet.

Rekommenderad skala är:

1. Öppen data
2. Intern data
3. Känslig
4. Mycket känslig

Nivå 5.X ingår inte i modellen. Om ett objekt kräver sådan hantering ska det inte publiceras som ett vanligt katalogobjekt i denna iteration; UI och validering ska i stället stoppa eller markera det som utanför portalens stödda scope.

För en dataprodukt ska klassningen vara explicit och ansvarigt beslutad. Den högsta klassningen bland relaterade datamängder är en konservativ härledd miniminivå och valideringssignal, inte ett blint permanent arv. En dataprodukt får klassas högre. Den får klassas lägre endast efter en separat dokumenterad bedömning, exempelvis när aggregering eller borttagning av känsliga attribut faktiskt reducerar skyddsbehovet.

Förändringen är en tvärgående begrepps- och informationsmodellprincip. Den bör beslutas i en ADR, sammanfattas i DECISIONS och införas genom ett separat AB som uppdaterar informationsmodell, modeller, mockdata, validering och berörda UI-ytor tillsammans.

## 2. Nuläge

### Dataset och mockdata

`Dataset` har ett obligatoriskt fält `classification: DataClassification`. Typen har fyra tekniska värden:

| Kodvärde | Nuvarande UI-etikett | Förekomst i mockdata |
| --- | --- | ---: |
| `open` | Öppen | 2 |
| `internal` | Intern | 7 |
| `restricted` | Begränsad | 1 |
| `confidential` | Konfidentiell | 1 |

Alla 11 datamängder har klassning. Informationsmodellen anger dataklassning som en typisk Dataset-egenskap. Datamängdsdetaljen visar värdet, Dataset-korten kan visa det och `/data` filtrerar datamängder på fältet.

Skalan har alltså redan fyra nivåer men etiketterna motsvarar inte den nu angivna verksamhetsskalan. `restricted`/`confidential` behöver antingen migreras till tydligare kodvärden eller få en uttryckligen dokumenterad mappning till Känslig/Mycket känslig.

### Dataprodukt/InformationMart och trust

`InformationMart` saknar ett klassningsvärde. `DataProductTrust` har endast `classificationAssigned: boolean`, vilket berättar om en klassning sägs finnas men inte vilken nivå den har, vem som beslutat den eller hur den förhåller sig till ingående datamängder.

Mockdata innehåller fyra dataprodukter. Tre har `classificationAssigned: true` och en `false`. Det går inte att filtrera eller jämföra deras faktiska klassning. Dataproduktdetaljen och Datamarknadens preview visar därför endast ”Angiven/Finns” respektive ”Ej angiven/Saknas”.

### UI- och flödeskonsekvenser i nuläget

- Datamarknadens gemensamma adapter sätter `classification` endast för datamängder. Ett aktivt klassningsfilter utesluter därför alla dataprodukter, och UI säger uttryckligen ”Gäller datamängder”.
- Data & katalogs sök-, domän- och klassningsfilter påverkar endast datamängdslistan; dataproduktlistan förblir ofiltrerad.
- Datamängdsdetaljen blandar formuleringen ”klassning” med ”Kan jag lita på det?”, vilket riskerar att likställa skyddsbehov med kvalitet/tillit.
- Dataproduktdetaljen placerar booleska klassningsstatusen i sektionen ”Tillit och kvalitet”.
- Åtkomstflödet låter användaren välja resurs och önskad åtkomstnivå men visar inte objektets informationsklassning.
- Rapport-/dashboardflödet kan välja både dataprodukter och datamängder, men klassning följer inte med. Ett separat fritextliknande val om känslig information riskerar därmed att motsäga katalogobjektens framtida klassning.

## 3. Rekommenderad begreppsmodell

### Ett gemensamt klassningsbegrepp

Inför en gemensam typ, exempelvis `InformationSecurityClassification`, som används av både `Dataset.classification` och `InformationMart.classification`. Undvik två objekttypsspecifika skalor.

Rekommenderade stabila kodvärden och etiketter:

| Ordning | Kodvärde | UI-etikett |
| ---: | --- | --- |
| 1 | `open` | Öppen data |
| 2 | `internal` | Intern data |
| 3 | `sensitive` | Känslig |
| 4 | `highly-sensitive` | Mycket känslig |

Ordningen ska uttryckas i en central mappning eller hjälpfunktion, inte härledas från alfabetisk sortering eller UI-text. Befintliga `restricted` och `confidential` bör migreras deterministiskt till `sensitive` respektive `highly-sensitive`; behåll inte två parallella vokabulärer.

### Begreppsgränser

| Begrepp | Besvarar | Ska inte användas som |
| --- | --- | --- |
| Informationssäkerhetsklassning | Hur stort skyddsbehov informationen har | åtkomstbeslut, kvalitetsbetyg eller popularitet |
| Åtkomstmodell | Hur åtkomst begärs, beviljas och förvaltas | synonym för klassning |
| Synlighet | Vem som får upptäcka katalogposten | bevis på rätt att använda underliggande data |
| Trustnivå | Samlad, förklarad signal om produktens styrning och tillförlitlighet | säkerhetsklassning |
| Datakvalitet | Om data uppfyller definierade kvalitetskrav | mått på sekretess eller åtkomst |
| Dokumentationsgrad | Hur komplett dokumentationen är | säkerhets- eller kvalitetsbeslut |

En öppen datamängd kan ha låg datakvalitet. En mycket känslig dataprodukt kan ha hög trust och god dokumentation. En intern dataprodukt kan fortfarande kräva en särskild åtkomstgrupp. Dessa kombinationer är inte motsägelser.

`classificationAssigned` bör tas bort som separat truth source när ett faktiskt klassningsfält införs. Om ofullständiga poster måste stödjas under migration bör frånvaro modelleras som saknad data och visas ”Klassning saknas”; lägg inte till `unknown` som en femte klassningsnivå.

## 4. Klassning av dataprodukter

### Härledd miniminivå

När en dataprodukt bygger på klassade datamängder beräknas en konservativ härledd nivå som maximum enligt skalans ordning. Med nuvarande mockrelationer skulle detta ge:

- Försäljning – kund och order: Intern data.
- Kund – interaktioner och insikt: Intern data.
- Ekonomi – periodrapportering: Mycket känslig, eftersom en ingående datamängd är `confidential` i dagens vokabulär.
- Äldre försäljningsrapportering: Intern data.

Den härledda nivån är en kontrollsignal och ett standardförslag. Den får inte ensam bli dataproduktens beslutslogg, eftersom relationer kan ändras och dataprodukten kan transformera, filtrera, kombinera eller aggregera information.

### Explicit klassning och avvikelser

Dataprodukten bör bära ett explicit `classification`-värde. Grundregeln är:

`effektiv klassning = högsta av explicit klassning och härledd miniminivå`

En explicit högre nivå är alltid tillåten. En explicit lägre nivå ska inte accepteras som normal mockdata. Om produktens faktiska innehåll motiverar lägre klassning efter transformation krävs en uttrycklig bedömning/override med motivering och ansvarig granskning. Den mekanismen bör analyseras innan riktig governance lagras; i första mockupsteget kan valideringen kräva att explicit nivå är minst den härledda nivån.

Detta undviker två risker: att en ny känsligare källdatamängd lämnar produkten felklassad och att en mekanisk maxregel permanent överklassar en produkt som faktiskt bara innehåller säkert aggregerat material.

### Proveniens

UI bör kunna förklara klassningens grund: ”Explicit klassad” och, där relationer finns, ”Högsta ingående klassning: …”. Ett senare governanceobjekt kan bära beslutsdatum, beslutsägare och motivering. För första AB:t räcker ett explicit klassningsfält plus beräknad jämförelse mot relaterade datamängder; inför inte personuppgifter eller en full beslutsmodell i mockdata.

## 5. Rekommenderad presentation

### Gemensamma regler

- Visa etikett och text, inte enbart färg eller låsikon.
- Presentera klassning som ”Informationssäkerhetsklassning”, separat från ”Tillit och kvalitet”.
- Använd samma etiketter, ordning och visuella ton på alla ytor.
- Färg får förstärka men aldrig ensam bära betydelsen. Undvik trafikljuslogik som antyder att låg klassning är ”bra” och hög klassning ”dålig”.
- Visa inte nivå 5.X som val, filter eller tom femte nivå.

### Datamarknad

- Låt klassningsfiltret omfatta både dataprodukter och datamängder.
- Ta bort hjälpttexten ”Gäller datamängder” när modellen är gemensam.
- Visa klassning i varje resultatrad och i den gemensamma delen av previewn.
- Behåll trustsignaler som separat dataproduktsektion; klassning ska inte räknas in som ett kvalitetsbetyg.
- För dataprodukter kan previewn dessutom visa ”Högsta ingående klassning” om den avviker eller behöver förklaras.

### Data & katalog

- Sökning, domän- och klassningsfilter bör tillämpas konsekvent på båda objektlistorna.
- Dataproduktkort bör visa samma klassningsetikett som datamängdskort.
- Objekttyperna ska fortfarande hållas visuellt åtskilda; gemensam klassning gör dem inte semantiskt identiska.

### Detaljsidor

- Visa klassning nära åtkomstmodell och ägarskap i en egen governance-/säkerhetsgrupp.
- Flytta datamängdens klassning bort från frågan ”Kan jag lita på det?”.
- Ersätt dataproduktens booleska ”Klassning: Angiven” med det faktiska värdet.
- Visa relaterade datamängders högsta nivå och eventuell avvikelse på dataproduktdetaljen utan att exponera verkliga skyddsdetaljer.

### Åtkomst- och rapportflöden

- När ett dataobjekt väljs ska dess klassning visas som beslutsunderlag, inte som ett automatiskt åtkomstbeslut.
- Åtkomstmodell avgör fortsatt väg och krav; klassning kan utlösa information, granskning eller framtida policykontroll.
- Rapportflödet bör sammanställa den högsta klassningen bland valda dataobjekt och varna om användarens uppgift om känslighet motsäger katalogmetadata.
- I mockupen ska detta vara förklarande och validerande UI, inte verklig behörighetskontroll eller automatisk ärendehantering.

### Framtida governance och ärenden

Ett framtida ärende bör lagra en snapshot av relevant klassning vid inskick, eftersom katalogvärdet kan ändras under handläggningen. Katalogobjektet förblir källa för aktuell klassning; ärendet behöver historisk beslutsgrund. En framtida governancefunktion kan hantera omklassning, granskning och undantag, men detta är inte skäl att införa ett generellt ärendeobjekt nu.

## 6. Validerings- och innehållsregler

Följande bör gälla efter implementation:

1. Varje publicerat Dataset och varje publicerad Dataprodukt har exakt ett värde ur den fyrgradiga skalan.
2. Kodvärden och etiketter kommer från en gemensam central definition.
3. `restricted` och `confidential` får inte finnas kvar efter migrering.
4. `classificationAssigned` får inte konkurrera med `classification` som truth source.
5. Alla `relatedDatasetIds` måste referera till existerande datamängder innan härledning görs.
6. En dataprodukts explicita nivå får i första implementationen inte vara lägre än maximum av relaterade datamängder.
7. Saknade relationer betyder ”kan inte härleda”, inte ”Öppen data”.
8. Nivå 5.X, okända kodvärden och tom klassning ska ge valideringsfel, inte tyst fallback.
9. Mockdata förblir fiktiv och får inte innehålla verkliga klassningsobjekt, dokument, grupper, personer eller produktionsuppgifter.

Valideringen bör ligga nära kataloginläsningens test/fixturekontroll eller i ett avgränsat verifieringsskript. Den ska inte dupliceras som olika ad hoc-regler i varje komponent.

## 7. Permanent dokumentation och beslut

En ADR behövs eftersom förändringen:

- ändrar ett centralt informationsbegrepp och den gemensamma kodvokabulären;
- beslutar relationen mellan dataprodukt och ingående datamängder;
- påverkar flera katalog-, detalj- och beställningsflöden;
- behöver en varaktig regel för explicit klassning, härledning och avvikelse.

ADR:n bör kompletteras med:

- en kort DEC-post som pekar på ADR:n;
- uppdatering av `docs/03_Informationsmodell.md` för båda objekttyperna;
- praktisk vägledning i `docs/13_Utvecklarguide.md` om kodvärden, etiketter och validering;
- uppdatering av `DOCUMENT_INDEX.md` med ADR:n och läsanvisning.

Det räcker alltså inte med ett isolerat modell-/UI-AB utan permanent beslut. Däremot behövs ingen ny arkitektur, route, backend- eller API-princip.

## 8. Rekommenderat nästa AB

**Titel:** `AB: Inför gemensam informationssäkerhetsklassning för dataobjekt`

### Prioriterat scope

- Skapa ADR och DEC för den gemensamma fyrgradiga skalan och dataproduktens härledningsprincip.
- Uppdatera informationsmodellen och utvecklarguiden.
- Ersätt `DataClassification` med en gemensam typ för Dataset och InformationMart/Dataprodukt.
- Lägg obligatorisk klassning på dataprodukter och migrera datasetens kodvärden/etiketter.
- Ta bort eller migrera `classificationAssigned` så att endast en truth source återstår.
- Uppdatera all fiktiv mockdata och lägg till validering för tillåtna värden, relationer och dataproduktens miniminivå.
- Uppdatera Datamarknad, Data & katalog, Dataset-kort samt båda detaljsidorna.
- Visa klassning som kontext i befintliga åtkomst- och rapportflöden utan riktig behörighetslogik.
- Lägg till eller uppdatera relevanta tester.

### Acceptance criteria

- Både dataprodukter och datamängder bär exakt en klassning ur Öppen data, Intern data, Känslig eller Mycket känslig.
- Samma kodvärden, etiketter och ordning används på alla berörda ytor.
- Klassningsfilter i Datamarknad och Data & katalog omfattar båda objekttyperna.
- Dataproduktdetaljen visar explicit klassning och högsta ingående klassning när relationer finns.
- Klassning visas separat från trust, datakvalitet och åtkomstmodell.
- Mockvalidering stoppar okända/saknade värden, nivå 5.X, trasiga relationer och otillåtet lägre dataproduktvärde.
- Åtkomst- och rapportflöden visar vald datas klassning men fattar inga verkliga åtkomstbeslut.
- ADR, DEC, informationsmodell, utvecklarguide och dokumentindex är konsekventa.
- Frontend-build, tester, Worksmith-validering och `git diff --check` passerar.

### Out of scope för AB:t

- Nivå 5.X.
- Verkliga klassningsbeslut, persondata eller produktionsmetadata.
- Backend, databas, API, autentisering och riktig behörighetskontroll.
- Full governancehistorik, omklassningsärenden eller undantagsworkflow.
- Nya routes eller förändrad navigation.

## 9. Risker och öppna frågor

- Den föreslagna etikettmappningen måste verksamhetsvalideras; analysen antar att dagens `restricted` motsvarar Känslig och `confidential` motsvarar Mycket känslig.
- En enkel maxregel är säker som standard men kan överklassa aggregerade produkter. En framtida override kräver spårbar bedömning och bör inte improviseras i komponentkod.
- Ett explicit mockfält kan bli inaktuellt när relationer ändras; automatisk validering är därför viktigare än ytterligare visuella indikatorer.
- Klassning får inte användas som genväg till åtkomstbeslut. Policy, roll, ändamål och godkännande kan fortfarande krävas oavsett nivå.
- Portalen är en mockup utan auktoritativ klassningskälla. Framtida integration måste definiera system of record innan skrivning eller synkronisering införs.

## 10. Granskat underlag och verifieringsgrund

Analysen bygger på repositoryts arbetskopia 2026-07-08 och följande befintliga underlag:

- styrning och beslut: `PROJECT_RULES.md`, `DOCUMENT_INDEX.md`, `DECISIONS.md`, `docs/03_Informationsmodell.md` och ADR-0001;
- tidigare analys och leverans: AN-006, AB-018 och observationsloggen;
- modeller: `dataset.model.ts`, `information-mart.model.ts` inklusive `DataProductTrust` (ingen separat `data-product-trust.model.ts` finns);
- mockdata: `datasets.mock.json` och `information-marts.mock.json`;
- routes och UI: `app.routes.ts`, Datamarknad, Data & katalog, datamängdsdetalj, dataproduktsdetalj, åtkomst-/ansvarsflödet och rapport-/dashboardflödet.

Ingen källkod, mockdata, informationsmodell eller permanent dokumentation ändrades i AN-007.
