# AN-006: Målbild för Datamarknadens användarupplevelse

## 1. Sammanfattning

Datamarknad bör vara en **kombination av kuraterad tjänsteingång och
självbetjäningsyta**, inte en andra fullständig datakatalog och inte en fristående
teknisk marketplace. Den ska hjälpa användaren genom resan:

> Hitta → Förstå → Bedöm → Begär åtkomst → Använd

`/tjanster/datamarknad` bör äga denna användarresa, prioriterade ingångar och en
snabb, kuraterad utforskningsyta. `/data` bör fortsätta vara den bredare
objektkatalogen med fullständiga listor, filter och canonical detaljsidor. En preview
i Datamarknad får sammanfatta ett objekt men ska länka till samma detaljsida under
`/data`; den får inte bli en parallell canonical kopia.

Nästa AB bör förbättra Datamarknadens landnings-/utforskningsupplevelse med en
gemensam sök- och resultatlista för befintliga dataprodukter och datamängder, typ- och
domänfilter, en responsiv previewpanel samt tydliga nästa steg. Det kan byggas helt
med nuvarande modeller och mockdata. Fler beställningsflöden, API-katalog och
personlig åtkomststatus bör vänta.

Analysen använder endast repositoryts generiska dokument, modeller, mockdata, routes
och komponenter. Ingen äldre bild eller extern mockup har använts som källa.

## 2. Nuläge

AB-017 gav `/tjanster/datamarknad` en tjänsteintroduktion, antal objekt och sex
åtgärdskort. Korten länkar vidare till `/data`, befintliga `/bestall`-detaljer,
Rapporter och dashboards samt det återanvändbara behörighets-/ansvarsformuläret.
Detta etablerar rätt ansvar men kräver att användaren väljer en abstrakt åtgärd innan
något dataobjekt syns.

`/data` har redan den faktiska katalogfunktionen:

- sökning och filter för datamängder;
- datamängdskort och canonical `/data/:id`;
- dataproduktkort och canonical `/data/dataprodukt/:id`;
- relationer till guider, beställningar, system och BI-tillämpningar;
- detaljer för ägare, förvaltare, klassning, åtkomst och aktualitet.

Dataproduktsidan är betydligt rikare än listvyn. `InformationMart.trust` innehåller
tillitsnivå, dokumentationsgrad, kvalitetskontroller, ägarskap, lineage, klassning och
senaste granskning. Datamängder har klassning, ägare, steward, åtkomstmodell,
uppdateringsfrekvens, källa och livscykel, men saknar samma strukturerade
tillitsmodell.

`DataService` är redan ett separat informationsobjekt med målgrupp, relaterade
datamängder, tekniska komponenter, beställningstyp, kontakt och åtkomstkrav. Tre
poster finns i mockdata, men ingen katalogsektion, detaljsida eller route presenterar
dem för användaren. Datamarknad räknar dem bara.

## 3. Rekommenderad rollfördelning

### `/tjanster/datamarknad`

En kuraterad arbetsyta som:

- förklarar vad användaren kan åstadkomma;
- erbjuder en omedelbar sök-/utforskningsstart;
- blandar relevanta objekttyper i en begriplig resultatlista;
- visar tillräcklig preview för att användaren ska kunna bedöma relevans;
- leder vidare till canonical detalj eller rätt åtgärd;
- lyfter rekommenderade/aktuella dataprodukter och vanliga konsumtionsvägar.

Det är en tjänst därför att den organiserar en resa och nästa handling, inte därför
att den äger dataobjekten.

### `/data`

Den bredare, mer neutrala katalogen och inventariet som:

- listar alla synliga objekt inom sitt scope;
- erbjuder mer fullständiga filter;
- äger canonical detaljsidor för dataprodukt och datamängd;
- kan användas direkt av vana användare och länkas från sökresultat.

Datamarknad får använda samma data och presentationskomponenter, men ska inte skapa
nya detaljroutes för samma objekt. `/data` är "vad finns?"; Datamarknad är "vad kan
jag använda och hur går jag vidare?".

## 4. Prioriterade användarresor

1. **Hitta data.** Sök med vardagliga ord, filtrera på objekttyp, domän och
   åtkomst/klassning. Resultatet blandar dataprodukter, datamängder och senare
   datatjänster men markerar typen tydligt.
