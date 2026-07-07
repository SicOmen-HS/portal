# AN-005: Beställ, Ärenden och generella portalflöden

## 1. Sammanfattning

Portalen bör skilja på **att hitta en tjänst**, **att initiera en begäran**, **att få
hjälp** och **att följa något som redan skickats in**:

- `/tjanster` är den primära, behovs- och kontextstyrda vägen till handling.
- `/bestall` är en sekundär katalog över sådant som går att beställa eller ansöka om,
  inte hemvist för alla formulär och inte den obligatoriska vägen till ett flöde.
- `/kontakt` är stödytan för rådgivning, kontaktvägar, FAQ och problemrapportering.
- en framtida `/arenden` är den personliga arbetsytan för inskickade ärenden och deras
  status, oavsett om de började som beställning, ändringsbegäran,
  behörighetsansökan eller felanmälan.
- `/status` fortsätter betyda tjänste- och driftstatus. Ärendestatus hör inte där.

`Rapportera problem` bör därför startas på `/kontakt/rapportera-problem`. Efter
inskick ska resultatet kunna visas under `/arenden/<id>`. `Ändra behörighet` som
startas från en tjänst ska enligt ADR-0004 ligga under
`/tjanster/<tjänst>/andra-behorighet` och montera en delad formulärkomponent med
tjänstekontext. En katalogingång utan tjänstekontext kan finnas under `/bestall`, men
ska återanvända samma implementation.

Inför inte `Gemensamma tjänster` eller `/gemensamma-tjanster` som synlig kategori.
Delad kod är inte ett användarbehov och ska inte styra informationsarkitekturen.

## 2. Nuläge och evidens

### 2.1 Routes och navigation

`app.routes.ts` har separata ytor för `/tjanster`, `/bestall`, `/status` och
`/kontakt`, men saknar `/arenden`. `nav-items.ts` visar i dag `Tjänster` som primärt
menyval och `Beställ & få tillgång`, `Status & drift` och `Kontakt & support` som
separata informationsområden.

Det finns redan en viktig semantisk gräns:

- `/status` visar fiktiva incidenter, underhåll och driftpåverkan genom `StatusItem`;
- `/kontakt` visar `ContactPoint`, FAQ, dokumentationslänkar och en avsiktligt osatt
  `TICKETING_SYSTEM_URL`;
- inget route-, komponent-, modell- eller mockdataobjekt representerar ett inskickat
  ärende eller en användares ärendehistorik.

`Ärenden/status` får därför inte läggas in i befintliga `/status`: det skulle blanda
operativ driftinformation med individuell handläggningsstatus.

### 2.2 Vad `/bestall` faktiskt är

`OrderCatalogComponent` listar och filtrerar alla `OrderType`-poster. Varje kort leder
till `/bestall/:id`. `OrderDetailComponent` visar beskrivning, förutsättningar,
godkännande, steg, beroenden, hantering och ansvar. Själva genomförandet ligger bakom
`OrderFlow.linkKey`; om länken saknas skickas användaren till `/kontakt`.

Det gör `/bestall` till en **beställningsbarhets- och processkatalog**: användaren kan
upptäcka vad som går att begära och förstå villkoren, men sidan är inte i sig ett
generellt ärende- eller formulärskal. AN-004 och ADR-0004 har redan visat att
`/bestall/:id` inte ska vara slutlig canonical route för varje tjänsteåtgärd.

Katalogen blandar dessutom olika avsikter: ny resurs, ändring, behörighetsansökan och
larm. Gemensamt är att något begärs och handläggs — inte att alla behöver samma URL
eller formulär.

### 2.3 Tjänstekontext och support

`ServiceOffering` är informationsmodellens centrala användarnära objekt. Den
dedikerade tjänsten Rapporter och dashboards följer DEC-004 genom att börja i
användarens åtgärd och har canonical routes under `/tjanster/...`. I dag länkar
`Ändra behörighet` till `/bestall/order-type-access-group`, medan `Rapportera problem`
ännu är en platshållare.

DEC-005 klassificerar problemrapportering som ett generellt portalflöde. DEC-006 och
ADR-0004 skiljer detta från ett återanvändbart domänflöde: behörighetsändring ska
återanvända en komponent men behålla anropande tjänsts route och kontext;
problemrapportering får en enda portalägd route.

Mockdata förstärker gränsen. `order-type-access-group` gäller flera resurstyper, men
har fortfarande ett konkret mål och en godkännandeprocess. `ContactPoint` beskriver
supportkanaler och servicedesk. Någon synlig kategori `Gemensamma tjänster` finns
inte; den skulle beskriva implementationens delning snarare än användarens behov.

## 3. Rekommenderad begreppsmodell i gränssnittet

