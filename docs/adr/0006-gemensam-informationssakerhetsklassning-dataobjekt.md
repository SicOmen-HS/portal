# ADR-0006: Gemensam informationssäkerhetsklassning för dataobjekt

## Status

Accepterad

## Datum

2026-07-08

## Kontext

`Dataset` hade en fyrgradig klassning medan `InformationMart`/Dataprodukt endast angav med en boolesk trustsignal om klassning fanns. Det gjorde filter, jämförelser och beslutsunderlag ofullständiga och blandade samman skyddsbehov med tillit och datakvalitet. AN-007 analyserade gränserna och härledning från relaterade datamängder.

## Beslut

Dataset och Dataprodukt använder samma obligatoriska `InformationSecurityClassification`:

1. `open` – Öppen data
2. `internal` – Intern data
3. `sensitive` – Känslig
4. `highly-sensitive` – Mycket känslig

Klassning beskriver informationens skyddsbehov. Den är separat från åtkomstmodell, synlighet, trust, dokumentationsgrad och datakvalitet. Nivå 5.X stöds inte och okända eller saknade värden avvisas.

Dataprodukten bär en explicit klassning. Högsta klassning bland dess relaterade datamängder är en konservativ miniminivå och valideringssignal. Dataprodukten får klassas högre men inte lägre i nuvarande modell. En framtida lägre klassning efter transformation kräver ett separat, spårbart undantagsbeslut och ingår inte nu.

De tidigare datasetvärdena `restricted` och `confidential` ersätts av `sensitive` respektive `highly-sensitive`. Den booleska trustsignalen `classificationAssigned` tas bort som konkurrerande truth source.

## Alternativ som övervägdes

- Separata skalor per objekttyp avvisades eftersom de skulle skapa olika semantik för samma skyddsbehov.
- Att behålla en boolesk produktsignal avvisades eftersom den inte kan filtreras, jämföras eller valideras.
- Blind härledning utan explicit produktvärde avvisades eftersom en produkt kan transformera sitt underlag och behöver ett ansvarigt klassningsbeslut.

## Konsekvenser

- Samma kodvärden, etiketter och ordning används i modell, mockdata och UI.
- Katalogdata valideras tillsammans så trasiga relationer och för låg produktklassning upptäcks.
- Klassning kan visas som beslutsunderlag i åtkomst- och rapportflöden men fattar inget åtkomstbeslut.
- En framtida undantags- eller omklassningsprocess kräver en egen analys och modell.

## Relaterade dokument

- `docs/analysis/AN-007_informationssakerhetsklassning_dataprodukter_datamangder.md`
- `docs/03_Informationsmodell.md`
- `docs/13_Utvecklarguide.md`
- `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`
