# Mockdata

Denna katalog innehåller all fiktiv innehållsdata som portalens mockup visar. Filerna
laddas av domänspecifika services i `frontend/src/app/services/` via den generiska
`MockDataService` (`frontend/src/app/core/services/mock-data.service.ts`) – se
`docs/13_Utvecklarguide.md#mockdata` för hur laddningsflödet fungerar i detalj.

## Filöversikt

| Fil                                  | Informationsobjekt (docs/03)             | Används på                                  |
| -------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `services.mock.json`                  | `ServiceOffering`                         | Startsida, Tjänster, Tjänstedetalj             |
| `platforms.mock.json`                 | `PlatformCapability`                       | Tjänstedetalj (sidopanel)                      |
| `systems.mock.json`                   | `System`                                   | System & länkar, Tjänstedetalj                 |
| `system-links.mock.json`              | `SystemLink`                               | System & länkar                                |
| `technical-components.mock.json`      | `TechnicalComponent`                       | Tjänstedetalj (teknisk metadata)               |
| `guides.mock.json`                    | `Guide`                                     | Guider & dokumentation, Tjänstedetalj          |
| `datasets.mock.json`                  | `Dataset`                                   | Data & katalog                                 |
| `data-services.mock.json`             | `DataService`                              | (laddas, ingen egen vy ännu)                   |
| `information-marts.mock.json`         | `InformationMart` — visas i UI som **Dataprodukt**, se `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md` | Data & katalog, Dataprodukt-detalj, sökresultat |
| `business-applications.mock.json`     | `BusinessApplication`                      | Data & katalog                                 |
| `access-groups.mock.json`             | `AccessGroup`                              | (laddas, ingen egen vy ännu)                   |
| `monitoring-subscriptions.mock.json`  | `MonitoringSubscription`                   | (laddas, ingen egen vy ännu)                   |
| `order-flows.mock.json`               | `OrderFlow`                                 | Beställningsdetalj (hanteringsinformation)     |
| `order-types.mock.json`               | `OrderType` (inkl. `OrderStep`, `OrderDependency`) | Beställ & få tillgång, Beställningsdetalj |
| `contacts.mock.json`                  | `ContactPoint`                             | Kontakt & support, Tjänstedetalj               |
| `status.mock.json`                    | `StatusItem` + samlad status               | Status & drift, Startsida                      |
| `teams.mock.json`                     | `Team`                                      | Refereras som `ownerTeamId` (metadata, ingen egen vy) |

## Grundprinciper

* **All data är fiktiv.** Inget objekt i dessa filer beskriver en verklig person,
  ett verkligt system eller en verklig organisationsenhet.
* **Inga riktiga interna URL:er.** Länkar beskrivs alltid som en nyckel
  (`urlKey`, `documentationUrlKey` eller `linkKey`) som slås upp mot
  `frontend/public/assets/config/runtime-config.json` – se
  `docs/13_Utvecklarguide.md#variabelstyrda-urler-och-urlkey`. Skriv aldrig en
  `https://`-adress direkt i en mockfil.
* **Inga riktiga AD-grupper eller personuppgifter.** Ägare och förvaltare anges som
  fiktiva team eller roller (t.ex. `"Exempelteam Försäljningsanalys"`), aldrig som
  namngivna individer.
* **Följ informationsmodellen.** Varje fil motsvarar exakt ett informationsobjekt
  från `docs/03_Informationsmodell.md`. Lägg inte till fält som inte finns i
  motsvarande TypeScript-modell i `frontend/src/app/models/`.

## Lägga till ny mockdata

1. Hitta rätt fil utifrån tabellen ovan (eller motsvarande modell i
   `frontend/src/app/models/` om du är osäker).
2. Lägg till ett nytt JSON-objekt som följer samma struktur som befintliga poster.
3. Använd ett stabilt, beskrivande `id` enligt mönstret i `03_Informationsmodell.md`,
   t.ex. `service-order-dashboard`, `system-qlik-sense`, `guide-order-alarm`.
4. Om objektet innehåller en länk: lägg till en nyckel (`urlKey`/`documentationUrlKey`/
   `linkKey`) istället för en URL, och komplettera
   `frontend/public/assets/config/runtime-config.json` **samt**
   `config/examples/runtime-config.example.json` med motsvarande nyckel.
5. Kör `npm start` i `frontend/` och kontrollera att objektet visas korrekt på
   relevant sida.

Ingen kodändring krävs för att lägga till nya poster i en befintlig fil – services i
`frontend/src/app/services/` läser filerna dynamiskt vid varje sidladdning.
