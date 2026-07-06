# AN-002 – URL-struktur, BI-objektmodell och integrationsstrategi

Granskad: 2026-07-06
Work item: `AN-002`
Repositoryversion: den lokala arbetskopian i `C:\dev\Portal` den 2026-07-06, efter AB-004
till AB-008 (tjänstesidan Rapporter och dashboards, det styrda formulärflödet,
UX-/responsiv städning och den kompletterade responsiva principen).

Detta är en analys. Den beslutar ingenting, ändrar ingen kod, ingen route och ingen
informationsmodell, och accepterar ingen ADR. Den rekommenderar en riktning och listar
vad som bör beslutas och byggas härnäst.

## 1. Sammanfattning och rekommendation

Portalens nuvarande routingstruktur är i praktiken två separata, delvis överlappande
mönster: en generisk katalogstruktur (`/tjanster/:id`, `/data/:id`,
`/data/dataprodukt/:id`, `/bestall/:id`) och en fristående, behovsstyrd
tjänstesida (`/behov/rapport`) som bygger sitt eget interna state istället för routes.
AB-007 började redan brygga dessa två mönster genom `ServiceOffering.detailRoute`, som
låter en katalogpost peka om till en rikare sida istället för den generiska
tjänstedetaljen. Den analysen fortsätter den riktningen och formaliserar den.

**Rekommendation i korthet:**

1. **Canonical route för en tjänst med fördjupat flöde ska vara
   `/tjanster/<service-slug>`, med åtgärder som egna underroutes
   `/tjanster/<service-slug>/<action-slug>`.** `/behov/rapport` blir en alias-route
   som omdirigerar till `/tjanster/rapporter-och-dashboards` (se avsnitt 5–6).
2. **Åtgärder inom en tjänst ska vara egna routes**, inte bara internt komponent-state,
   så att val, delning, bokmärkning och webbläsarens bakåt/fram fungerar naturligt (se
   avsnitt 7). Formulärsteg inom en åtgärd kan förbli lättare state (t.ex. en
   query-parameter), inte nödvändigtvis egna routes.
3. **Portalens katalog, sök och formulärval bör bygga på en egen portal-databas/read
   model, fylld av bakgrundsadaptrar** – detta är i praktiken redan den arkitektur
   `docs/04_Systemarkitektur.md` beskriver, bara inte uttryckligen kopplad till BI-källor
   än. **Direktintegration reserveras för liveåtgärder**: statuskontroll, behörighets-
   validering vid utförande och att faktiskt genomföra en beställning (se avsnitt 9–10).
4. En generisk BI-objektmodell — **ReportingSystem → ReportingContainer →
   ReportingAsset → ReportingPart → ReportingDataBinding** — täcker Qlik Sense
   (system → ström → app → ark → datakoppling), Grafana (system → mapp → dashboard →
   panel → datakälla) och SAP BusinessObjects (system → mapp → Web
   Intelligence-dokument → rapport/flik/sektion → universe) med samma fem nivåer (se
   avsnitt 11–12). Det bör bli en **framtida utökning av informationsmodellen**, inte en
   stor ommodellering av `System`/`BusinessApplication` — dessa två objekt behålls och
   får nya relationer till de nya objekten.
5. Den preliminära riktningen i uppdraget höll i allt väsentligt vid granskning, med en
   nyansering: `/behov/*` bör vara en **redirect eller alias**, inte kvarleva som en
   parallell canonical yta, eftersom två canonical vägar till samma innehåll är sämre för
   intern sökbarhet och underhåll än en väg med en tydlig, permanent omdirigering.

## 2. Nuvarande läge i portalen

Routing definieras uteslutande i `frontend/src/app/app.routes.ts` som lazy-loadade
standalone-komponenter, en per rad. Nuvarande routes:

```text
/                              Startsida
/tjanster                      Tjänstekatalog (lista, sök, filter, fokusväxling)
/tjanster/:id                  Generisk tjänstedetalj
/system                        System & länkar (samlad lista, inga per-system-routes)
/sok                           Samlad sökresultatsida (?q=)
/behov/rapport                 Tjänstesidan "Rapporter och dashboards" (eget flöde)
/data                          Data & katalog
/data/dataprodukt/:id          Dataproduktdetalj (InformationMart)
/data/:id                      Datamängdsdetalj (Dataset)
/guider                        Guider & dokumentation (samlad lista, inga per-guide-routes)
/bestall                       Beställningskatalog
/bestall/:id                   Beställningsdetalj (OrderType, med steg/beroenden)
/status                        Status & drift
/kontakt                       Kontakt & support
/om-portalen                   Om portalen
```

Två mönster existerar sida vid sida:

- **Katalog + detalj-mönstret** (`/tjanster/:id`, `/data/:id`,
  `/data/dataprodukt/:id`, `/bestall/:id`): stabilt objekt-`id` direkt som route-segment,
  en generisk detaljkomponent per objektyp, byggd helt på mockdata via en domänservice.
- **Det egna tjänsteflödet** (`/behov/rapport`): en enda route vars innehåll (val av
  åtgärd, formulärets sex steg, granskning, mockbekräftelse) helt styrs av lokalt
  komponent-state (`selectedAction`, `formStage`, `activeFormStep` – signaler i
  `NeedsCatalogComponent`), inte av routing. AB-007 introducerade
  `ServiceOffering.detailRoute?: string[]`, som gör att katalogkortet för "Rapporter och
  dashboards" pekar på `/behov/rapport` istället för den generiska `/tjanster/:id`-sidan
  – en pragmatisk brygga mellan de två mönstren, inte en genomtänkt, generell princip.

`/system` och `/guider` saknar helt per-objekt-routes idag; de visar allt i en lista utan
djuplänk till ett enskilt system eller en enskild guide. Det är en tredje, mer minimal
variant av mönstret och en inkonsekvens värd att åtgärda samtidigt som canonical-frågan
löses (se avsnitt 4).