2. **Förstå data.** Preview visar syfte/beskrivning, domän, ägare, aktualitet,
   åtkomstmodell och vilka objekt produkten bygger på eller används av.
3. **Bedöma kvalitet och governance.** Dataprodukter visar tillitsnivå och
   delsignaler; datamängder visar de signaler som faktiskt finns utan att konstruera
   ett jämförbart kvalitetspoäng.
4. **Begära åtkomst.** Nästa steg utgår från valt objekt och länkar till befintligt
   flöde. Kontextöverföring kan förbättras senare; sidan får inte påstå att
   användaren redan har eller saknar åtkomst.
5. **Använda i rapport/dashboard.** Från valt dataobjekt går användaren till
   Rapporter och dashboards canonical flöde. Objekt-id kan i ett senare AB förifyllas
   om det görs utan parallell modell.
6. **Konsumera via datatjänst/API.** Visa befintliga `DataService` som
   konsumtionsvägar med målgrupp och åtkomstkrav. Kalla dem inte API:er om modellen
   inte säger det; "via frågemotor" och "metadata-sökning" är korrekta nuvarande
   exempel.
7. **Initiera förändring eller nytt underlag.** Länka till befintliga ordertyper och
   förklara när en förändring respektive ny datamängd behövs. Bygg inte nytt formulär
   före landningsupplevelsen.

## 5. Förstaklassobjekt och informationsstruktur

| Objekt | Roll i första målbilden | Nuvarande stöd | Rekommendation |
| --- | --- | --- | --- |
| Dataprodukt (`InformationMart`) | Primär, konsumtionsklar paketering | Rik detalj, trust, relationer | Förstaklass i lista, preview och detalj |
| Datamängd (`Dataset`) | Primärt byggblock/upptäckbart underlag | Lista, detalj, klassning, åtkomst, ägare | Förstaklass men visuellt skild från dataprodukt |
| Datatjänst (`DataService`) | Konsumtionsväg till data | Modell och tre mockposter, ingen UI | Visa först som kompakt konsumtionsväg; egen detalj först vid verkligt behov |
| API | Möjlig framtida konsumtionsväg | Inget eget objekt eller kontraktsmetadata | Inte förstaklass nu; kräver modellbeslut |
| Rapport/dashboard-koppling | Kontext och nästa handling | Relationer via `relatedBusinessApplicationIds` och rapportflöde | Visa som relation/CTA, inte ny datamarknadsobjekttyp |

### Rekommenderad sidstruktur

1. Kort tjänsteintroduktion och central sökstart.
2. Typfilter: Alla, Dataprodukter, Datamängder, Datatjänster.
3. Kompletterande filter som befintlig data bär: domän, klassning, livscykel och
   eventuellt åtkomstmodell som textgruppering.
4. Resultatlista med kompakt, jämförbar metadata.
5. Previewpanel på desktop och inline/egen expanderad yta på smal skärm.
6. Preview med primär CTA "Visa detaljer" och kontextuella sekundära nästa steg.
7. Kuraterade genvägar/åtgärdskort efter utforskningen, inte som enda innehåll.

Preview ska inte försöka visa allt. Den ska svara på: vad är detta, passar det mitt
behov, kan jag använda det, vem ansvarar och vart går jag nu?

## 6. Signaler i första versionen

### Kan visas direkt

**Dataprodukt:**

- syfte, beskrivning, målgrupp och domän;
- ägare/ansvarigt team;
- åtkomstmodell och uppdateringsfrekvens;
- tillitsnivå;
- dokumentationsgrad;
- genomförda kvalitetskontroller;
- ägarskap, lineage och klassning som separata ja/nej-signaler;
- senaste granskning;
- livscykel och relaterade datamängder/BI-tillämpningar.

**Datamängd:**

- beskrivning och domän;
- ägare och steward;
- klassning;
- åtkomstmodell;
- uppdateringsfrekvens;
- källa/metadata-källa;
- livscykel och relaterade datatjänster/system/order.

**Datatjänst:**

- namn, beskrivning och målgrupp;
- åtkomstkrav;
- relaterade datamängder;
- kontakt och eventuell beställningstyp;
- livscykel.

