# ADR-0002: Canonical URL-struktur och alias/redirect-princip för portalen

## Status

Accepterad

## Datum

2026-07-06

## Kontext

AN-002 ("Utreda URL-struktur, BI-objektmodell och integrationsstrategi för portalen")
visade att portalen hade två parallella, delvis överlappande routingmönster: en
generisk katalog+detalj-struktur (`/tjanster/:id`, `/data/:id` med flera) och ett
fristående, state-styrt tjänsteflöde för Rapporter och dashboards på `/behov/rapport`.
Efter AB-007 kunde samma tjänst nås både via den generiska tjänstedetaljen
(`/tjanster/service-reports-dashboards`) och via `/behov/rapport`, utan en uttalad
princip för vilken som var "den riktiga". Åtgärder inom tjänsten (t.ex. "Ändra
innehåll eller utseende") var enbart komponent-state, inte adresserbara routes, vilket
gjorde webbläsarens bakåt/fram, delning och bokmärkning otillförlitliga.

## Beslut

- **Canonical routes för tjänster med ett fördjupat, dedikerat sidflöde ligger under
  `/tjanster/<service-slug>`**, med det redan etablerade, läsbara `id`:t som slug.
- **`/behov/*` är en behovsingång, alias eller redirect – aldrig en egen canonical
  yta.** Den kan finnas kvar som en igenkännbar väg in, men ska alltid föra vidare till
  tjänstens canonical route, inte rendera en parallell kopia av sidan.
- **En gammal eller teknisk route (t.ex. en tidigare id-baserad slug) ska redirecta
  till den nya canonical routen**, inte tas bort utan vidarebefordran, så att befintliga
  länkar och bokmärken fortsätter fungera.
- **En åtgärd med ett eget, meningsfullt flöde (formulär, process, granskning) får en
  egen underroute** under sin tjänst, t.ex. `/tjanster/<service-slug>/<action-slug>`,
  så att den går att adressera, dela och navigera till/från naturligt med
  webbläsarens bakåt/fram. En åtgärd som ännu bara är en kort informationsruta utan
  eget flöde behöver inte få en egen route förrän den byggs ut.

## Motivering

En enda canonical route per objekt är en förutsättning för pålitlig intern
sökbarhet/indexering och för att interna länkar konsekvent ska peka på samma ställe
(`docs/03_Informationsmodell.md`: "En källa per informationsobjekt"). Att låta gamla
vägar redirecta istället för att försvinna skyddar redan delade länkar utan att kräva
att alla referenser hittas och uppdateras samtidigt. Att ge åtgärder med egna flöden
riktiga routes löser den konkreta bakåt/fram-bristen som identifierades i AN-002, utan
att kräva en stor, generell steg-för-steg-routingarkitektur.

## Konsekvenser

### Positiva konsekvenser

- En tjänst har en entydig, delningsbar och bokmärkningsbar canonical URL.
- Gamla vägar (`/behov/rapport`, id-baserade tjänsteslugs) fortsätter fungera som
  redirects istället för att brytas.
- Webbläsarens bakåt/fram fungerar naturligt för åtgärder som fått en egen route.

### Negativa konsekvenser eller risker

- Fler routes att hålla reda på i `app.routes.ts` per tjänst med ett dedikerat flöde.
- Åtgärder som ännu inte fått en egen route (alla utom "Ändra innehåll eller
  utseende" i den första tillämpningen) har fortsatt samma bakåt/fram-begränsning som
  tidigare, tills de byggs ut och får egna routes.

### Saker att följa upp

- Tillämpa samma princip när fler tjänster får ett dedikerat, fördjupat sidflöde.
- Överväg egna detaljroutes för System och Guider (idag samlade listor utan
  per-objekt-routes) om produktriktningen bekräftar behovet (se AN-002, avsnitt 17).

## Relaterade dokument

- `docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md`
- `docs/03_Informationsmodell.md`
- `docs/13_Utvecklarguide.md`

## Relaterade ADR:er

- Inga ännu.