Sökresultatsidan (`/sok`) rundtrippar bara söktexten (`q`) genom URL:en. De övriga
filtren (typ, kategori, status, åtkomst, ägare) är rena komponentsignaler och nollställs
vid navigering – de är alltså inte bokmärkningsbara eller delningsbara idag, oavsett vad
som beslutas om övrig routing.

Det finns ingen backend. All information kommer från JSON under
`frontend/public/assets/mock/`, laddad via en generisk `MockDataService` och
domänspecifika services (`shareReplay(1)`, `getAll`/`getById`/`getByIds`). Ingen kod i
`models/` eller `services/` innehåller något BI-specifikt begrepp (`Qlik`, `Grafana`,
`BusinessObjects`, `stream`, `sheet`, `panel`, `dashboard` gav noll träffar i TypeScript-
källkod vid sökning) – sådana ord förekommer bara som fri text i mockdatans
beskrivningar. `BusinessApplication` är en tunn generisk modell
(id/namn/beskrivning/`systemId`/`informationMartIds`/ägarteam/livscykel/synlighet) utan
begrepp för ström, ark, panel eller datakoppling.

## 3. Problem med nuvarande route/slug-struktur

- **Två canonical vägar till samma tjänst.** Efter AB-007 kan "Rapporter och
  dashboards" nås både via `/tjanster/service-reports-dashboards` (den generiska
  tjänstedetaljen, om någon länkar dit eller skriver URL:en direkt) och via
  `/behov/rapport` (den faktiska, rika sidan). Utan en uttalad princip vet varken en
  utvecklare, en sökmotor eller en användare vilken som är "den riktiga".
- **Åtgärder är inte adresserbara.** Att välja "Ändra innehåll eller utseende" ändrar
  bara komponent-state på `/behov/rapport`. Webbläsarens bakåtknapp lämnar hela sidan
  istället för att gå tillbaka till åtgärdsvalet; en länk till en specifik åtgärd eller
  ett specifikt formulärsteg kan inte delas eller bokmärkas; en sökmotor kan bara
  indexera startlägets rubrik och innehåll, inte de sex åtgärdsflödena var för sig.
- **Inkonsekvent granularitet mellan objekttyper.** Tjänster, dataprodukter, datamängder
  och beställningar har egna detaljroutes med stabilt `id`; system och guider har det
  inte alls. Om detta inte är ett medvetet, dokumenterat val riskerar det att tolkas som
  en bugg eller att åtgärdas ad hoc, olika på olika ställen.
- **`id` används direkt som slug utan en uttalad princip.** Det fungerar bra idag
  eftersom id-konventionen (`service-order-dashboard`, `mart-sales-demo`) redan är
  läsbar, men det finns ingen dokumenterad regel för vad som händer om en tjänst byter
  namn, eller om två poster råkar få snarlika namn. Se avsnitt 5 för en konkret princip.
- **Sökfiltren är inte deep-linkable.** Om URL-strukturen ska vara bra för intern
  sök/indexering (krav i detta uppdrag) måste även sökresultatsidans typ-/kategorifilter
  kunna uttryckas i URL:en – annars kan en indexerad sida aldrig peka på ett filtrerat,
  meningsfullt sökläge.
- **Namngivningsinkonsekvens i BI-relaterad mockdata.** `BusinessApplication`-poster har
  id-prefixet `bi-app-` medan modellen/filen heter `business-application`. Litet i sig,
  men ett tecken på att BI-området ännu inte har en genomtänkt, konsekvent namngivning –
  relevant inför den generiska BI-objektmodellen i avsnitt 11.

## 4. Utvärderade URL-alternativ

Uppdraget föreslog denna struktur att pröva:

```text
/tjanster                              Tjänster
/tjanster/<service-slug>               Tjänstedetalj
/tjanster/<service-slug>/<action-slug> Åtgärd/beställningsflöde
/data/dataprodukter/<slug>             Dataprodukter
/data/datamangder/<slug>               Datamängder
/system/<slug>                         System
/guider/<slug>                         Guider
/status                                Driftstatus
/kontakt                               Hjälp/support
/sok?q=...                             Samlad sök
/behov/...                             Behovsingång, alias eller redirect
```

Bedömning mot nuläget:

| Segment | Nuläge | Bedömning |
| --- | --- | --- |
| `/tjanster`, `/tjanster/<slug>` | Finns redan, matchar rakt av | Behåll oförändrat. |
| `/tjanster/<slug>/<action-slug>` | Finns inte; åtgärder är state, inte routes | Inför enligt avsnitt 7 – störst konkret nytta i hela förslaget. |
| `/data/dataprodukter/<slug>`, `/data/datamangder/<slug>` | Idag `/data/dataprodukt/:id` (singular) och `/data/:id` (odelat, delar segment med allt annat under `/data`) | Värt att överväga på sikt för tydlighet, men lägre prioritet – `/data/:id` är redan otvetydigt eftersom `id`-prefixen (`dataset-…` osv.) skiljer objekttyper åt. Inte brådskande. |
| `/system/<slug>` | Finns inte; `/system` är en odelad lista | Inför en detaljroute om produktriktningen är att system ska kunna djuplänkas, delas eller indexeras var för sig (troligt på sikt givet att BI-system som Qlik Sense/Grafana/SAP BusinessObjects blir egna `System`-poster). |
| `/guider/<slug>` | Finns inte; `/guider` är en odelad lista | Samma resonemang som system – lägre akut behov men samma princip bör gälla när det byggs. |
| `/status`, `/kontakt`, `/sok?q=` | Finns redan, matchar rakt av | Behåll. Komplettera `/sok` med fler query-parametrar (typ, kategori, status, åtkomst, ägare) så filtren blir delningsbara. |
| `/behov/...` som alias/redirect | `/behov/rapport` är idag den enda, faktiska sidan – motsatsen till "bara alias" | Ändra till redirect enligt avsnitt 6. |

