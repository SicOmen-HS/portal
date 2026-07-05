# Frontend runtime-konfiguration

Denna katalog innehåller portalens **publika frontend-runtime-konfiguration** – den
enda konfiguration frontend-koden känner till. Se `docs/05_Konfiguration.md` och
`docs/13_Utvecklarguide.md#runtime-konfiguration` för den fullständiga bakgrunden.

## Filer

| Fil                     | Versionshanterad? | Beskrivning                                                        |
| ------------------------ | ------------------- | --------------------------------------------------------------------- |
| `runtime-config.json`   | Ja                 | Läses av mockupen vid uppstart. Innehåller endast säkra exempelvärden (`example.local`-länkar) – se nedan för varför den ändå är säker att versionshantera i det här projektet. |

Den generella mallen för framtida miljöer ligger separat i
`config/examples/runtime-config.example.json` (repositoryts rotkatalog) – se
`config/README.md`.

## Vad filen innehåller

```json
{
  "apiBaseUrl": "/api",
  "applicationName": "Data- och analysportalen",
  "environmentLabel": "Lokal mockup",
  "features": {
    "showStatusPanel": true,
    "showDataCatalog": true,
    "showOrderFlows": true,
    "showTechnicalMetadata": true,
    "useMockData": true
  },
  "systemUrls": {
    "OPENMETADATA_URL": "https://example.local/openmetadata"
  }
}
```

* `apiBaseUrl` – basväg för ett framtida backend-API. Används inte av mockupen idag
  eftersom det inte finns någon backend, men fältet finns med för att inte behöva
  ändra strukturen när ett API införs.
* `applicationName` / `environmentLabel` – visningstext, ingen hemlig information.
* `features` – feature flags som styr vilka delar av UI:t som visas. Se
  `docs/05_Konfiguration.md` för principen bakom feature flags.
* `systemUrls` – nyckel/värde-karta som mappar `urlKey`/`documentationUrlKey`/
  `linkKey` (satta i mockdata, se `frontend/public/assets/mock/README.md`) till en
  faktisk URL. Slås upp av `SystemUrlService`
  (`frontend/src/app/core/links/system-url.service.ts`).

## Varför `runtime-config.json` är versionshanterad i just detta projekt

`docs/05_Konfiguration.md` beskriver att miljöspecifika konfigurationsfiler normalt
**inte** ska versionshanteras – bara `.example`-varianter. I denna mockup innehåller
`runtime-config.json` dock **uteslutande säkra exempelvärden** (`example.local`-URL:er,
`true`/`false`-flaggor, ingen hemlig information), vilket gör den skillnad från en
miljöspecifik fil i produktionsmening. Den checkas in av ett enda skäl: mockupen ska
kunna klonas och köras med `npm install && npm start` utan något manuellt
konfigurationssteg (se root-`README.md`).

**Om projektet senare kopplas mot en riktig, miljöspecifik driftsättning** ska denna
princip ändras:

1. Lägg till `frontend/public/assets/config/runtime-config.json` i `.gitignore`.
2. Behåll endast `config/examples/runtime-config.example.json` versionshanterad.
3. Generera den riktiga `runtime-config.json` som ett steg i deployment-pipelinen
   (se `docs/10_Release_och_deployment.md`), aldrig manuellt i repot.

## Vad filen aldrig får innehålla

* Lösenord, tokens, client secrets eller API-nycklar.
* Connection strings eller certifikatsökvägar.
* Riktiga interna URL:er, servernamn eller miljönamn.
* Personuppgifter eller produktionsdata.

Frontend-konfiguration är per definition synlig för alla som öppnar webbläsarens
utvecklarverktyg – därför gäller samma regler som för öppen källkod (se
`docs/05_Konfiguration.md`, avsnittet "Frontend-konfiguration").

## Lägga till en ny konfigurationsnyckel

Se `docs/13_Utvecklarguide.md#lägga-till-ny-systemlänk` för en steg-för-steg-guide.
Kom ihåg att lägga till nyckeln i **både** denna fil och
`config/examples/runtime-config.example.json`.
