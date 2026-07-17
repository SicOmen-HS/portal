# AN-010 — Klassificera lakehouse-POC och backendansvar

## Bakgrund

AB-027 (slutförd, mergad via PR #12, commit `beefdf7`) etablerade en lokal
.NET Web API-backend (`backend/Portal.Api`) som bevisar kedjan Angular →
lokalt .NET Web API → `SqlServerDatasetSourceAdapter` → lokal SQL Server,
dokumenterad i `backend/README.md`.

Fem commits (`421d309`, `00de6ce`, `fa5be78`, `a3bbda8`, `9f4a2b1`, samtliga
2026-07-15) ligger linjärt på `main`/`origin/main` efter AB-027:s
merge-commit. Ingen separat Worksmith-spårbarhet hittades för dessa commits,
och repositoryhistoriken kan inte ensam avgöra om de kom genom direkt push,
en rebase-mergad pull request eller ett annat Git-flöde — se avsnittet
"Repositoryspårbarhet" för den fullständiga, sakliga bedömningen. Commitsen
lade till en parallell Node.js/TypeScript-backend-POC (`backend/package.json`,
`backend/tsconfig.json`, `backend/src/server.ts`, `backend/src/trino.ts`) i
samma `backend/`-katalog som `Portal.Api`, samt tre nya dokument
(`docs/LAB_LAKEHOUSE_PLAN.md`, `docs/PORTAL_LAKEHOUSE_INTEGRATION.md`,
`docs/coordination/portal-lakehouse-frontend-coordination.md`).
`backend/README.md`, som tidigare dokumenterade AB-027:s .NET-POC i sin
helhet, ersattes med innehåll om den nya Node-backenden.

Commitförfattaren behandlas i denna analys som en parallellt arbetande
kollega, i linje med samordningsnotisens egen formulering. Analysen bedömer
inte person, motiv eller kompetens — endast artefakter, arkitektur,
avgränsning och process.

## Syfte

Ta fram ett neutralt beslutsunderlag: vad lakehouse-POC:n faktiskt bevisar,
hur den förhåller sig till portalens dokumenterade målarkitektur och till
den önskade lineagekedjan (källsystem → S3-datalake → WhereScape → IM/DM i
SQL Server → rapporter), samt vilka små, avgränsade uppföljningar som bör
följa. Analysen fattar inga arkitekturbeslut och implementerar inga
korrigeringar.

## Metod och avgränsning

Statisk analys: läsning av kod, dokumentation och git-historik. Inga paket
installerades, inga lokala tjänster startades (varken Node-backend,
.NET-backend, Trino, Lakekeeper, Iceberg eller SQL Server), ingen kod
kördes, ingen E2E-verifiering genomfördes. Där ett påstående bygger på
committad dokumentation snarare än på egen körning markeras det explicit
som **dokumenterat/antaget**, inte **verifierat av denna analys**.

### Granskat underlag

Kod: `backend/package.json`, `backend/tsconfig.json`, `backend/src/server.ts`,
`backend/src/trino.ts`, `backend/README.md` (nuvarande), `backend/Portal.Api/`,
`backend/Portal.Api.Tests/`.

Dokumentation: `docs/LAB_LAKEHOUSE_PLAN.md`, `docs/PORTAL_LAKEHOUSE_INTEGRATION.md`,
`docs/coordination/portal-lakehouse-frontend-coordination.md`,
`docs/analysis/AN-009_lokal_backend_poc_datamarknad.md`, `docs/work-items/AB-027.md`,
`docs/04_Systemarkitektur.md`, `docs/03_Informationsmodell.md`,
`docs/07_AI_Instruktioner.md`, `docs/project/PROJECT_RULES.md`.

Git (read-only): `git log --all --graph`, `git show --stat`/full diff för
samtliga fem commits, `git for-each-ref --contains` och `git branch -r` för
spårbarhetsbedömningen.

## De fem distinktionerna

Innan frågorna besvaras, denna begreppsapparat (efterfrågad i uppdraget):

1. **Dataåtkomst till lakehouse via Trino** — att kunna köra en fråga mot
   Iceberg-tabeller och få tillbaka rader.
2. **Metadataåtkomst** — att kunna läsa scheman, kolumnbeskrivningar,
   ägarskap, klassning för datatillgångar.
3. **Lineage och relationer** — att kunna visa hur en datatillgång härstammar
   från och transformeras via andra datatillgångar/system.
4. **Portalens ordinarie backendansvar** — den dokumenterade, godkända
   produktionsriktningen: Angular → .NET Web API → integrationsadaptrar.
5. **Lokal labbmiljö för teknisk förståelse** — ett tillfälligt, tydligt
   avgränsat tekniskt experiment utan anspråk på att vara en del av
   portalens produktionskedja.

## Svar på frågorna

### 1. Vad bevisar den nuvarande Node/TypeScript/Trino-POC:n faktiskt?

**Verifierat (kodgranskning):** En Node.js HTTP-server utan ramverk
(`node:http`) exponerar `GET /api/lakehouse/hello` och `GET /health`.
`/api/lakehouse/hello` kör en enda hårdkodad fråga
(`SELECT id, name FROM lakekeeper.labtest.hello_iceberg ORDER BY id`) mot
Trino via dess HTTP `/v1/statement`-API (`backend/src/trino.ts`), paginerar
genom `nextUri` och returnerar raderna som JSON. Inget i koden accepterar
frisök, filter eller SQL-fragment från anroparen.

**Dokumenterat, ej verifierat av denna analys:** `docs/PORTAL_LAKEHOUSE_INTEGRATION.md`
anger att kedjan Trino → Lakekeeper → Iceberg → SeaweedFS/S3 verifierades
2026-07-15 mot en lokal labbmiljö med angivet JSON-svar. Denna analys har
inte kört tjänsterna och kan inte bekräfta detta oberoende — det redovisas
här som dokumenterat, inte som egen verifiering.

**Bevisar inte:** metadataåtkomst (frågan är helt hårdkodad, inget schema
läses dynamiskt), lineage/relationer (ingen kod eller datamodell för detta),
WhereScape-transformationer, eller SQL Server IM/DM (helt orelaterat till
AB-027:s separata SQL Server-POC).

### 2. Är den i första hand ett labb, en dataåtkomst-POC, en metadata-/lineage-POC, en alternativ backend, eller en kombination?

Rent kodmässigt är POC:n en smal **dataåtkomst-POC**: en enda hårdkodad
frågeväg, ingen metadata, ingen lineage. Den omgivande dokumentationen
(`docs/PORTAL_LAKEHOUSE_INTEGRATION.md`, `docs/LAB_LAKEHOUSE_PLAN.md`)
beskriver dock en betydligt bredare ambition: "Portal backend/API" som ska
hantera autentisering, query-validering, dölja infrastrukturdetaljer och
senare koppla OpenMetadata (fas 3) och Keycloak (fas 5) — dvs. en
beskrivning av en fullständig, alternativ backendarkitektur för portalen,
inte enbart ett tekniskt labb.

**Bedömning:** en kombination, där den tekniska ytan idag är en ren
dataåtkomst-POC, men den språkliga och strukturella inramningen ("Portal
backend", delad `backend/`-katalog, ersatt README) gör den otydligt
avgränsad mot att vara en tidig, alternativ portalbackend. Detta är kärnan
i den tvetydighet som motiverade detta AN.

### 3. Vilka delar av den önskade lineagekedjan representeras faktiskt?

| Steg i önskad kedja | Representerat? |
| --- | --- |
| Rådata i S3/Iceberg | Delvis — en enda testtabell (`hello_iceberg`) i labbmiljön, inte verklig rådata eller ett generellt mönster. |
| Transformationer i WhereScape | Inte alls — WhereScape nämns endast som ett systemnamn i `docs/04_Systemarkitektur.md`s lista (rad 397); ingen kod eller dokumentation i det granskade lakehouse-underlaget rör WhereScape. |
| IM och DM i SQL Server | Inte alls i denna POC — AB-027:s separata SQL Server-POC visar en annan, orelaterad kedja (en fiktiv previewtabell, inte en IM/DM-modell) och är inte kopplad till lakehouse-POC:n. |
| Rapporter och dashboards | Inte alls — ingen kod rör rapportverktyg. |

Av de fyra stegen bevisar POC:n endast det första, och bara i sin smalaste
form (en frågeväg, en testtabell). De tre övriga finns bara som framtida
faser i planeringsdokumentet, inte i kod.

### 4. Vad saknas för att kunna visa full lineage i portalen?

- En modellerad lineage-/relationsrepresentation i informationsmodellen.
  Idag finns endast "lineage" som en kvalitativ delsignal för
  `InformationMart`s tillitsnivå (`docs/03_Informationsmodell.md`, rad
  510–512) — inget grafliknande lineage-koncept mellan datatillgångar.
- En auktoritativ källa för lineage-relationer (se fråga 5–6).
- Metadata-/katalogintegration (OpenMetadata är planerad som fas 3 men inte
  implementerad eller kopplad till portalen).
- Representation av WhereScape-steget och SQL Server IM/DM-lagret i en
  gemensam modell.
- Sammankoppling mellan de idag helt separata POC:erna (AB-027:s SQL Server-
  adapter och lakehouse-POC:ns Trino-åtkomst) under ett gemensamt
  backendansvar.

### 5. Behöver portalen fråga Trino för lineage, eller bör lineage bygga på metadata/relationer från auktoritativa källor?

Redan dokumenterad, godkänd princip (`docs/04_Systemarkitektur.md`,
avsnittet "OpenMetadata"): *"Om OpenMetadata äger metadata om datamängder
ska portalen inte skapa en parallell sanning i onödan. Portalen ska i
första hand länka till, hämta från eller spegla metadata från OpenMetadata
på ett kontrollerat sätt."*

Denna redan gällande princip pekar mot att lineage bör hämtas från ett
auktoritativt metadata-/katalogsystem snarare än härledas enbart genom att
portalen kör datafrågor mot Trino. Direkta datafrågor via Trino skapar eller
bevisar inte i sig lineage — de returnerar radvärden, inte relationer mellan
datatillgångar. Trino kan möjligen bidra med teknisk metadata eller
query-/eventinformation till ett metadatasystem (t.ex. om en lineage-lösning
observerar vilka tabeller en fråga berör), men detta är varken implementerat
eller verifierat i den nuvarande POC:n. Full lineage kräver modellerade
relationer och en auktoritativ metadata-/lineagekälla — inte enbart en
frågeväg till data.

### 6. Vilka system eller metadataregister skulle kunna vara auktoritativa källor?

- **OpenMetadata** — redan dokumenterad (docs/04) som central/framtida källa
  för metadata och datakatalogisering; naturlig kandidat för lineage om den
  katalogiserar Trino/Iceberg-lagret och SQL Server IM/DM.
- **Lakekeeper** — äger Iceberg-tabellernas REST-katalogmetadata (namespace/
  tabellstruktur); en möjlig källa för den tekniska katalogdelen av
  S3/Iceberg-lagret, men inte för lineage över hela kedjan.
- **WhereScape** — har normalt inbyggda metadata-/dokumentationsfunktioner
  för sina egna transformationer; en möjlig auktoritativ källa för just
  transformationssteget. Detta är utanför vad som granskats i detta AN och
  bör bekräftas separat.
- **SQL Server (IM/DM)** — kan exponera tabell-/vymetadata, men äger
  sannolikt inte lineage bakåt till S3/Iceberg/WhereScape.

Vilket system som faktiskt blir auktoritativt är ett verksamhetsbeslut som
kräver mer information om vilka system som är i drift eller planerade — inte
något detta AN kan avgöra definitivt. **Öppen fråga**, se nedan.

### 7. Hur förhåller sig Node-servern till målbilden Angular → .NET Web API → integrationsadaptrar?

Node-servern är en andra, parallell backend-runtime vid sidan av den redan
dokumenterade målarkitekturens backend (.NET Web API — `docs/04_Systemarkitektur.md`,
`docs/project/PROJECT_RULES.md`). Den ligger i samma toppnivåkatalog
(`backend/`) som `Portal.Api`, utan avskiljande undermapp eller markering.

Dess egen gränsprincip ("The frontend must not connect directly to Trino,
Lakekeeper, S3 or internal databases. The backend owns those integrations.")
är dock i sak identisk med den redan dokumenterade principen i
`docs/07_AI_Instruktioner.md` och `docs/04_Systemarkitektur.md` att frontend
aldrig ska ansluta direkt till datakällor. Boundary-principen är alltså
korrekt även om teknologivalet avviker.

**Sammanfattning:** Node-servern bryter inte mot frontend/backend-
gränsprincipen, men följer inte den dokumenterade backend-teknologin, och
introducerar en andra backend-runtime utan att detta klassificerats eller
beslutats genom projektets styrning (ADR eller Worksmith-item).

### 8. Bör en framtida Trino-integration kapslas bakom en adapter i den befintliga .NET-backenden?

Svaret beror på vilket behov integrationen faktiskt ska lösa — dataåtkomst
och lineage/metadata är två skilda frågor (se de fem distinktionerna ovan)
med olika svar:

- **Dataåtkomst/preview:** om portalen får ett konkret, identifierat behov
  av att läsa eller förhandsgranska data direkt från lakehouse (i linje med
  AB-027:s redan etablerade mönster för SQL Server), är en Trino-adapter i
  `Portal.Api` en rimlig fortsättning av samma, redan godkända
  arkitekturmönster (`docs/04_Systemarkitektur.md` namnger redan
  `TrinoAdapter` som ett exempel, rad 355). En sådan adapter bör byggas mot
  ett identifierat portalbehov, inte som en generell förberedelse.
- **Lineage/metadata:** lineage bör i stället konsumeras genom en
  backendadapter mot den valda auktoritativa metadata-/lineagekällan (t.ex.
  OpenMetadata, om det senare bekräftas — se fråga 6), inte genom en direkt
  `LakekeeperAdapter` mot Iceberg-katalogen. Att `LakekeeperAdapter` nämns
  som exempel i `docs/04_Systemarkitektur.md` (rad 357) innebär inte i sig
  att den ska implementeras — exempellistan beskriver möjliga framtida
  adaptrar, inte ett åtagande.

Sammanfattningsvis: en framtida Trino-adapter för dataåtkomst är en rimlig,
avgränsad fortsättning av redan godkänt mönster **om och när** ett konkret
portalbehov finns. Den löser inte lineage-frågan, som kräver ett separat
beslut om auktoritativ metadatakälla (se fråga 5–6 och öppna frågor).

### 9. Bör Node-POC:n ligga kvar, flyttas, dokumenteras om, eller tas bort?

Alternativen, bedömda neutralt:

- **Ligga kvar i `backend/` som idag** — inte rekommenderat: har redan
  orsakat sammanblandning (README skrevs över).
- **Flyttas till ett tydligt avgränsat labb-/experimentområde** —
  **rekommenderad riktning**: bevarar det tekniska lärandet utan att skapa
  strukturell oklarhet gentemot den dokumenterade portalbackenden. Exakt
  katalognamn/struktur beslutas i ett uppföljande AB, inte här.
- **Dokumenteras om på plats utan att flyttas** — möjlig mellanlösning om
  flytt bedöms för stort just nu, men löser inte grundproblemet med delad
  katalog.
- **Tas bort** — inte rekommenderat i nuläget: POC:n bevisar ett verkligt,
  dokumenterat tekniskt steg (Trino-läsning) som har referensvärde för en
  framtida adapter.

### 10. Hur ska AB-027/SQL Server-preview-POC:ns dokumentation återställas eller separeras?

**Verifierat (full diff, commit `00de6ce`):** hela AB-027:s tidigare
`backend/README.md` (155 rader: projektstruktur, förutsättningar, SSMS-steg,
user-secrets-mall, körnings- och återställningsinstruktioner) togs bort och
ersattes i sin helhet med Node-POC:ns 28 (senare 46) rader. Innehållet finns
kvar historiskt i commit `134f2b4` och i `docs/work-items/AB-027.md`, men
inte längre i någon aktiv, körbar dokumentationsfil.

**Rekommendation:** separera i två egna README-filer, en per POC, istället
för att låta en enda `backend/README.md` representera "backend" som helhet
— det har redan visat sig vara en delad resurs där en ändring skriver över
den andra.

**Klassificering av uppföljningen:** i linje med uppdragets egen
utgångspunkt är detta **inte** en lättviktsåtgärd enligt
`PROJECT_WORKFLOW.md`s "Lightweight Task Policy" (arkitektur- och
strukturnära ändringar kräver ett standardarbetsitem). Rekommendationen är
ett eget, litet, brådskande AB enbart för att återställa/separera
dokumentationen — AB-027:s körinstruktioner finns inte längre som aktiv
dokumentation i nuvarande repositoryversion (de kan återvinnas från
`134f2b4` och `docs/work-items/AB-027.md`) — hållet separat från ett
eventuellt större struktur-AB som beslutar Node-POC:ns slutgiltiga
placering (fråga 9): de två frågorna har olika brådska och olika beroenden.

### 11. Säkerhets-, konfigurations-, underhålls-, test- eller strukturproblem?

- **Struktur:** två obesläktade backend-POC:er (.NET, Node) delar samma
  toppnivåkatalog `backend/` utan undermappsseparation — orsakade redan en
  reell dokumentationskrock.
- **Spårbarhet:** inget Worksmith-item, ingen ADR för lakehouse-arbetet (se
  eget avsnitt nedan).
- **Test:** Node-POC:n har inga automatiserade tester alls, till skillnad
  från den samtidiga .NET-POC:n (AB-027), som har ett eget testprojekt
  (`Portal.Api.Tests`).
- **Konfiguration:** miljövariabler för Trino (host/port/katalog/schema/
  användare) har lab-säkra standardvärden (`localhost`, `9999`,
  `portal_lab`) i koden. Inga hårdkodade hemligheter eller riktiga interna
  adresser hittades i `backend/src/trino.ts` eller `server.ts`.
- **Repository-hygien:** den granskade lakehouse-dokumentationen innehåller
  ett specifikt lokalt värdnamn och absoluta lokala sökvägar, vilket är
  miljöspecifika värden enligt `docs/05_Konfiguration.md`s princip om att
  hålla det generiska repot fritt från sådana detaljer. Detta bedöms som en
  repository-hygienfråga att åtgärda i ett efterföljande AB (ersätt med
  generiska exempel/platshållare) — det kräver inte att denna analys avgör
  vem eller vad miljön tillhör, och ingen ytterligare miljödetalj återges
  här utöver att den finns.

Samtliga punkter är observationer av artefakter, inte bedömningar av vem
som skrev dem.

### 12. Vilka små efterföljande AB:n eller ADR-arbeten rekommenderas?

Se avsnittet "Föreslagna framtida AB-item / ADR" nedan.

## Repositoryspårbarhet (sakligt)

- Inget separat AN/AB-item finns för lakehouse-arbetet — bekräftat genom
  sökning i `docs/work-items/` och `docs/WORK_QUEUE.md` (ingen träff).
- De fem commits (`421d309`–`9f4a2b1`) ligger linjärt på
  `main`/`origin/main`, omedelbart efter AB-027:s merge-commit (`beefdf7`),
  **utan** en omslutande "Merge pull request"-commit och utan någon kvarvarande
  branch-referens skild från `main` (`git for-each-ref --contains` visar
  endast `main`/`origin/main` och denna analys egen branch). Detta skiljer
  sig från varje annan synlig arbetsenhet i historiken (AB-023 till AB-027,
  AN-009 m.fl.), som alla visar en "Merge pull request #N från .../<branch>"-
  commit som omsluter en enda feature-branch-commit.
- Detta mönster är förenligt med **antingen** en direkt push av flera
  commits till `main`, **eller** en GitHub-pull request mergad med
  strategin "Rebase and merge" (som också fast-forwardar `main` utan
  merge-commit och vanligtvis tar bort källbranchen efteråt). Repositoryts
  git-historik ensam kan inte skilja mellan dessa två möjligheter utan
  tillgång till GitHub:s egna PR-poster, vilket är utanför detta AN:s scope
  (endast läsande git-kommandon).
- **Slutsats:** Worksmith-spårbarhet saknas helt för detta arbete
  (bekräftat). PR-spårbarhet kan varken bekräftas eller uteslutas från
  repositoryt ensamt (ej verifierat i endera riktningen). Denna analys drar
  ingen slutsats om att direkt push skett.

## Rekommenderad klassificering av POC:n

En **teknisk dataåtkomst-POC** som verifierar att Trino kan nås och frågas
från en Node.js-tjänst, omgiven av dokumentation som beskriver en betydligt
bredare, ännu ej realiserad ambition (metadata, lineage, autentisering,
"Portal backend"). Den bör klassificeras och behandlas som ett **tillfälligt
tekniskt labb för teknisk förståelse** av lakehouse-kedjan — inte som en
påbörjad, alternativ portalbackend — men detta kräver att den avgränsas
tydligt (namn, plats, dokumentation) på ett sätt den idag inte är.

## Rekommenderad backendriktning

Portalens ordinarie backendansvar förblir Angular → .NET Web API →
integrationsadaptrar (redan dokumenterat och delvis realiserat genom
AB-027). En framtida Trino-adapter i `Portal.Api` är relevant endast om
portalen får ett konkret, identifierat behov av dataåtkomst eller preview
från lakehouse — inte som en generell förberedelse, och inte i en separat
Node-tjänst. Lineage-relationer bör i första hand konsumeras genom en
backendadapter mot den valda auktoritativa metadata-/lineagekällan (t.ex.
OpenMetadata, om det senare bekräftas), inte härledas genom att portalen
frågar Trino direkt. Att en adapter nämns som exempel i
`docs/04_Systemarkitektur.md` innebär inte i sig att den ska implementeras.

## Rekommenderad hantering av README och repostruktur

1. Återställ/separera dokumentationen för AB-027 och lakehouse-POC:n i
   varsin README, som ett eget, litet, brådskande AB (se ovan, fråga 10).
2. Besluta Node-POC:ns slutgiltiga placering (kvar, labb-/experimentområde,
   eller borttagning) som ett separat, något mindre brådskande AB, efter att
   riktningen bekräftats — rekommenderad riktning är flytt till ett tydligt
   labb-/experimentområde (fråga 9), utan att denna analys hårdkodar exakt
   katalognamn.

## Föreslagna framtida AB-item / ADR

1. **AB (litet, brådskande):** Återställ och separera backend-README-
   dokumentation för AB-027:s .NET-POC och lakehouse/Node-POC:n i varsin
   fil, utan att flytta kataloger.
2. **AB (litet):** Flytta lakehouse-/Node-POC:n till ett tydligt avgränsat
   labb-/experimentområde, med egen, korrekt avgränsad dokumentation.
3. **Möjligt ADR (öppen fråga):** Formalisera om ett tillfälligt tekniskt
   labbspår i ett annat språk/runtime än .NET är godkänt vid sidan av
   portalens dokumenterade backendarkitektur, och i så fall under vilka
   villkor (tydlig märkning, plats, ingen produktionsanspråk). Kan
   alternativt hanteras som en `DECISIONS.md`-notis om det bedöms mindre än
   ett fullt ADR — projektägarbeslut.
4. **AB (senare, ej brådskande):** Implementera en Trino-adapter i
   `Portal.Api`, i samma övergripande adaptermönster som AB-027, om ett
   konkret portalbehov av dataåtkomst eller preview från lakehouse först
   har identifierats. Metadata och lineage hanteras separat genom en
   adapter mot den auktoritativa metadata-/lineagekällan efter att denna
   källa och portalbehovet har beslutats.
5. **Möjligt framtida AN:** Utred lineage-modellering i informationsmodellen
   (S3/Iceberg → WhereScape → SQL Server IM/DM → rapporter) — men endast om
   projektägaren först bekräftar att full lineagevisning i portalen är ett
   förankrat produktbehov (se öppen fråga nedan), inte en ännu obeslutad
   vision.

## Öppna frågor

- Är full lineagevisualisering i portalen ett förankrat produktbehov, en
  framtida hypotes eller en individuell teknisk vision? Denna analys
  behandlar inte full lineagevisning som redan beslutad scope eller
  målarkitektur — frågan bör besvaras innan ett eventuellt framtida AN om
  lineage-modellering påbörjas.
- Om lineage bekräftas som ett produktbehov: ska portalen visa hela
  lineagegrafen, en förenklad sammanfattning, eller länka vidare till ett
  auktoritativt verktyg som OpenMetadata?
- Vilket system ska vara auktoritativ källa för lineage-relationer (fråga
  6) — beror på vilka metadatasystem som faktiskt är i drift eller
  planerade utanför denna portals repository.
- Ska ett tillfälligt tekniskt labbspår i Node/TypeScript formellt tillåtas
  vid sidan av .NET-målarkitekturen, och i så fall genom ADR eller en
  lättare `DECISIONS.md`-notis?
- Exakt namn/plats för ett framtida labb-/experimentområde (avsiktligt inte
  beslutat i detta AN).
- Är det specifika lokala värdnamnet och de absoluta miljöspecifika
  sökvägarna i dokumentationen en bekräftat privat, generisk hemmalabbmiljö,
  eller bör de genericeras ytterligare?
- Ska WhereScape-integrationen och SQL Server IM/DM-lagret bli ett eget,
  framtida AN innan någon adapterimplementation påbörjas, givet att de idag
  inte är representerade i något granskat underlag?

## Antaganden

- Commitförfattaren arbetar parallellt med portalprojektet, i linje med
  samordningsnotisens egen formulering — inte oberoende verifierat utöver
  dokumentets eget ordval.
- `docs/PORTAL_LAKEHOUSE_INTEGRATION.md`s uppgift om en verifierad
  Trino-anslutning 2026-07-15 är korrekt återgiven dokumentation, inte
  självständigt verifierad av denna analys.
- Det lokala värdnamnet och de absoluta labbsökvägarna i dokumentationen
  antas vara en privat labbmiljö baserat på `docs/LAB_LAKEHOUSE_PLAN.md`s
  eget resonemang ("Home lab versus VPS"), inte oberoende bekräftat.

## Slutsats

Lakehouse-POC:n bevisar ett smalt, verkligt tekniskt steg (dataåtkomst till
Iceberg via Trino), men bevisar varken metadataåtkomst eller lineage. Den är
omgiven av dokumentation som beskriver en betydligt bredare ambition och
saknar den avgränsning (plats, namn, Worksmith-spårbarhet) som skulle göra
dess tillfälliga labbstatus otvetydig. Den nuvarande placeringen — i samma
katalog som portalens dokumenterade .NET-backend, med en överskriven delad
README — skapar strukturell och dokumentationsmässig oklarhet om vilken
backend som är portalens ordinarie backend. Ingen del av detta kräver ett
brådskande arkitekturingripande, men AB-027:s körinstruktioner finns inte
längre som aktiv dokumentation i nuvarande repositoryversion och bör
återställas/separeras snart, som ett eget, litet AB. Node-POC:ns
slutgiltiga placering, en eventuell framtida Trino-adapter för dataåtkomst,
och frågan om lineage är ett förankrat produktbehov kan vänta på ytterligare
projektägarbeslut.