**Alternativ som övervägdes och valdes bort:**

- **Behovsstyrd struktur som canonical** (`/behov/<need>` som den riktiga sidan, med
  `/tjanster/...` som tunnare listningar som länkar dit). Avvisas eftersom det gör
  tjänstekatalogen — portalens mest generiska, redan fungerande listnings- och
  filtreringsyta — till en sekundär ingång till sitt eget innehåll, och eftersom
  framtida tjänster (utan ett skräddarsytt behovsflöde) då saknar en naturlig,
  konsekvent URL-form.
- **Ren id-baserad struktur utan ord** (`/s/{id}`, `/o/{id}`). Avvisas: sämre för
  intern sökbarhet/indexering (se avsnitt 8) och sämre begriplig för interna användare
  som delar länkar, utan motsvarande vinst eftersom URL:erna redan är interna och inte
  behöver vara korta för SEO.
- **Djupt nästlad organisationsstruktur** (`/<team>/<plattform>/<tjänst>`). Avvisas:
  bryter mot principen "tjänster framför teknik/organisation" i
  `docs/03_Informationsmodell.md` och gör länkar instabila när team eller plattform
  omorganiseras.

## 5. Rekommenderad canonical URL-struktur

- **Slug-princip: använd det redan etablerade, läsbara `id`:t som route-segment**
  (t.ex. `service-reports-dashboards`, inte ett internt numeriskt ID och inte heller ett
  separat, redigerbart namn-slug). Portalens `id`-konvention
  (`docs/03_Informationsmodell.md`, avsnittet "Namngivning och identifierare") är redan
  stabil, kebab-case och läsbar – den uppfyller redan branschprincipen "kombinera stabilt
  ID med läsbarhet" (se källa i avsnitt 18) utan att något nytt behöver införas.
- Håll denna princip konsekvent för **alla** objekttyper med en detaljsida: tjänst,
  dataprodukt, datamängd, beställning, och – om/när de får egna detaljsidor – system och
  guide.
- **Åtgärder får ett eget, kort `action-slug`** som inte är samma sak som tjänstens
  `id` (t.ex. `andra-innehall`, inte hela frastexten "Ändra innehåll eller utseende").
  Action-slugs behöver bara vara unika inom sin tjänst, inte globalt.
- **Canonical route för Rapporter och dashboards blir
  `/tjanster/service-reports-dashboards`**, med åtgärden "Ändra innehåll eller
  utseende" på `/tjanster/service-reports-dashboards/andra-innehall`.
  `ServiceOffering.detailRoute` (infört i AB-007) blir mekanismen som pekar dit istället
  för till den generiska tjänstedetaljen – ingen ny modellmekanism behövs, bara att
  routen den pekar på ändras.
- **Formulärsteg inom en åtgärd blir en query-parameter**
  (`?steg=2`), inte en egen route per steg. Det ger samma adresserbarhetsvinst för det
  vanligaste fallet (dela/bokmärka en specifik åtgärd) utan att introducera sex nya
  routes per åtgärd för ett flöde som ändå är sekventiellt och kortlivat.

## 6. Alias/redirect-princip

- **En canonical route per objekt.** Varje tjänst, dataprodukt, datamängd,
  beställning, system och guide ska ha exakt en URL som är "den riktiga" – den som
  visas i adressfältet, indexeras, delas och länkas till internt.
- **`/behov/rapport` blir en redirect till
  `/tjanster/service-reports-dashboards`**, inte en andra, parallell sida. En
  route-nivå-redirect (Angular `redirectTo`, eller en tunn wrapper-komponent som
  navigerar vidare) är tillräckligt i mockupen; en riktig backend kan senare göra
  samma sak med en HTTP 301.
- **Gamla eller kortlivade mockup-vägar hanteras som en "slug-historik"**: om en
  tjänst byter `id` (byter namn på ett sätt som ändrar slugen) ska den gamla sluggen
  fortsätta fungera som en redirect till den nya, istället för att ge ett dött
  `404`-liknande resultat. Detta är samma mönster som forskningen i avsnitt 18
  beskriver för API-URL:er generellt (bevara en `slug`-historik med omdirigering).
  I dagens mockup utan backend kan detta simuleras med en enkel uppslagstabell i
  routingen; med en riktig backend hör det hemma i katalogtjänsten.
- **Alias ska aldrig vara canonical för sök/indexering** (se avsnitt 8): en alias-URL
  ska sätta en `rel="canonical"`-liknande signal (i denna SPA: navigera/redirecta
  istället för att duplicera innehåll) så att det aldrig finns tvetydighet om vilken
  sida som är "sanningen".
- **Behovsingångar som inte har en fördjupad tjänstesida** (dvs. de flesta
  `NeedTile`-poster på startsidan idag pekar redan direkt på sin riktiga destination,
  t.ex. `/data`, `/guider`) fortsätter att göra det. Endast tjänster som faktiskt har
  ett dedikerat, rikare flöde (idag bara Rapporter och dashboards) behöver
  alias/redirect-hantering.

## 7. Rekommendation för browser back/forward och egna åtgärdssidor

Åtgärder bör vara egna routes av tre skäl som alla redan är synliga i den befintliga
koden:

1. **Bakåtknappen gör idag fel sak.** Eftersom åtgärdsvalet bara är state, tar
   bakåtknappen användaren bort från `/behov/rapport` helt istället för att stänga
   den valda åtgärden – motsatsen till vad användaren rimligen förväntar sig efter att
   ha klickat sig in i en åtgärd.
