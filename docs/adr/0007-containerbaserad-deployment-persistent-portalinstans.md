# ADR-0007: Containerbaserad deployment för persistent portalinstans

## Status

Accepterad

## Datum

2026-08-18

## Beslutsfattare

Projektägaren, Data- och analysportalen. Förslaget togs fram av Portal / Data Platform och granskades och godkändes av projektägaren 2026-08-18.

## Kontext

Portalen behöver kunna köras som en persistent instans i labbmiljön: en instans som inte
är beroende av ett öppet SSH-/terminalfönster, som kan starta om automatiskt, och som kan
användas för integrationsverifiering mot labbmiljöns tjänster (t.ex. SQL Server via
`Portal.Api`s dataset- och tekniska discovery-adaptrar, AB-027–AB-032).

**Verifierat nuläge (`origin/main`):**

- Frontend (Angular) körs idag som utvecklingsserver (`ng serve`) och har en fungerande
  produktionsbyggnad (`ng build`) vars resultat är en ren, statisk filuppsättning
  (`index.html`, JS/CSS-bundlar, `assets/`) utan server- eller SSR-komponent.
- Backend (`Portal.Api`, .NET Web API, `net10.0`) körs idag via `dotnet run` och kan
  publiceras som en fristående, framework-beroende artefakt (`dotnet publish`). Den
  publicerade artefakten är oberoende av `Properties/launchSettings.json` (som endast
  används av `dotnet run`/IDE) och binder istället URL/port via standardiserade
  ASP.NET Core-miljövariabler.
- Backend exponerar redan en minimal `/health`-endpoint som inte kräver databasanslutning
  och inte exponerar känslig information.
- Backend läser redan all miljöberoende konfiguration via ASP.NET Core:s standardmodell
  (`appsettings.json` som miljöneutral bas + `appsettings.{Environment}.json` som är
  gitignorat + miljövariabler), utan hårdkodade miljövärden.
- Frontend läser redan miljöspecifik konfiguration vid körning via en separat
  `runtime-config.json`, med en dokumenterad väg för att generera en miljöspecifik
  variant vid deployment utan att bygga om applikationen.
- Repositoryt saknar idag varje form av faktisk, persistent deploymentmekanism för
  portalen: inga Dockerfiles, ingen Compose-definition, inga systemd-units och ingen
  repoägd reverse-proxy-konfiguration finns.

**Verifierad Hosting Lab-inventering (read-only, godkänd av projektägaren):**

- Docker/Compose är det etablerade driftmönstret för applikations- och
  data-/analystjänster i labbmiljön, inklusive de tjänster portalen redan integrerar
  mot eller är tänkt att integrera mot (SQL Server, Trino, OpenMetadata, Dagster).
- En containeriserad reverse proxy används redan som etablerat mönster för att exponera
  webbapplikationer i labbmiljön.
- Hosting Lab använder redan separata driftenheter (stackar) och nätverk per tjänst som
  etablerat mönster, samt har en delegerings-/kontrollmodell för vilka driftenheter som
  får styras och av vem.
- systemd förekommer i labbmiljön, men observerades användas för Hosting Labs eget
  kontrollplan/infrastrukturtjänster - inte för applikationer av portalens typ. Inget
  prejudikat för att köra en applikation som portalen via systemd hittades i labbmiljön.
- Hosting Lab har redan ett etablerat, dokumenterat mönster för extern secrets-hantering
  utanför Git, skilt från applikationens egen kod och konfiguration.
- Både .NET- och Node-runtime finns installerat i labbmiljön, vilket gör båda
  nedanstående alternativ tekniskt genomförbara rent tekniskt.

Ovanstående Hosting Lab-fakta är medvetet beskrivna generellt. Servernamn, IP-adresser,
interna hostnames/URL:er, konkreta portar, serverkataloger, Docker-nätverksnamn,
service-konton, secrets-sökvägar och fullständig reverse-proxy-konfiguration hör inte
hemma i detta repository och beskrivs inte här.

**Framtida målbild (separat, ej vägledande för detta beslut i sig):** portalens
dokumenterade framtida produktionsarkitektur (`docs/04_Systemarkitektur.md`,
`docs/10_Release_och_deployment.md`) pekar mot containerbaserad drift via
OpenShift/Kubernetes. Detta är ett understödjande Portal-arkitekturargument, inte ett
bevis för hur Hosting Lab faktiskt fungerar idag.

**Grundprincip som gäller oavsett valt alternativ:** samma applikationskod och
byggartefakter ska kunna användas lokalt, i labbmiljön och senare i en framtida
jobbmiljö. Miljöskillnader ska tillföras via extern runtime-konfiguration och secrets,
aldrig via kodändring. Repositoryt ska förbli fritt från labbspecifik information och
secrets. `ng serve` och `dotnet run` är utvecklingsmekanismer och utgör inte i sig en
persistent deploymentmodell.

## Beslut

**Portalinstansen ska vara containerbaserad.**