### Ska inte påstås med nuvarande underlag

- användarens personliga åtkomststatus;
- pågående ansökan eller ärendehistorik;
- livekvalitet, SLA, incidentstatus eller färskhetsmätning;
- popularitet, användningsantal eller rekommendationsalgoritm;
- API-endpoint, protokoll, schema, autentisering eller kodexempel;
- exempelrader eller verkliga datavärden.

## 7. Vad kräver utökning?

### Endast UI/komponentarbete med befintlig modell

- kombinerad resultatadapter för dataprodukt/datamängd;
- typ-/domän-/klassningsfilter;
- previewpanel;
- trust- och governancechips för befintliga fält;
- kompakt sektion för befintliga datatjänster;
- tydliga länkar till canonical detalj och befintliga flöden.

### Mockdatautökning inom befintlig modell

- fler `DataService`-poster;
- mer konsekventa relationer mellan datatjänster och datamängder;
- komplettering av valfria befintliga fält på fler dataprodukter.

Detta kräver egna AB-items men ingen informationsmodelländring.

### Informationsmodell/ADR krävs först

- förstaklass-API med endpoint-/kontrakts-/protokoll-/autentiseringsmetadata;
- en strukturerad, jämförbar trustmodell för `Dataset` motsvarande dataproduktens;
- personlig åtkomststatus, ansökningar och historik;
- abonnemang/favoriter, användningsstatistik eller rekommendationer;
- generell katalogtyp om flera nya konsumtionsobjekt måste blandas likvärdigt.

Inför inte dessa fält som lokala komponentinterface i väntan på modellbeslut; det
skulle skapa en parallell informationsmodell.

## 8. Rikare upplevelse utan backend

Datamarknad kan kännas betydligt rikare genom presentation och interaktion som redan
är sann mot mockdata:

- blanda objekttyper i en gemensam sökvy men visa tydliga typetiketter;
- behåll valt resultat och preview vid filtrering;
- visa trustsignaler som separata, begripliga indikatorer;
- visa relationer som "bygger på", "används av" och "kan konsumeras via";
- ge tomma lägen konkreta vägar: ändra filter, beskriv saknat dataunderlag eller
  kontakta support;
- visa fiktiva katalogantal och mockmarkering tydligt;
- låt CTA:er gå till verkliga interna routes i mockupen i stället för inerta knappar.

Undvik falsk funktionalitet: inga "Min åtkomst", "Populärast", livevärden eller
personliga rekommendationer utan motsvarande modell och källa.

## 9. Prövning av hypoteserna

1. **Kuraterad tjänste-/självbetjäningsingång kontra ren `/data`-katalog —
   bekräftad.** Roller och canonical detaljer kan hållas tydliga utan dubblering.
2. **Hitta → Förstå → Bedöm → Begär åtkomst → Använd — bekräftad.** Resan motsvarar
   både informationsmodellens behovsprincip och befintliga relationer.
3. **Kortgrid ensam räcker inte — bekräftad.** Den visar handlingar men inget objekt
   att förstå eller bedöma; lista + preview ger snabbare jämförelse.
4. **Kvalitet, klassning, ägarskap, aktualitet, dokumentation och åtkomst ska synas —
   bekräftad med objekttypsskillnad.** Alla signaler finns strukturerat för
   dataprodukt, men datamängd har bara en delmängd och ska inte ges ett uppfunnet
   trustvärde.
5. **API/datatjänster som konsumtionsvägar — delvis bekräftad.** Datatjänster kan
   visas nu; API som förstaklassobjekt kräver modellutökning.
6. **Försiktig mock av åtkomststatus/historik — bekräftad och skärpt.** Visa
   åtkomstkrav och länk till ansökan, men ingen personlig status alls före analys av
   ärendemodell och `/arenden`.
7. **Förbättra utforskningen före fler beställningsflöden — bekräftad.** Det största
   aktuella gapet är att användaren inte ser data på Datamarknadens landningssida.

## 10. Observation Log

Ingen observation är specifikt registrerad för Datamarknadens utforskningsupplevelse.
Två generella observationer bör beaktas i framtida UI-arbete:

- startsidans linjering är relevant eftersom Datamarknad nu är en prioriterad
  startsidesgenväg, men hör inte till nästa Datamarknad-AB;