2. **Scroll-/fokusarbetet i AB-006 löser bara den synliga symptomen, inte
   grundorsaken.** Den robusta scroll-till-toppen-logiken som byggdes där behövs oavsett
   route-struktur (fokushantering vid vynbyte är alltid rätt att göra explicit), men om
   varje åtgärd är en egen route får man adresserbarhet och historik "gratis" utöver
   det, istället för att behöva simulera det med `afterNextRender`
   och manuell scroll-hantering.
3. **Sökresultat och delade länkar kan peka på en specifik åtgärd.** Med dagens
   struktur kan `SearchService` bara peka på `/tjanster/service-reports-dashboards` som
   helhet (eller `/behov/rapport` som helhet); den kan inte särskilja "byt behörighet"
   från "rapportera problem" i sökresultat, favoriter eller support-svar.

**Rekommenderad regel:** en åtgärd som har ett eget, meningsfullt flöde (formulär,
process, granskning) ska ha en egen route under sin tjänst. En åtgärd som bara är en
kort informationsruta utan eget flöde (t.ex. de fem åtgärderna i Rapporter och
dashboards som ännu bara visar process och en enkel CTA, se AB-004) kan förbli en
anker-sektion på tjänstesidan tills den byggs ut, men bör flyttas till en egen route
samtidigt som den får ett eget formulär.

## 8. Intern sök/indexering: krav på URL, title, metadata, textinnehåll och canonical route

Portalen har ingen extern SEO-press, men "intern sök/indexering" (`SearchService`,
en framtida enterprise-sökmotor, eller en framtida Backstage-katalog) drar nytta av
samma grundprinciper som webbsökmotorer använder, av samma anledning: en indexerare
måste kunna avgöra vad en sida handlar om och vilken variant av den som är
auktoritativ.

Krav att uppfylla, oavsett vilken sökmekanism som används internt:

- **En URL per meningsfullt innehåll, och bara en.** Duplicerat innehåll på flera
  URL:er (dagens `/tjanster/service-reports-dashboards` +
  `/behov/rapport`-problem) gör att en indexerare antingen dubbelindexerar eller
  måste gissa vilken som är kanonisk – lös med avsnitt 6:s redirect-princip.
- **`title` ska vara unik och beskrivande per route**, vilket portalen redan gör
  konsekvent via Angular Routers `title`-fält i `app.routes.ts` – detta mönster ska
  fortsätta gälla nya åtgärdsroutes (`title: 'Ändra innehåll eller utseende –
  Rapporter och dashboards – Data- och analysportalen'`).
- **URL:en ska spegla informationshierarkin** (tjänst → åtgärd, system → objekt),
  inte tekniska implementationsdetaljer – redan portalens princip
  (`docs/03_Informationsmodell.md`: "tjänster framför teknik") och direkt bekräftat
  av forskningen i avsnitt 18 (URL-struktur bör spegla informationsarkitekturen).
- **Sökbara filter ska kunna uttryckas i URL:en.** `/sok?q=rapport&typ=Tjänst` bör
  fungera precis som `/sok?q=rapport` gör idag. Detta kräver en mindre, fristående
  ändring av `SearchResultsComponent` (idag synkar bara `q`) – utanför denna analys
  omfattning men värt ett eget AB-item (se avsnitt 17).
- **Textinnehåll, inte bara metadata, ska bära informationen** som sökningen
  matchar på – redan konsekvent i mockupen (titel, beskrivning, taggar indexeras av
  `SearchService.rank`).
- **En flatare struktur är lättare att indexera och navigera** än en djupt nästlad
  – forskningen i avsnitt 18 bekräftar detta rakt av. Rekommendationen i avsnitt 5
  (två nivåer: tjänst, sedan åtgärd) håller sig medvetet flat.

## 9. Jämförelse: direktintegration vs portal-databas/read model vs hybrid

| Fråga | A. Direktintegration | B. Egen portal-databas/read model | C. Hybrid |
| --- | --- | --- | --- |
| Bäst för denna portal? | Nej | Delvis | **Ja** |
| Enklast administrativt (kort sikt) | Ja (inget att synka) | Nej (kräver adaptrar/schemaläggning) | Nej, men bara marginellt mer än B |
| Bäst intern sökbarhet | Nej (kan inte indexera/ranka tre live-API:er effektivt) | **Ja** (en indexerad källa) | **Ja** (katalog/sök läser B:s del) |
| Minskar beroende av källsystemens tillgänglighet | Nej (portalen blir lika instabil som svagaste källsystem) | **Ja** | **Ja** för katalog/sök, medvetet nej för liveåtgärder |
| Säkrast | Nej (kräver att varje sida hanterar tre olika auth-modeller live) | Delvis (ACL måste ändå vara aktuell) | **Ja** (ACL/åtgärder valideras live vid det tillfälle det spelar roll) |

**Alternativ A – Direktintegration.** Enklast att komma igång med eftersom ingen
synk behövs, men gör portalens svarstid och tillgänglighet beroende av Qlik Sense,
Grafana och SAP BusinessObjects samtidigt, för varje sidvisning. Intern sökning och
filtrering över flera system i realtid är antingen mycket långsam (seriella/parallella
anrop till tre olika REST-API:er per sökning) eller kräver att man ändå bygger ett
index framför dem – vilket i praktiken blir Alternativ B, fast otydligt. Matchar
"federated search"-mönstret i forskningen (avsnitt 18): bättre träffsäkerhet på ett
smalt, redan känt system men sämre skalbarhet och prestanda över flera källor.