Portal / Data Platform äger:

- containeriserbara frontend- och backendartefakter (byggdefinitioner, t.ex.
  Dockerfiles eller motsvarande, som producerar en miljöoberoende image),
- applikationens runtime-konfigurationskontrakt (vilka konfigurationsnycklar och
  miljövariabler `Portal.Api` respektive frontend förväntar sig),
- health-kontraktet (`/health`),
- den logiska kommunikationen mellan frontend och backend (bas-URL/adresskontrakt,
  se Same-origin nedan).

Hosting Lab äger:

- den faktiska Compose-kompositionen och containerruntimen,
- restart-policy,
- Docker-nätverk,
- reverse proxy/webbexponering,
- secrets-lagring och secrets-injektion i den körande miljön,
- serverkataloger, filrättigheter, servicekonton och övrig serverkonfiguration.

Hosting Labs faktiska driftkonfiguration (Compose-filer med miljö-/servervärden,
nätverksnamn, reverse-proxy-konfiguration) är inte och ska inte bli en
Portal-repositoryägd artefakt. Portal / Data Platform äger enbart det generiska
byggkontraktet (t.ex. en Dockerfile som beskriver hur en image byggs från källkod),
inte hur den körs på servern.

### Frontend

- Angular byggs som produktionsbygge (`ng build`).
- Byggresultatet (statiska filer) serveras som statiskt innehåll i den
  containerbaserade modellen.
- Miljöspecifik frontendkonfiguration (t.ex. `runtime-config.json`s innehåll) tillförs
  externt vid deployment/runtime, aldrig inbyggd i källkod eller image.
- Labbspecifika URL:er får aldrig byggas in i källkod eller image.
- Valet av statisk webbserverkomponent inne i frontend-imagen (t.ex. vilken
  webbserverprodukt som serverar de byggda filerna) är en implementationsdetalj som
  inte behöver beslutas i detta ADR och lämnas till efterföljande implementation-AB.

### Backend

- `Portal.Api` containeriseras som .NET Web API.
- Runtime-konfiguration och secrets (t.ex. `ConnectionStrings:Default`,
  `AllowedOrigins`, `DatasetDiscovery:SourceId`, `DatasetDiscovery:SchemaPattern`)
  levereras externt till containern, aldrig inbyggda i image.
- Imagen innehåller inga miljöspecifika värden.
- `/health` används som grundläggande health-kontrakt mot containerruntimen.
- Integrationer (t.ex. SQL Server) får sina anslutningsuppgifter uteslutande från
  extern konfiguration.

Detta ADR definierar kontraktet - inte Hosting Labs secrets-implementation.

### Same-origin

**Verifierat i frontendkoden (`origin/main`):** `RuntimeConfig.apiBaseUrl` har redan
default-värdet `/api` (en relativ adress), och konsumeras redan idag som en enkel
strängsammansättning (`` `${apiBaseUrl}/datasets/...` ``) direkt till Angulars
`HttpClient`, som löser relativa adresser mot sidans egen origin. En relativ `/api`-bas
fungerar alltså redan idag utan kodändring.

**Beslut:** portalens normala deployment bör exponera frontend och backend under samma
origin, t.ex.:

- `/` → frontend
- `/api/...` → `Portal.Api`

Detta håller webbläsararkitekturen enkel, undviker onödig cross-origin-kommunikation
och minskar behovet av miljöspecifik CORS-konfiguration. Den faktiska
reverse-proxy-konfigurationen som realiserar detta ägs av Hosting Lab, inte av detta
repository.

### Secrets/config

- Images ska vara miljöoberoende.
- Inga secrets byggs in i images.
- `Portal.Api` tar emot miljöspecifik konfiguration externt via redan stödd ASP.NET
  Core-konfiguration (miljövariabler och/eller monterad konfiguration).
- Frontend får miljöspecifik runtime-konfiguration externt vid deployment.
- Hosting Lab beslutar hur lagrade secrets injiceras säkert i den faktiska
  Compose-runtimen. Inga Hosting Lab-specifika sökvägar eller kontonamn anges här.

## Alternativ som övervägdes

### Alternativ A - Docker/Compose (valt förslag)

Kort beskrivning: byggd Angular-frontend och containeriserad `Portal.Api`, med extern
runtime-konfiguration/secrets. Hosting Lab ansvarar för Compose/runtime/restart/
nätverk/reverse proxy.

Fördelar:

- Matchar det verifierade, etablerade Hosting Lab-mönstret för denna tjänstekategori.
- Matchar den tjänstekategori portalen tillhör (applikation/data-plattformstjänst),
  till skillnad från Hosting Labs egna kontrollplanstjänster.
- Passar den framtida, dokumenterade container-/OpenShift-riktningen.
- Tydlig separation mellan image (miljöoberoende) och miljökonfiguration (extern).
- Återanvänder en redan etablerad restart-, nätverks- och reverseproxy-modell i
  labbmiljön istället för att uppfinna en ny.

