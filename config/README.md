# Konfiguration – exempel och mallar

Denna katalog innehåller **exempel- och mallfiler** för konfiguration som antingen
används av mockupen idag, eller är förberedd för framtida delar av projektet (t.ex.
en .NET-backend enligt `docs/04_Systemarkitektur.md`). Inget här är miljöspecifikt
eller känsligt – se `docs/05_Konfiguration.md` för de fullständiga principerna.

## Filer

| Fil                                     | Status                              | Beskrivning                                                                 |
| ----------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| `examples/runtime-config.example.json`   | Mall, versionshanterad               | Mall för frontendens runtime-konfiguration. Motsvarar strukturen i den faktiska filen `frontend/public/assets/config/runtime-config.json`, men med `<PLATSHÅLLARE>` istället för exempelvärden. |
| `examples/appsettings.example.json`      | Mall, versionshanterad, ej i bruk än | Mall för en framtida .NET-backends konfiguration (`04_Systemarkitektur.md`). Används inte av något i repot idag – dokumenterar bara avsedd struktur. |

## Relation till den faktiska frontend-konfigurationen

Den fil frontend faktiskt läser vid körning ligger under
`frontend/public/assets/config/runtime-config.json`, inte här. Se
`frontend/public/assets/config/README.md` för varför den filen (till skillnad från
normal praxis) är versionshanterad i just detta mockup-projekt, och hur nycklarna i
`systemUrls` hänger ihop med `urlKey`/`documentationUrlKey`/`linkKey` i mockdata.

Kort sagt:

```text
config/examples/runtime-config.example.json   ← mall, dokumentation, <PLATSHÅLLARE>
frontend/public/assets/config/runtime-config.json  ← faktisk fil mockupen läser, example.local-värden
```

Håll dessa två filer i synk strukturellt (samma nycklar) – annars blir mallen
missvisande för nästa miljö portalen driftsätts i.

## Backend-konfiguration

`appsettings.example.json` beskriver den konfigurationsstruktur en framtida .NET
Web API bör använda (connection strings, integrationsendpoints, autentisering, CORS)
enligt `docs/05_Konfiguration.md`. Filen är inte kopplad till någon kod i repot idag –
den finns för att redan nu visa vilken struktur backend-konfigurationen är tänkt att
följa, så att en framtida backend kan implementeras utan att behöva uppfinna
konfigurationsmodellen på nytt.

## Vad som aldrig får läggas till här

* Riktiga connection strings, tokens, lösenord eller certifikat.
* Riktiga interna URL:er, servernamn, namespaces eller registry-adresser.
* Miljöspecifika värden av något slag – dessa hör hemma i intern konfiguration eller
  secret-hantering när/om projektet driftsätts internt (`docs/10_Release_och_deployment.md`),
  aldrig i detta generiska repository.
