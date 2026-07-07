# ADR-0005: Namespace- och livscykelprincip för portalflöden

## Status

Accepterad

## Datum

2026-07-07

## Beslutsfattare

Projektägaren för Data- och analysportalen.

## Kontext

Portalen har separata ytor för tjänster, beställningar, kontakt och driftstatus, men
saknar en permanent princip för hur dessa ytor ska förhålla sig till framtida
ärendeuppföljning. `AN-005` visade att användarens resa behöver skilja mellan att
hitta rätt tjänst, initiera en begäran eller felanmälan, få stöd, följa något som
redan skickats in och se portalens driftstatus.

Utan en sådan gräns riskerar `/bestall` att bli hem för alla formulär, `/kontakt` att
bära hela ärendemodellen eller `/status` att blanda individuell handläggning med
operativ drift. En teknisk samlingskategori som `/gemensamma-tjanster` skulle dessutom
göra komponentdelning till användarnavigation, i strid med portalens behovsstyrda
principer.

ADR-0002 äger canonical routes för tjänster. ADR-0004 äger klassificeringen av
tjänstespecifika, återanvändbara och generiska flöden samt hur komponenter delas.
Denna ADR kompletterar dem genom att fastställa portalens övergripande namespace och
livscykel: var en resa börjar och var ett inskickat resultat följs upp.

## Beslut

Portalens namespaces har följande varaktiga roller:

| Namespace | Användarens avsikt | Roll |
| --- | --- | --- |
| `/tjanster` | Hitta något att göra, använda eller få hjälp med | Primär, kontextstyrd start för användarbehov och tjänsteåtgärder |
| `/bestall` | Se vad som går att beställa eller ansöka om och förstå villkoren | Sekundär katalog och alternativ ingång; inte hem för alla formulär |
| `/kontakt` | Få rådgivning, hitta kontaktväg eller rapportera ett problem | Stöd- och supportstart; bär inte hela ärendeuppföljningen |
| `/arenden` | Följa det som redan har skickats in | Framtida, samlad uppföljningsyta för inskickade ärenden |
| `/status` | Se om tjänster och system fungerar | Reserverat för operativ driftstatus, incidenter och underhåll |

Följande route- och livscykelregler gäller:

1. `/tjanster` är den primära vägen när användaren börjar i ett behov eller en
   tjänstekontext. En tjänstestartad åtgärd behåller canonical route
   `/tjanster/<service-slug>/<action-slug>` enligt ADR-0002 och ADR-0004, även när
   formulärkomponenten delas med andra tjänster.
2. `/bestall` är en sekundär katalog över beställningsbara och ansökningsbara
   erbjudanden. Katalogen får beskriva villkor och leda till rätt canonical flöde,
   men alla beställningar, ansökningar och ändringsbegäranden flyttas inte till samma
   URL enbart för att de delar formulärfunktioner.
3. `/kontakt/rapportera-problem` är canonical route för det framtida generella
   problemflödet. Tjänster och andra ytor får länka dit och överföra relevant kontext,
   men flödet ska fungera utan en föregående tjänstekontext. Beslutet innebär inte att
   routen eller formuläret redan är implementerat.
4. `/arenden` är den framtida uppföljningsytan **efter inskick**. Där ska en användare
   kunna följa beställningar, ansökningar, ändringsbegäranden, felanmälningar och
   supportärenden utan att deras ursprungliga typ suddas ut. `/arenden/<id>` är den
   rekommenderade detaljformen. Beslutet inför varken route, sida eller
   informationsmodellobjekt i nuvarande mockup.
5. `/status` används endast för gemensam driftstatus. Individuell ärendestatus ska
   inte visas eller modelleras där.
6. `/gemensamma-tjanster` ska inte införas som synlig kategori, namespace eller
   teknisk lösning för delade formulär. Delning sker genom komponenter,
   formulärfunktioner och strukturerat innehåll enligt ADR-0004, inte genom en
   användarsynlig teknisk samlingsyta.
7. En beställning, ansökan, ändringsbegäran eller felanmälan behåller sitt begripliga
   användarbegrepp när den initieras. `Ärende` är paraplybegreppet för gemensam
   uppföljning efter inskick, inte ett ersättningsnamn för alla startpunkter.

## Alternativ som övervägdes

### Låt `/bestall` äga alla formulär och all uppföljning

Avvisat. Det förlorar tjänstekontext, blandar initiering med uppföljning och strider
mot ADR-0004:s princip att återanvändning inte avgör URL.

### Låt `/arenden` äga både alla startformulär och uppföljning

Avvisat. Det gör användarens avsikt mindre tydlig: en felanmälan, ansökan och
beställning behöver begripliga startpunkter även om de efter inskick följs gemensamt.

### Samla support, ärenden och driftstatus under `/kontakt` eller `/status`

Avvisat. Rådgivning, individuell handläggning och gemensam driftpåverkan är olika
livscykler och målgruppsfrågor.

### Inför `/gemensamma-tjanster` för återanvändbara flöden

Avvisat. Teknisk återanvändning är inte en användarkategori och skulle exponera
implementationens struktur som navigation.

## Motivering

Beslutet följer informationsmodellens princip att användaren ska möta behov och
tjänster före teknik. Det bevarar en tydlig mental modell: börja i behovet, initiera
rätt typ av begäran, få stöd när det behövs, följ inskickat arbete på ett ställe och
håll driftstatus separat. Samtidigt kompletterar det ADR-0004 utan att konkurrera med
dess komponentprincip.

## Konsekvenser

### Positiva konsekvenser

- Nya routes får en tydlig semantisk ägare innan de implementeras.
- Beställningskatalog, support, ärendeuppföljning och driftstatus kan utvecklas utan
  att överlappa varandras ansvar.
- Delade formulär kan återanvändas utan en tekniskt motiverad användarkategori.

### Negativa konsekvenser eller risker

- Nuvarande mockup avviker tillfälligt från målbilden när tjänsteåtgärder länkar till
  läsande `/bestall/:id`-sidor; ADR-0004 dokumenterar denna kompromiss.
- `/kontakt/rapportera-problem` och `/arenden` kan misstolkas som befintliga om
  dokumentation inte markerar dem som framtida tills de har implementerats.
- En riktig `/arenden`-yta kräver separat beslut om informationsmodell,
  autentisering och integrationsgräns.

### Saker att följa upp

- Bygg delat "Ändra behörighet" i tjänstekontext enligt ADR-0004.
- Bygg det generella problemflödet under `/kontakt/rapportera-problem` i ett separat
  AB-item.
- Analysera ärendemodell och integration innan `/arenden` eller "Mina ärenden" byggs.

## Påverkade delar

- routingprinciper
- tjänste-, beställnings- och supportflöden
- framtida ärendeuppföljning
- dokumentation

Ingen kod, route, informationsmodell eller mockdata ändras av detta beslut.

## Relaterade dokument

- `docs/analysis/AN-005_bestall_arenden_generella_portalfloden.md`
- `docs/project/DECISIONS.md` (DEC-005, DEC-006, DEC-007)
- `docs/03_Informationsmodell.md`
- `docs/13_Utvecklarguide.md`

## Relaterade ADR:er

- ADR-0002: canonical URL-struktur för tjänster.
- ADR-0004: route- och komponentprincip för tjänstespecifika, återanvändbara och
  generiska flöden.