**Alternativ B – Egen databas/read model.** Detta är i sak redan portalens
dokumenterade målarkitektur: `docs/04_Systemarkitektur.md` beskriver uttryckligen att
PostgreSQL-databasen kan innehålla "cache eller spegling av metadata från externa
system där det är motiverat", och att integrationer ska kapslas i namngivna adaptrar
(`QlikSenseAdapter`, `GrafanaAdapter` – en `SapBusinessObjectsAdapter`/motsvarande
saknas ännu i listan, se avsnitt 14). Ger bäst sökbarhet och oberoende av
källsystemens tillgänglighet, till priset av att informationen kan bli inaktuell
mellan synkningar och att adaptrar/schemaläggning måste byggas och förvaltas.

**Alternativ C – Hybrid.** Kombinerar B för katalog, sök och formulärval (bläddra,
söka, välja rapport/dashboard i ett beställningsformulär) med riktad
direktintegration för: (1) driftstatus, (2) behörighetsvalidering precis innan en
åtgärd genomförs, och (3) själva utförandet av en beställning eller ändring i
källsystemet. Detta är den arkitektur som redan är skisserad i
`docs/04_Systemarkitektur.md` (adapterlager, `StatusItem` med
"senast uppdaterad", `MetadataSource` för att hålla isär portalens egen data från
speglad data) – analysen föreslår i praktiken att uttryckligen besluta att BI-metadata
(Qlik/Grafana/SAP BusinessObjects) ska följa exakt detta redan dokumenterade mönster,
inte att införa ett nytt.

**Behörighet/ACL:** Katalogläsning (bläddra/söka) kan använda en synkad,
grovkornig ACL-spegling (t.ex. `AccessGroup`/`visibility`, redan existerande begrepp)
med kort TTL. Åtgärder som faktiskt gör något (starta en beställning, ändra
behörighet) ska alltid validera live mot källsystemets egen behörighetsmodell vid
utförandetillfället – aldrig enbart mot den synkade kopian, eftersom en inaktuell
positiv behörighet annars kan bli en säkerhetslucka.

**Färskhet:** Katalogobjekt (system, ström/mapp, app/dashboard/dokument, ark/panel/
rapport) kan synkas periodiskt (t.ex. varje natt eller varje timme, styrt per
`MetadataSource.uppdateringsfrekvens` – fältet finns redan i modellen). Status och
behörighet hämtas live. Varje synkad post visar "senast synkad
{tidpunkt}" och ett neutralt `StatusBadge`/`LifecycleBadge`-liknande "kan vara
inaktuellt"-läge om synken är äldre än ett tröskelvärde – samma UI-mönster som redan
finns för livscykelstatus, ingen ny komponent behövs.

## 10. Rekommenderad integrationsstrategi

**Hybrid (Alternativ C), med denna konkreta arbetsfördelning:**

- **Synkat, i portalens databas/read model:** katalogmetadata för `ReportingSystem`,
  `ReportingContainer`, `ReportingAsset`, `ReportingPart` (namn, beskrivning, ägare,
  taggar, livscykelstatus, senast synkad) – allt som behövs för att bläddra, söka och
  välja i ett beställningsformulär.
- **Hämtat live:** driftstatus per system/app, behörighetskontroll vid utförande,
  och själva anropet som genomför en beställd ändring (t.ex. att faktiskt skapa en ny
  Qlik-ström eller ändra en behörighetsgrupp).
- **Adaptrar** (`QlikSenseAdapter`, `GrafanaAdapter`, en ny
  `SapBusinessObjectsAdapter`) kapslar käll-specifika API-anrop bakom en gemensam,
  generisk kontrakt-yta (se avsnitt 14) så att portalens kärna inte känner till Qlik-,
  Grafana- eller BusinessObjects-specifika begrepp direkt – konsekvent med den
  redan uttalade principen "Portalens kärna ska inte vara hårt kopplad till enskilda
  produkter" (`docs/04_Systemarkitektur.md`).
- **Kräver detta en ADR?** Ja – se avsnitt 16. Även om riktningen redan är
  underförstådd i `docs/04_Systemarkitektur.md`, är det första gången den uttryckligen
  knyts till namngivna BI-källsystem (Qlik Sense, Grafana, SAP BusinessObjects) och
  till en konkret synkat-kontra-live-uppdelning, vilket är exakt den typ av beslut
  `docs/11_ADR_mall.md` listar ("val av integrationsprincip").

## 11. Generisk BI-objektmodell

Föreslagen, källsystemsoberoende modell med fem nivåer:

```text
ReportingSystem
  → ReportingContainer   (gruppering: ström, mapp)
    → ReportingAsset     (den körbara/visningsbara enheten: app, dashboard, dokument)
      → ReportingPart    (den enskilda vyn: ark, panel, rapport/flik/sektion)
      → ReportingDataBinding  (datakoppling: datamodell/load script, data source, universe)
```

- **ReportingSystem**: en instans av en rapporteringsplattform. Motsvaras redan av
  det befintliga `System`-objektet (`system-qlik-sense` finns redan i mockdata) –
  ingen ny toppnivå-typ behövs här, bara en tydligare relation från `System` till de
  nya nivåerna nedanför.
- **ReportingContainer**: den gruppering källsystemet själv använder för att
  organisera innehåll (Qlik Sense-ström, Grafana-mapp, SAP BusinessObjects-mapp).
- **ReportingAsset**: den enhet en användare faktiskt öppnar och som en beställning
  oftast handlar om (Qlik-app, Grafana-dashboard, ett Web Intelligence-dokument).
  Motsvaras delvis av dagens `BusinessApplication`, men `BusinessApplication` saknar
  idag koppling uppåt till en container och nedåt till delar/datakopplingar.
- **ReportingPart**: den enskilda vyn inuti en asset som en ändringsbegäran ofta
  faktiskt gäller (ett ark, en panel, en rapportflik/sektion). Detta saknas helt idag
  – "Ändra innehåll eller utseende"-formuläret kan idag bara välja en hel rapport/
  dashboard, inte en specifik flik eller ett specifikt diagram inom den.