| Begrepp | Användarfråga | Portalroll | Exempel |
| --- | --- | --- | --- |
| Tjänst | Vad vill jag göra eller få hjälp med? | Primär start och kontext | Rapporter och dashboards |
| Beställning/ansökan | Vad kan jag begära och vilka villkor gäller? | Katalog och initiering | Ny yta, behörighet |
| Support | Jag behöver hjälp eller något fungerar inte | Rådgivning, kontakt och felanmälan | Rapportera problem |
| Ärende | Vad har jag skickat in och vad händer nu? | Personlig uppföljning efter inskick | Status, historik, komplettering |
| Driftstatus | Fungerar tjänsten för alla just nu? | Portalens operativa status | Incident, underhåll |

`Ärende` bör vara paraplybegreppet **efter inskick**, inte ett nytt namn på alla
ingångar. En beställning, ansökan eller felanmälan behåller sin begripliga typ men får
ett ärende-id och en gemensam statusrepresentation. Det gör det möjligt att samla
uppföljning utan att sudda ut varför användaren kom dit.

## 4. Rekommenderade routeprinciper

1. **Intent och ägarskap avgör canonical route; komponentdelning gör det inte.**
2. **Tjänstestartade åtgärder behåller tjänstekontext:**
   `/tjanster/<service-slug>/<action-slug>`, även när formulärkomponenten delas.
3. **`/bestall` är en katalog och alternativ ingång:**
   - `/bestall` listar beställningsbara/ansökningsbara erbjudanden;
   - en katalogdetalj beskriver villkor och leder till rätt canonical flöde;
   - samma delade formulär får monteras i generiskt läge där det är värdefullt, men
     alla formulär flyttas inte hit.
4. **`/kontakt` äger supportstart:** `/kontakt/rapportera-problem` är canonical route
   för det generella problemflödet. En tjänst får länka dit och skicka med säker,
   icke-auktoritativ kontext, men routen fungerar även fristående.
5. **`/arenden` äger uppföljning efter inskick:**
   - `/arenden` — användarens samlade inskickade ärenden;
   - `/arenden/<id>` — status, tidslinje och eventuell komplettering;
   - typen visas som metadata: beställning, ändringsbegäran, behörighetsansökan,
     felanmälan eller supportärende.
6. **`/status` reserveras för driftstatus**, aldrig individuell handläggning.
7. **Alias redirectar till canonical route** enligt ADR-0002; parallella kopior av
   samma sida ska inte byggas.
8. **Skapa inte `/gemensamma-tjanster`.** Återanvändning sker genom komponenter,
   formulärfunktioner och strukturerat innehåll enligt ADR-0004.

### Konkreta placeringar

- `Rapportera problem`: `/kontakt/rapportera-problem` → efter inskick
  `/arenden/<id>`.
- `Ändra behörighet` från Rapporter och dashboards:
  `/tjanster/rapporter-och-dashboards/andra-behorighet`.
- `Ändra behörighet` utan tjänstekontext: upptäck via `/bestall`; katalogen leder
  till eller monterar samma delade flöde i generiskt läge. Exakt underroute bör
  fastställas i implementeringsitemet, inte genom att skapa en andra implementation.
- `Mina ärenden`: `/arenden`, inte `/bestall`, `/kontakt` eller `/status`.

## 5. Navigation

Rekommenderad informationshierarki när funktionerna finns:

- **Tjänster** är fortsatt primär huvudväg: börja i behov och tjänstekontext.
- **Beställ & ansök** är en sekundär katalog/genväg för användare som redan vet vad
  de vill begära. Nuvarande `Beställ & få tillgång` kan behållas tills ett separat
  språk-/UI-item prövar etiketten.
- **Kontakt & support** hjälper användaren välja väg, kontakta ansvarig eller
  rapportera problem.
- **Mina ärenden** visar inskickat arbete och status. Visa menyvalet först när sidan
  har verkligt eller tydligt avgränsat mockat innehåll.
- **Status & drift** förblir separat utility-/driftyta.

Navigationen bör alltså inte presentera `Beställningar` och `Ärenden` som synonymer:
den ena är vad användaren kan starta, den andra vad användaren redan har startat.

## 6. Prövning av hypoteserna

1. **`/bestall` bör vara katalog, inte hem för alla formulär — bekräftad.** Koden är
   redan en sökbar `OrderType`-katalog och ADR-0004 avvisar URL-centralisering som
   återanvändningsmetod.
2. **Tjänstens åtgärdsroute bör vara primär från en tjänst — bekräftad.** Detta följer
   ADR-0002, DEC-004 och ADR-0004 och bevarar begriplig kontext.
3. **`/arenden` bör användas för inskickade ärenden och status — bekräftad med
   avgränsning.** Den bör inte automatiskt äga alla startformulär; generella
   ärendeflöden placeras efter avsikt, därefter samlas resultaten under `/arenden`.
