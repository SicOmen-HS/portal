# ADR-0003: Generisk BI-objektmodell, första avgränsade steg

## Status

Accepterad

## Datum

2026-07-06

## Kontext

AN-002 ("Utreda URL-struktur, BI-objektmodell och integrationsstrategi för portalen")
rekommenderade en generisk, källsystemsoberoende modell för rapport-/dashboardobjekt
(`ReportingSystem → ReportingContainer → ReportingAsset → ReportingPart →
ReportingDataBinding`) som täcker Qlik Sense, Grafana och SAP BusinessObjects med
samma struktur. Formuläret "Ändra innehåll eller utseende" behövde ett konkret sätt
att låta användaren identifiera vilket BI-objekt en ändringsbegäran gäller, istället
för att peka på en av fyra fasta, fiktiva rapporter i en flat lista. Ingen BI-specifik
objektmodellering fanns sedan tidigare i koden.

## Beslut

- **`ReportingContainer` och `ReportingAsset` införs som nya, permanenta
  informationsmodellobjekt**, dokumenterade i `docs/03_Informationsmodell.md`.
  `ReportingSystem` införs inte som ett eget objekt – det befintliga `System`-objektet
  återanvänds (Qlik Sense och Grafana fanns redan; SAP BusinessObjects lades till som
  en ny `System`-post).
- **`ReportingPart` och `ReportingDataBinding` införs inte i detta steg.** De
  förblir en dokumenterad, framtida utökning (AN-002) tills ett konkret behov (t.ex.
  val av enskilt ark/panel/rapportflik, eller spårning av datakopplingar) motiverar
  dem – ingen spekulativ kod skrivs för dem nu.
- **Etiketter är typdrivna, inte hårdkodade per system.** `containerType`
  (`stream`/`folder`) och `assetType` (`qlik-app`/`grafana-dashboard`/`webi-document`)
  styr vilken prompttext och vilket begrepp som visas (Ström/App för Qlik Sense,
  Mapp/Dashboard för Grafana, Mapp/Web Intelligence-dokument för SAP BusinessObjects),
  så modellen inte behöver ändras om ett fjärde BI-system läggs till.
- **Ansvarig och godkännande är en avgränsad förberedelse, inte ett attestflöde.**
  `ReportingAsset` bär ett fiktivt `responsibleLabel` och en mockad `approvalPolicy`
  (`none` | `responsible-owner`). En lokal demo-växel i UI:t ("Är beställaren
  ansvarig?") påverkar endast visad text/status, aldrig riktig behörighet.

## Motivering

En gemensam, typdriven modell låter portalen visa tre olika BI-plattformar med samma
UI-mönster utan att hårdkoda systemspecifik logik, i linje med
`docs/03_Informationsmodell.md`s princip "tjänster/objekt framför teknik" och
"modellen ska stödja förändring". Att avgränsa till container+asset (och medvetet
skjuta upp part/databinding) håller detta steg litet och granskningsbart samtidigt som
det inte stänger dörren för den fördjupning AN-002 beskriver. Att modellera ansvarig
och godkännandeprincip som ren mockdata, utan riktig behörighetslogik, förbereder ett
framtida godkännandeflöde utan att bygga något som ser ut som säkerhet men inte är det.

## Konsekvenser

### Positiva konsekvenser

- Formuläret identifierar nu ett konkret BI-objekt (system, container, asset) istället
  för en fast, fiktiv rapportlista.
- Samma väljarkomponent och samma modell kan återanvändas när fler flöden behöver
  peka på ett specifikt BI-objekt.
- En framtida `ReportingPart`/`ReportingDataBinding`-utökning kan läggas till utan att
  ändra grundstrukturen.

### Negativa konsekvenser eller risker

- Modellen representerar bara container- och assetnivå; den kan inte ännu peka på ett
  specifikt ark, en panel eller en rapportflik.
- `approvalPolicy`/demo-växeln kan feltolkas som en riktig behörighetskontroll om den
  återanvänds utan att detta dokument eller motsvarande kommentarer läses.

### Saker att följa upp

- Bedöm `ReportingPart`/`ReportingDataBinding` i ett eget AB-item när ett konkret
  behov uppstår (t.ex. val av enskilt ark/panel, eller spårning av datakopplingar).
- Bedöm ett riktigt godkännandeflöde (attest, notifieringar, verklig
  användarjämförelse) som ett separat, senare beslut – inte en förlängning av denna
  mockup-förberedelse.

## Påverkade delar

- frontend (modeller, mockdata, ny delad komponent, formuläret "Ändra innehåll eller
  utseende")
- informationsmodell
- dokumentation

## Relaterade dokument

- `docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md`
- `docs/03_Informationsmodell.md`
- `docs/13_Utvecklarguide.md`

## Relaterade ADR:er

- ADR-0002 (canonical URL-struktur) – opåverkad av detta beslut.