- breadcrumb-observationen för Rapporter och dashboards visar behovet av konsekvent
  `Hem > Tjänster > Datamarknad` även i framtida underflöden. Datamarknadens nuvarande
  sida har redan denna nivå.

Observationen om långa processflöden gäller AB-016 och påverkar inte den föreslagna
list-/previewytan.

## 11. Prioriterad roadmap

1. **Nästa AB: bygg Datamarknadens utforskningsarbetsyta med befintlig modell.**
   Ersätt inte `/data`; lägg en kuraterad kombinerad sök/lista + preview under
   `/tjanster/datamarknad`. Omfatta dataprodukter och datamängder, typ/domän/klassning,
   befintliga trust-/governancesignaler, canonical detaljlänkar och befintliga CTA:er.
2. **Gör datatjänster synliga som konsumtionsvägar.** Visa befintliga `DataService`
   kompakt i Datamarknad och koppla dem till relaterade datamängder, kontakt och
   ordertyp. Egen detaljroute bara om användartest visar behov.
3. **Förbättra objektkontext i åtgärder.** Förifyll valt dataprodukt-/dataset-id i
   åtkomst-, rapport- och förändringsflöden utan att skapa parallella formulär.
4. **Fyll befintliga modellrelationer.** Ett separat innehålls-AB kan komplettera
   `DataService` och relationer där luckor blir synliga i UI:t.
5. **Analysera API som informationsobjekt.** Gör detta först när verkliga
   användarfall kräver kontrakt, protokoll och autentiseringsmetadata.
6. **Vänta med personlig åtkomst och historik.** Samordna med framtida analys av
   ärendemodell, autentisering och `/arenden`.

### Exakt scope för rekommenderat nästa AB

**Titel:** `AB: Bygg kuraterad utforskningsyta i Datamarknad`

**In scope:**

- gemensam adapter/view model i komponentlagret för befintliga dataprodukter och
  datamängder;
- sök, typfilter, domänfilter och befintlig klassning där relevant;
- responsiv resultatlista och previewpanel/inline-preview;
- produktens trustsignaler respektive datamängdens befintliga governancefält;
- länkar till canonical `/data`-detaljer och befintliga åtkomst-/rapportflöden;
- behåll nuvarande sex åtgärder som sekundära genvägar.

**Out of scope:** ny modell, ny mockdata, API, personlig åtkomststatus, ärenden,
exempelrader, backend och liveintegration.

## 12. Risker och avgränsningar

- En kombinerad lista kan sudda ut skillnaden mellan konsumtionsklar dataprodukt och
  byggblocksdatamängd. Typetikett, olika signaler och tydlig beskrivning är
  obligatoriska.
- Dataproduktens trustmodell är rikare än datamängdens. UI:t ska inte skapa falsk
  jämförbarhet eller rangordna objekttyper på samma skala.
- Dubblering mellan Datamarknad och `/data` uppstår om preview blir en full detaljsida
  eller om filterlogik kopieras utan en delad adapter/komponent.
- Ordet "marknad" kan lova transaktion, personlig åtkomst eller självservice som
  mockupen inte har. Mockmarkering och sanningsenliga CTA:er behövs.
- Analysen bygger på repositoryts arbetskopia 2026-07-08. Den är en generisk
  UX-/strukturbedömning, inte en verksamhetsvalidering med riktiga användare.

## 13. Granskat underlag

- Styrning och beslut: `PROJECT_RULES.md`, `DOCUMENT_INDEX.md`, `DECISIONS.md`,
  ADR-0001, ADR-0004, ADR-0005 och `13_Utvecklarguide.md`.
- Genomförandehistorik: `docs/work-items/AB-017.md`.
- UI/routes: Datamarknad, Data & katalog, datamängdsdetalj,
  dataproduktsdetalj och `app.routes.ts`.
- Modeller/services: `Dataset`, `InformationMart`, `DataProductTrust`, `DataService`
  och `DataCatalogService`.
- Mockdata: `datasets.mock.json`, `information-marts.mock.json` och
  `data-services.mock.json`.
- Operativa observationer: `docs/project/OBSERVATION_LOG.md`.

Ingen källkod, mockdata, informationsmodell eller permanent dokumentation ändrades i
AN-006.