4. **`/kontakt` bör vara stöd- och supportnära men inte bära hela ärendemodellen —
   bekräftad.** Befintlig komponent och `TICKETING_SYSTEM_URL` stödjer
   problemrapportering, men individuell uppföljning kräver en separat yta.
5. **`/gemensamma-tjanster` bör inte vara teknisk lösning — bekräftad.** Ingen sådan
   användarkategori behövs; delning hör hemma i implementation och innehållsrelationer.
6. **Återanvändning ska ske via komponenter/funktioner, inte samma URL — bekräftad.**
   Det är redan permanent beslutat i ADR-0004.

## 7. Permanent dokumentation som föreslås

Ingen permanent styrfil ändras i AN-005. Efter projektägarens godkännande bör ett
separat AB-item:

1. skapa en ADR om namespace- och livscykelprincipen för `/bestall`, `/kontakt`,
   `/arenden` och `/status`, inklusive skillnaden mellan initiering och uppföljning;
2. lägga till en kort DEC-post som pekar på ADR:n och fastslår produktbegreppen;
3. uppdatera `docs/13_Utvecklarguide.md` med routeexemplen och
   `docs/project/DOCUMENT_INDEX.md` med den nya ADR:n.

Detta bör vara en ny ADR, inte en omskrivning av ADR-0004: ADR-0004 äger
komponentdelning och tjänstekontext, medan detta beslut äger portalens tvärgående
begrepp och route-namespace. Informationsmodellen ska inte ändras i
dokumentationsitemet.

## 8. Prioriterad roadmap

1. **Nästa AB: dokumentera portalens begrepps- och routeprincip permanent.** Ny ADR,
   DEC-sammanfattning, utvecklarguide och dokumentindex; ingen UI eller modelländring.
   Detta låser vokabulär och namespace innan fler flöden byggs.
2. **Bygg delat Ändra behörighet i tjänstekontext.** Montera samma formulärfunktion
   under Rapporter och dashboards och relevant generisk katalogingång; ersätt dagens
   läsande `/bestall`-fallback. Avgränsa eventuell modelländring separat enligt
   AN-004.
3. **Bygg generellt Rapportera problem under `/kontakt`.** Behåll det frikopplat från
   en full ärendemotor; använd mockat kvitto om riktig integration saknas.
4. **Analysera informationsmodell och integration för inskickade ärenden.** Definiera
   minsta framtida ärendebegrepp, typ, status, ägarskap och extern systemgräns innan
   `/arenden` byggs. Nuvarande modell saknar detta uttryckligen.
5. **Bygg `/arenden`/Mina ärenden först efter modellbeslutet.** Håll driftstatus på
   `/status` och märk varje ärende med ursprunglig typ.
6. **Städa katalog och navigation.** Låt tjänsteägda `OrderType`-poster länka till
   canonical tjänsteflöde och pröva etiketten `Beställ & ansök`; undvik att visa
   tekniska delningskategorier.

## 9. Risker och öppna frågor

- Ett `/arenden` utan autentisering, backend eller ärendekälla kan bara bli en
  demonstrativ mock. Det får inte framstå som verklig personlig status.
- Informationsmodellen saknar ett generellt ärendeobjekt. Att införa ett är out of
  scope här och kräver separat analys/ADR eftersom projektreglerna förbjuder en
  parallell modell utan prövning.
- Det är ännu inte beslutat om en generisk behörighetsingång ska ha en interaktiv
  `/bestall/...`-route eller endast katalogdetalj som leder vidare. Båda kan följa
  ADR-0004 om de monterar/länkar till samma implementation; implementeringsitemet bör
  välja utifrån den faktiska användarresan.
- Namnet `Beställ & ansök` är en rekommendation att användartesta, inte en genomförd
  terminologiändring.

## 10. Granskat underlag och avgränsning

Analysen bygger på repositoryversionen i arbetskopian 2026-07-07:

- styrning: `PROJECT_RULES.md`, `DOCUMENT_INDEX.md`, `DECISIONS.md`, ADR-0004 och
  AN-004;
- referens: `03_Informationsmodell.md`, `12_Designsystem_och_UI.md` och
  `13_Utvecklarguide.md`;
- frontend: `app.routes.ts`, `nav-items.ts`, orderkatalog/-detalj, support, status,
  tjänstedetalj och Rapporter och dashboards-flödet;
- modeller/mockdata: `ServiceOffering`, `OrderType`, `OrderFlow`, `ContactPoint`,
  `StatusItem`, `services.mock.json`, `order-types.mock.json`,
  `order-flows.mock.json`, `contacts.mock.json` och `status.mock.json`.

Ingen källkod, route, komponent, mockdata eller informationsmodell har ändrats.
Rapporten är analys och rekommendation; inga nya routes eller funktioner är införda.