- **ReportingDataBinding**: den underliggande datakopplingen (Qlik-datamodell/load
  script, Grafana data source, BusinessObjects universe/semantic layer). Viktig för
  att kunna svara på frågan "vilka rapporter påverkas om den här datakopplingen
  ändras?" – en spegelbild av dataproduktkedjan som redan finns för dataprodukter
  (`Källsystem → Datamängd → Dataprodukt → Dashboard/Rapport`,
  `docs/03_Informationsmodell.md`).

**Bör detta bli nya informationsmodellobjekt, en utökning av befintliga objekt, eller
bara en framtida teknisk modell?**

Rekommendation: **en explicit, dokumenterad utökning av informationsmodellen med fyra
nya objekt** (`ReportingContainer`, `ReportingAsset`, `ReportingPart`,
`ReportingDataBinding`), relaterade till det redan existerande `System`-objektet,
snarare än att pressa in denna granularitet i `BusinessApplication` som fält. Skälen:

- `BusinessApplication` är redan etablerad som "en BI-tillämpning som konsumerar en
  eller flera Information Marts" – att utöka den med containernivå, delnivå och
  databindningsnivå på en gång gör den till fem olika begrepp i ett interface.
- De fyra nya objekten är generiska nog att täcka tre olika källsystem med samma fem
  nivåer (se mappningen i avsnitt 12), vilket är precis vad
  `docs/03_Informationsmodell.md`s princip "modellen ska stödja förändring" efterfrågar
  – lägga till ett fjärde BI-system senare (t.ex. Power BI, som redan nämns som teknisk
  komponent i modellen) kräver då ingen ny modelltyp, bara nya mockdataposter.
- `BusinessApplication` behålls oförändrad som begrepp men får en ny, valfri relation
  till `ReportingAsset` (eller blir på sikt ett tunt alias för det) – ingen brytande
  ändring, och beslutet kan skjutas till implementationstillfället.

Detta är **inte** en stor modelländring i den mening som AB-arbetet hittills undvikit
(jfr `featured`/`detailRoute` som小 tillägg) – det är en genuint ny, avgränsad
utökning, och bör därför gå via en ADR (avsnitt 16) och ett eget AB-item (avsnitt 17),
inte smygas in som en mockdata-detalj.

## 12. Mapping Qlik Sense / Grafana / SAP BusinessObjects

| Generisk nivå | Qlik Sense | Grafana | SAP BusinessObjects |
| --- | --- | --- | --- |
| ReportingSystem | Qlik Sense-site | Grafana-instans | BI-plattformens CMS |
| ReportingContainer | Stream (ström) | Folder (mapp) | Folder (mapp) i CMS-repositoryt |
| ReportingAsset | App (även kallat Document) | Dashboard | Web Intelligence-dokument |
| ReportingPart | Sheet (ark) / Story | Panel | Report (flik/sektion/element) inom dokumentet |
| ReportingDataBinding | Datamodell / load script (datakällkoppling i appen) | Data source | Universe / semantic layer |
| Käll-API för synk | QRS API (REST, JSON, `/qrs/...`, port 443/4242) – läser Streams, Apps, sheets/stories-metadata | HTTP API (REST, JSON) – Folder, Dashboard, Data source-endpoints | RESTful Web Services (`/biprws/...`), t.ex. `cmsquery` mot CMS-repositoryt; BI Semantic Layer REST API för universe-metadata |

Detaljer och avvägningar per system:

- **Qlik Sense.** QRS API:et exponerar Streams, Apps och (via samma repository)
  metadata om sheets/stories. En app kan ha flera sheets; en sheet motsvarar
  `ReportingPart`. Appens egen datamodell/load script är dess `ReportingDataBinding`.
- **Grafana.** Redan den mest rakt-av mappningen: Folder → Dashboard → Panel →
  Data source är namngivna nivåer i själva produkten och API:et, nästan identiska med
  den generiska modellen.
- **SAP BusinessObjects.** CMS-repositoryt lagrar innehåll som "InfoObjects"; mappar
  organiserar Web Intelligence-dokument (`ReportingAsset`), som i sin tur innehåller
  rapporter/flikar (`ReportingPart`). Ett dokument bygger på en eller flera universe/
  semantic layer-definitioner (`ReportingDataBinding`) – en universe kan återanvändas
  av flera dokument, precis som en dataprodukt kan användas av flera dashboards i
  portalens befintliga modell.

Alla tre källsystem har alltså **samma femnivåershierarki**, bara med olika namn – det
är själva anledningen till att en gemensam generisk modell är värd att bygga, istället för tre
parallella, källspecifika modeller.

## 13. Föreslagna mockdatafält

Endast som underlag för ett framtida AB-item – inga filer skapas i detta AN.

**Nya mockfiler** (samma mönster som befintliga `*.mock.json`):
`reporting-systems.mock.json` (kan återanvända befintliga `systems.mock.json`-poster
via relation istället för duplicering), `reporting-containers.mock.json`,
`reporting-assets.mock.json`, `reporting-parts.mock.json`,
`reporting-data-bindings.mock.json`.

**Föreslagna fält per nytt objekt** (utöver `id`/`name`/`description`/
`lifecycleStatus`/`visibility` som redan är standard i alla objekt):

- `ReportingContainer`: `systemId`, `sourceSystemNativeId` (strömmens/mappens
  faktiska id i källsystemet), `parentContainerId?` (för nästlade mappar).
- `ReportingAsset`: `containerId`, `sourceSystemNativeId`, `assetType`
  (`"app" | "dashboard" | "webi-document"`), `ownerTeamId`, `lastSyncedAt`,
  `nativeUrlKey` (samma `urlKey`-mönster som redan används för systemlänkar – aldrig
  en hårdkodad URL).
- `ReportingPart`: `assetId`, `sourceSystemNativeId`, `partType`
  (`"sheet" | "panel" | "report-tab"`), `order`.