Nackdelar:

- Portal / Data Platform behöver underhålla container-builddefinitioner.
- Frontendens statiska serveringsmodell inuti imagen måste konkretiseras i ett senare
  implementation-AB.
- Containerimages behöver byggas och versionshanteras.

### Alternativ B - systemd + webbserver

Kort beskrivning: byggd Angular-frontend serverad statiskt, publicerad `Portal.Api` som
systemd-service, med extern runtime-konfiguration/secrets. Hosting Lab ansvarar för
systemd/webbserver/restart/nätverk.

Fördelar:

- Tekniskt fullt möjligt: både .NET- och Node-runtime finns redan installerat i
  labbmiljön, ingen ny runtime-installation krävs.
- Inga containerlager mellan applikation och OS.

Nackdelar:

- Saknar observerat prejudikat för applikationer av portalens typ i den verifierade
  Hosting Lab-inventeringen - systemd användes där uteslutande för Hosting Labs eget
  kontrollplan/infrastrukturtjänster, inte för applikationer.
- Skulle skapa en deploymentväg som avviker från hur labbmiljöns övriga
  applikations-/data-plattformstjänster (inklusive de portalen redan integrerar mot)
  faktiskt drivs.
- Återanvänder mindre av den dokumenterade, framtida containerbaserade målbilden.

Detta är en observerad avvikelse i sammanhanget, inte en generell teknisk brist hos
systemd som mekanism.

## Motivering

Alternativ A väljs som föreslaget beslut eftersom det är det enda alternativet som
matchar labbmiljöns redan verifierade, etablerade driftmönster för just denna
tjänstekategori, det håller en tydlig gräns mellan Portal-ägda artefakter och Hosting
Lab-ägd drift (`docs/00_Projektprinciper.md`, principerna om säkerhet först och
konfiguration före kod), det introducerar inget nytt driftparadigm i labbmiljön, och
det ligger i linje med portalens dokumenterade, om än separat beslutade, framtida
containerbaserade produktionsriktning. Alternativ B avvisas inte för att det är
tekniskt underlägset, utan för att det saknar stöd i den faktiskt observerade miljön
och skulle introducera en parallell, oprövad deploymentmodell.

## Konsekvenser

### Positiva konsekvenser

- Samma grundläggande artefaktmodell (container-image) kan i princip återanvändas
  mellan labbmiljön och en framtida containerbaserad produktionsplattform.
- Tydlig, bevarad gräns mellan Portal / Data Platform och Hosting Lab.
- Miljöoberoende images - samma byggartefakt kan användas i flera miljöer.
- Ett redan existerande Hosting Lab-driftmönster kan återanvändas istället för att ett
  nytt behöver etableras.
- Persistent drift kan uppnås utan att förlita sig på utvecklingsservrar
  (`ng serve`/`dotnet run`).

### Negativa konsekvenser eller risker

- Portal / Data Platform behöver nu underhålla container-builddefinitioner som en del
  av repositoryt.
- Frontendens statiska serveringsmodell inuti containern måste konkretiseras i
  implementation-AB:t.
- Containerimages behöver byggas och versionshanteras över tid.
- Hosting Lab behöver skapa den faktiska runtime-kompositionen (utanför detta
  repository och detta ADR:s mandat).
- Framtida CI/CD för att bygga och publicera images är fortsatt olöst och ingår inte i
  detta beslut.

### Saker att följa upp

- Implementation-AB: containeriserbara build-definitioner (t.ex. Dockerfiles) för
  frontend och backend, i linje med detta ADR:s kontrakt.
- Hosting Lab-uppföljning (utanför detta repository): faktisk Compose-komposition,
  reverse-proxy-konfiguration för same-origin-exponering, secrets-injektion.
- Bekräfta i implementation-AB:t exakt vilken statisk webbserverkomponent frontend-
  imagen ska använda internt (medvetet inte beslutat här).

## Påverkade delar

- deployment
- backend (`Portal.Api`)
- frontend
- konfiguration
- dokumentation

## Relaterade dokument

- `docs/00_Projektprinciper.md`
- `docs/04_Systemarkitektur.md`
- `docs/05_Konfiguration.md`
- `docs/10_Release_och_deployment.md`
- `docs/11_ADR_mall.md`
- `docs/project/PROJECT_STATUS.md`

## Relaterade ADR:er

Inga direkt relaterade befintliga ADR:er. Detta är det första ADR:et som beslutar
portalens deploymentmodell.

## Kommentarer

Detta ADR grundar sig dels på en repositoryanalys (Fas 1, read-only) av portalens
befintliga build- och konfigurationsmekanismer, dels på en separat, godkänd, read-only
Hosting Lab-inventering av labbmiljöns faktiska driftmönster. Inga interna
Hosting Lab-detaljer (servernamn, IP-adresser, kataloger, nätverksnamn, servicekonton,
secrets) återges i detta dokument i linje med projektets säkerhetsprinciper.