- `ReportingDataBinding`: `assetId`, `bindingType`
  (`"load-script" | "data-source" | "universe"`), `relatedDatasetIds` (koppling till
  befintliga `Dataset`/`InformationMart`, för att återanvända dataproduktkedjan
  istället för att duplicera den).

Alla `sourceSystemNativeId`-fält är avsiktligt skilda från portalens egna `id`, av
samma skäl som redan gäller i resten av modellen: portalens `id` ska vara stabilt och
portal-internt, medan käll-id:t kan ändras eller se annorlunda ut per källsystem.

## 14. Föreslagna framtida API-kontrakt/adaptrar

Endast som underlag; ingen backend byggs i detta AN.

**Föreslagna REST-endpoints** (mönster enligt `docs/04_Systemarkitektur.md`s
API-principer):

```text
GET /api/reporting-systems
GET /api/reporting-systems/{id}/containers
GET /api/reporting-containers/{id}/assets
GET /api/reporting-assets/{id}
GET /api/reporting-assets/{id}/parts
GET /api/reporting-assets/{id}/data-bindings
```

**Föreslagen ny adapter** att lägga till i den redan existerande listan i
`docs/04_Systemarkitektur.md` (`QlikSenseAdapter`, `GrafanaAdapter`, …):

- `SapBusinessObjectsAdapter` – saknas idag i adapterlistan trots att SAP
  BusinessObjects är en av de tre namngivna källsystemen i detta uppdrag.

Varje adapter ansvarar för att periodiskt hämta container-/asset-/part-/
databindningsmetadata från sitt källsystem och skriva till portalens read model, samt
att exponera en tunn, källspecifik livekontrollfunktion (status, behörighet) som
backend anropar vid utförandetillfället – inte vid varje sidvisning.

## 15. Risker om vi bygger vidare utan beslut

- **Route-skulden växer för varje ny tjänst med ett eget flöde.** Om nästa
  tjänstesida (t.ex. en framtida behörighets- eller dataändringstjänst) byggs med
  samma ad hoc-mönster som `/behov/rapport` innan en princip är satt, får portalen
  flera olika, inkonsekventa sätt att hantera "tjänst med åtgärder" – dyrare att
  sanera senare än att bestämma nu.
- **Delade länkar och sökträffar pekar fel.** Så länge `/behov/rapport` och
  `/tjanster/service-reports-dashboards` båda "fungerar" utan en uttalad
  canonical/alias-regel, kan interna dokument, support-svar eller en framtida
  sökmotor råka referera den ena eller den andra inkonsekvent.
- **BI-integration riskerar tre inkompatibla, källspecifika lösningar.** Om Qlik
  Sense-integrationen byggs först utan en generisk modell, riskerar Grafana- och SAP
  BusinessObjects-integrationerna senare att antingen tvinga in sig i en
  Qlik-formad modell som inte passar, eller kräva en omskrivning av den första
  integrationen. Att vänta på en gemensam modell (avsnitt 11) är billigare än att
  bygga om senare.
- **Direktintegration byggd in tidigt blir en tillgänglighets- och
  prestandaskuld.** Om komponenter börjar anropa Qlik/Grafana/BusinessObjects direkt
  "för att det är enklast just nu", ärver varje sådan sida de tre systemens
  sammanlagda otillgänglighet och svarstid – och att retrofit:a en cache-/read
  model-lösning ovanpå redan byggda direktanrop är dyrare än att bestämma
  integrationsstrategin innan koden skrivs.
- **Sökfilter som aldrig blir deep-linkable** blir en permanent begränsning för en
  framtida enterprise-sökintegration eller Backstage-koppling, eftersom hela poängen
  med extern indexering är stabila, filtrerade URL:er.

## 16. Föreslagna ADR:er

Namnges enligt `docs/11_ADR_mall.md`s filnamnskonvention; nästa lediga nummer efter
`0001-dataprodukt-som-anvandarbegrepp.md` är `0002`. Denna analys skapar inte filerna.

- **ADR-0002: Canonical URL-struktur och alias/redirect-princip för portalen.**
  Beslutar tjänste-/åtgärdsroutingen i avsnitt 5–7 och att `/behov/*` ska vara
  redirect, inte en andra canonical yta.
- **ADR-0003: Integrationsstrategi för BI-/rapportmetadata (hybrid).** Beslutar
  arbetsfördelningen mellan portalens read model och riktad direktintegration i
  avsnitt 9–10, samt ACL- och färskhetsprincipen.
- **ADR-0004: Generisk BI-objektmodell för rapporteringssystem.** Beslutar de fyra
  nya informationsmodellobjekten i avsnitt 11 och deras relation till befintliga
  `System`/`BusinessApplication`.

## 17. Föreslagna AB-items efter analysen

Namn och grovt scope, inte fullständiga manifest – ett separat, godkänt beslut krävs
per item innan det skapas:

1. **Inför canonical routes för tjänsteåtgärder.** Lägg till
   `/tjanster/service-reports-dashboards` som ny canonical route med
   `/tjanster/service-reports-dashboards/andra-innehall` som åtgärdsroute; gör
   `/behov/rapport` till en redirect. Formulärsteg som query-parameter.
2. **Gör sökresultatsidans filter deep-linkable.** Synka `typ`/`kategori`/`status`/
   `åtkomst`/`ägare` i `SearchResultsComponent` mot query-parametrar, inte bara `q`.
3. **Ge System och Guider egna detaljroutes** (`/system/<slug>`, `/guider/<slug>`) om
   produktriktningen bekräftar att enskilda system/guider ska kunna djuplänkas –
   naturligt att göra samtidigt som BI-systemen (Qlik Sense, Grafana, SAP
   BusinessObjects) blir mer framträdande `System`-poster.
4. **Modellera den generiska BI-objektmodellen** (`ReportingContainer`,
   `ReportingAsset`, `ReportingPart`, `ReportingDataBinding`) i
   `docs/03_Informationsmodell.md` och som mockdata, med Qlik Sense som första,
   konkreta exempel.
5. **Utred och dokumentera adaptermönstret** för `SapBusinessObjectsAdapter` i
   `docs/04_Systemarkitektur.md`, konsekvent med `QlikSenseAdapter`/`GrafanaAdapter`.

## 18. Källor från web research

Sökningar gjordes på engelska mot officiell/primär dokumentation och allmänna
branschresurser. Inga interna företagsnamn, interna URL:er eller intern information
förekom i sökningarna.

**URL-struktur och informationsarkitektur:**

- [Information Architecture 101: Techniques and Best Practices – WebFX](https://www.webfx.com/blog/web-design/information-architecture-101-techniques-and-best-practices/)
- [Search basics: URL structure vs Information Architecture – Brainlabs](https://www.brainlabsdigital.com/search-basics-url-structure-vs-information-architecture/)
- [URL Structure Best Practices for Startup Sites – Stackmatix](https://www.stackmatix.com/blog/url-structure-best-practices-startups)
- [Site Architecture and URL Structure – Programmatic SEO Guide](https://direction.com/site-architecture-and-url-structure/)

**Stabila identifierare kontra läsbara slugs:**

- [Designing Human-Readable Identifiers in APIs: Slugs vs IDs – Medium](https://medium.com/@dasbabai2017/designing-human-readable-identifiers-in-apis-slugs-vs-ids-6a8c919ace28)
- [API design: Choosing between names and identifiers in URLs – Google Cloud Blog](https://cloud.google.com/blog/products/api-management/api-design-choosing-between-names-and-identifiers-in-urls)
- [Django Slug + ID URLs: Copying Dev.to's URL pattern – DEV Community](https://dev.to/danielfeldroy/django-slug-id-url-design-3l8b)

**Federerad kontra indexerad/synkad sökarkitektur:**

- USPTO-patentbeskrivningar om federated search-arkitektur och "enterprise crawl and
  search framework"-mönster (allmänna arkitekturbeskrivningar, inte
  produktdokumentation): [Propagating user identities in a secure federated search system](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8214394),
  [Architecture to enable search gateways as part of federated search](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7512588),
  [System and method for supporting heterogeneous solutions … enterprise crawl and search framework](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/9286337)

**Interna utvecklarportaler / kataloger (canonical routing-mönster):**

- [Backstage – Architecture overview](https://backstage.io/docs/overview/architecture-overview/)
- [Backstage – Frontend Routes](https://backstage.io/docs/frontend-system/architecture/routes/)

**Qlik Sense:**

- [Qlik Sense Repository Service API – introduktion](https://help.qlik.com/en-US/sense-developer/1.0/Subsystems/Qlik_Sense_Repository_Service_API/Content/QRS%20API/Repository_Introduction.htm)
- [Getting started – Repository Service API](https://help.qlik.com/en-US/sense-developer/May2026/Subsystems/RepositoryServiceAPI/Content/Sense_RepositoryServiceAPI/RepositoryServiceAPI-Getting-Started.htm)
- [Connecting to the QRS API](https://help.qlik.com/en-US/sense-developer/May2024/Subsystems/RepositoryServiceAPI/Content/Sense_RepositoryServiceAPI/RepositoryServiceAPI-Connect-API.htm)
- [QRS API endpoints (subset)](https://help.qlik.com/en-US/sense-developer/May2024/Subsystems/RepositoryServiceAPI/Content/Sense_RepositoryServiceAPI/RepositoryServiceAPI-QRS-API-Endpoints.htm)

**Grafana:**

- [HTTP API – Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/)
- [Dashboard HTTP API – Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/dashboard/)
- [Folder HTTP API – Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/folder/)
- [Data source HTTP API – Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/data_source/)
- [Folder/Dashboard Search HTTP API – Grafana documentation](https://grafana.com/docs/grafana/latest/developer-resources/api-reference/http-api/folder_dashboard_search/)

**SAP BusinessObjects:**

- [Query the BusinessObjects repository using BI Platform REST SDK (RWS) – SAP Blogs](https://blogs.sap.com/2017/05/10/query-the-businessobjects-repository-using-bi-platform-rest-sdk-rws/)
- [BI Semantic Layer REST API Reference – SAP Help Portal](https://help.sap.com/docs/SAP_BUSINESSOBJECTS_WEB_INTELLIGENCE/58f583a7643e48cf944cf554eb961f5b/ec54808e6fdb101497906a7cb0e91070.html)
- [Business Intelligence Platform RESTful Web Service – SAP Help Portal](https://help.sap.com/docs/SAP_BUSINESSOBJECTS_BUSINESS_INTELLIGENCE_PLATFORM/db6a17c0d1214fd6971de66ea0122378/45aa70186e041014910aba7db0e91070.html)
- [Taking a Closer Look at the BI RESTful API – NTT DATA](https://nttdata-solutions.com/uk/blog/taking-a-closer-look-at-the-bi-restful-api/)

## Kända begränsningar i denna analys

- Ingen av de tre källsystemen (Qlik Sense, Grafana, SAP BusinessObjects) finns
  tillgängliga i denna miljö; mappningen i avsnitt 12 bygger på officiell
  dokumentation, inte en verifierad testintegration.
- Analysen föreslår fält och endpoints som exempel för att göra rekommendationen
  konkret, men dessa är medvetet inte uttömmande kontrakt – det avgörs i respektive
  framtida AB-item och ADR.
- Sökresultatsidans nuvarande begränsning (bara `q` är deep-linkable) beskrivs och
  får ett eget föreslaget AB-item, men löses inte här.
