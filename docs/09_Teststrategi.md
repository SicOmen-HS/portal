# 09_Teststrategi.md

# Teststrategi

## Dokumentinformation

| Egenskap | Värde                                                                                          |
| -------- | ---------------------------------------------------------------------------------------------- |
| Dokument | 09_Teststrategi.md                                                                             |
| Typ      | Teststrategi                                                                                   |
| Status   | Utkast                                                                                         |
| Ägare    | Data- och analysportalen                                                                       |
| Syfte    | Beskriva hur portalen ska testas för att säkerställa kvalitet, säkerhet och förvaltningsbarhet |

---

# Syfte

Detta dokument beskriver teststrategin för portalen.

Syftet är att säkerställa att portalen kan utvecklas, ändras och driftsättas med tillräcklig kvalitet och kontroll.

Teststrategin ska stödja:

* säker lokal utveckling
* stabil frontend
* stabil backend
* fungerande API:er
* korrekt hantering av informationsmodellen
* säker konfiguration
* mockade integrationer
* framtida verkliga integrationer
* förvaltningsbarhet över tid

Dokumentet beskriver övergripande principer och rekommenderade testnivåer. Aktuella
testkommandon ägs av `docs/13_Utvecklarguide.md` och det fullständiga leveransflödet
av `docs/project/PROJECT_WORKFLOW.md`; läs alltid repositoryts deklarerade scripts
innan verifiering.

Alla repositoryändringar ska passera relevant lokal verifiering före leverans. För
frontendändringar omfattar det deklarerad build och testsvit samt, för materiella
UI-ändringar, visuell kontroll vid ungefär 375 px, 768 px och desktopbredd. Efter
uppdatering mot senaste `origin/main` ska samma relevanta verifiering köras igen.

---

# Grundprincip

Tester ska ge förtroende för att portalen fungerar utan att kräva åtkomst till företagets interna miljö.

Det ska vara möjligt att köra relevanta tester lokalt med:

* fiktiv data
* lokal konfiguration
* lokal databas
* mockade integrationer
* exempelvärden
* feature flags

Tester ska inte kräva:

* interna URL:er
* interna konton
* certifikat
* tokens
* produktionsdata
* interna system
* interna AD-grupper
* åtkomst till företagets nätverk

---

# Relation till övriga dokument

Teststrategin ska följa projektets övriga dokumentation.

Särskilt viktiga dokument är:

* `00_Projektprinciper.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `05_Konfiguration.md`
* `06_Utvecklingsprinciper.md`
* `07_AI_Instruktioner.md`
* `08_Lokal_utvecklingsmiljö.md`

Om tester visar att implementationen avviker från dokumentationen ska antingen implementationen eller dokumentationen justeras.

---

# Testmål

Testningen ska säkerställa att:

* portalen kan starta lokalt
* frontend kan byggas
* backend kan byggas
* API:er fungerar enligt förväntan
* informationsmodellen används konsekvent
* användaren kan hitta tjänster, system, guider och beställningar
* mockade integrationer fungerar
* konfiguration valideras
* känslig information inte exponeras
* fel hanteras kontrollerat
* dokumentation och kod hålls i linje
* ändringar kan göras utan att centrala funktioner går sönder

---

# Vad ska testas

Portalen ska testas på flera nivåer.

## Frontend

Frontend ska testas för att säkerställa att användargränssnittet fungerar och visar rätt information.

Exempel:

* komponenter
* routing
* navigation
* sök
* filtrering
* kort och listvyer
* detaljsidor
* formulär
* statusvisning
* felvyer
* laddningslägen
* tomma resultat
* visning av mockdata

---

## Backend

Backend ska testas för att säkerställa att API:er, affärslogik, databasåtkomst och konfiguration fungerar.

Exempel:

* services
* controllers
* repositories
* validering
* API-svar
* felhantering
* konfigurationsvalidering
* health endpoint
* mockade integrationsadaptrar
* databas-migrations

---

## Informationsmodell

Informationsmodellen ska testas indirekt genom modeller, API:er, mockdata och vyer.

Exempel på objekt som ska kunna testas:

* ServiceOffering
* PlatformCapability
* System
* SystemLink
* TechnicalComponent
* Dataset
* DataService
* InformationMart
* BusinessApplication
* Guide
* OrderFlow
* OrderType
* OrderStep
* OrderDependency
* AccessGroup
* ContactPoint
* StatusItem
* MonitoringSubscription
* Integration
* Team
* LifecycleStatus
* ResponsibilityBoundary
* MetadataSource

Målet är inte att testa dokumentet i sig, utan att säkerställa att implementationen följer begreppsmodellen.

---

## Konfiguration

Konfiguration ska testas eftersom den är central för säkerhet och lokal utveckling.

Tester bör kontrollera att:

* obligatorisk konfiguration valideras
* saknad konfiguration hanteras begripligt
* mockläge kan köras utan interna värden
* integrationer kan slås på och av
* CORS kan konfigureras
* frontend kan läsa runtime-konfiguration
* backend inte kräver interna integrationer i lokalt läge
* secrets inte krävs i exempelkonfiguration

---

## Integrationer

Integrationer ska kunna testas med mockade adaptrar.

Verkliga integrationer testas senare i intern miljö.

Exempel:

* OpenMetadataAdapter
* QlikSenseAdapter
* GrafanaAdapter
* TrinoAdapter
* DagsterAdapter
* LakekeeperAdapter
* KeycloakAdapter
* ChatPortalAdapter
* SqlServerAdapter

Mockade integrationer ska följa samma interface som verkliga integrationer.

Det gör att frontend och backend kan utvecklas utan att vara beroende av interna system.

---

# Testnivåer

## Enhetstester

Enhetstester testar små delar av systemet isolerat.

Exempel:

* TypeScript-funktioner
* Angular services
* Angular pipes
* .NET services
* valideringslogik
* konfigurationsklasser
* hjälpfunktioner
* mapper-klasser

Enhetstester ska vara snabba och kunna köras lokalt.

---

## Komponenttester

Komponenttester testar frontendkomponenter med kontrollerad indata.

Exempel:

* ServiceCardComponent visar rätt titel och status.
* SystemLinkCardComponent hanterar saknad länk.
* OrderFlowCardComponent visar rätt beställningstyp.
* LifecycleBadgeComponent visar rätt status.
* StatusPanelComponent visar incidenter eller tomt läge.

Komponenttester ska använda fiktiv data.

---

## API-tester

API-tester kontrollerar att backend returnerar förväntade svar.

Exempel:

* hämta tjänster
* hämta systemlänkar
* hämta guider
* hämta beställningsflöden
* hämta statusinformation
* hämta datamängder
* hantera saknade objekt
* hantera ogiltiga parametrar

API-tester ska inte kräva verkliga interna integrationer.

---

## Integrationstester

Integrationstester kontrollerar samverkan mellan flera delar av portalen.

Exempel:

* backend service till repository
* backend API till lokal PostgreSQL
* backend API till mockad adapter
* frontend service till backend API
* konfiguration till aktiverad feature flag
* seeddata till API-svar

Integrationstester ska i första hand köras med lokal databas och mockade externa system.

---

## End-to-end-tester

End-to-end-tester testar användarflöden genom hela applikationen.

Exempel:

* användaren öppnar startsidan
* användaren söker efter en tjänst
* användaren filtrerar tjänster
* användaren öppnar en tjänstedetalj
* användaren hittar beställningsflöde
* användaren hittar systemlänk
* användaren hittar kontaktväg
* användaren ser statusinformation

End-to-end-tester bör införas stegvis och fokusera på de viktigaste användarflödena.

---

## Manuella tester

Alla tester behöver inte automatiseras från början.

Manuella tester är viktiga för att bedöma:

* användbarhet
* språk
* navigation
* informationsstruktur
* tydlighet i beställningsflöden
* rimlighet i mockdata
* visuell kvalitet
* överensstämmelse med målbild

Manuella tester bör dokumenteras med korta checklistor.

---

# Testdata

Testdata ska vara fiktiv och säker.

Testdata får inte innehålla:

* produktionsdata
* personuppgifter
* interna URL:er
* interna servernamn
* verkliga AD-grupper
* verkliga användarkonton
* interna ärenden
* exporter från interna system
* verkliga loggar
* verkliga dashboardnamn om dessa är interna eller känsliga

## Exempel på tillåten testdata

* Exempel Dashboard
* Testdatamängd A
* Demo Information Mart
* Exempel BI-tillämpning
* Fiktiv accessgrupp
* Exempelteam Data
* Testguide för datakatalog
* Exempellarm för laddning
* Fiktiv systemlänk

---

# Mockdata

Mockdata används för lokal utveckling och test.

Mockdata kan finnas som JSON, seeddata eller kodnära testdata.

Exempel:

```text
mock/
  services.mock.json
  systems.mock.json
  guides.mock.json
  orders.mock.json
  datasets.mock.json
  status.mock.json
```

## Principer

Mockdata ska:

* följa informationsmodellen
* vara fiktiv
* kunna köras lokalt
* vara säker att dela
* inte kräva interna system
* tydligt skiljas från verklig data

---

# Seeddata

Seeddata används för att fylla lokal databas med exempeldata.

Seeddata ska vara fiktiv.

Seeddata bör kunna återskapas.

Det ska vara möjligt att rensa lokal databas och ladda om seeddata utan påverkan på interna system.

---

# Testmiljöer

## Lokal miljö

Lokal miljö används för utveckling och grundläggande tester.

Den lokala miljön ska använda:

* lokal frontend
* lokal backend
* lokal PostgreSQL
* mockdata
* mockade integrationer
* exempelkonfiguration

## Intern utvecklingsmiljö

Intern utvecklingsmiljö kan användas för tester som kräver interna system.

Denna miljö får använda verkliga interna URL:er och integrationer, men sådana värden ska inte föras tillbaka till det generiska repositoryt.

## Testmiljö

Testmiljö används för mer samlad verifiering inför release.

Testmiljön kan användas för:

* integrationstester
* acceptanstester
* användargranskning
* prestandaindikatorer
* säkerhetskontroller
* deploymentverifiering

## Produktionsmiljö

Produktionsmiljö ska inte användas för utvecklingstester.

Tester i produktion ska begränsas till kontrollerade smoke tests och övervakning.

---

# Tester i CI/CD

När pipeline finns ska relevanta tester kunna köras automatiskt.

Exempel på kontroller i pipeline:

* bygg frontend
* bygg backend
* kör frontendtester
* kör backendtester
* kör statisk kodanalys
* kontrollera formatering
* kontrollera att inga otillåtna filer finns
* kontrollera att exempelkonfiguration är giltig
* kontrollera att projektet inte innehåller kända secrets
* skapa container image
* verifiera generiska deploymentmallar

Pipeline ska inte kräva verkliga secrets för att köra grundläggande tester.

---

# Säkerhetstester

Säkerhet ska kontrolleras löpande.

Exempel på säkerhetskontroller:

* inga secrets i repositoryt
* inga interna URL:er i generisk kod
* inga certifikat i repositoryt
* inga connection strings i versionshanterade filer
* inga personuppgifter i mockdata
* inga stack traces till användaren
* inga tokens i loggar
* inga lösenord i loggar
* CORS är restriktivt
* frontend innehåller inte hemligheter
* backend kapslar integrationer

Automatiserad secret scanning bör användas där det är möjligt.

---

# Konfigurationstester

Konfiguration ska testas separat eftersom fel konfiguration kan orsaka både driftproblem och säkerhetsrisker.

Exempel på testfall:

* backend startar i mockläge utan interna integrationer
* backend stoppar eller varnar tydligt om obligatorisk konfiguration saknas
* frontend kan läsa runtime-config
* saknad systemlänk hanteras kontrollerat
* inaktiverad integration visas begripligt
* AllowedOrigins krävs i icke-lokala miljöer
* connection string saknas inte när databas krävs
* feature flags ger förväntat beteende

---

# Databastester

Databastester ska säkerställa att portalens applikationsdatabas fungerar.

Exempel:

* migrations kan köras
* schema kan skapas lokalt
* seeddata kan laddas
* repository-metoder fungerar
* relationer mellan objekt fungerar
* databas kan återskapas från noll
* testdata innehåller inte otillåten information

Databastester ska använda lokal eller isolerad testdatabas.

---

# Migrationstester

Databasmigrationer ska vara spårbara och testbara.

Tester bör kontrollera att:

* migrationer kan köras från tom databas
* migrationer kan köras i rätt ordning
* migrationer inte kräver produktionsdata
* seeddata är separat från schemaförändringar
* rollback-strategi bedöms vid riskfyllda ändringar

---

# Tillgänglighetstester

Portalen ska vara möjlig att använda för olika användare och arbetssätt.

Tillgänglighet bör beaktas redan från början.

Exempel på kontroller:

* tydliga rubriker
* begriplig navigering
* tillräcklig kontrast
* fokusmarkeringar
* tangentbordsnavigation
* tydliga länkar
* formulär med labels
* felmeddelanden som går att förstå
* semantisk HTML där det är möjligt

Tillgänglighetstester kan vara både automatiserade och manuella.

---

# Användbarhetstester

Portalen ska vara enkel att förstå.

Användbarhetstester bör fokusera på typiska användarbehov.

Exempel:

* hitta datamängd
* hitta systemlänk
* hitta utvecklingsguide
* beställa dashboard
* hitta kontaktväg
* förstå skillnaden mellan tjänst och system
* hitta AI-chatt
* hitta beställning för utvecklingsyta
* förstå status eller driftinformation

Resultat från användbarhetstester kan leda till ändringar i navigation, språk, struktur eller informationsmodell.

---

# Regressionstester

Regressionstester ska säkerställa att tidigare fungerande funktioner inte går sönder.

Viktiga regressionsområden:

* startsida
* tjänstekatalog
* systemlänkar
* guider
* beställningsflöden
* statuspanel
* sök och filtrering
* konfigurationsläsning
* mockade integrationer
* backend API:er

Regressionstester kan vara manuella i början och automatiseras stegvis.

---

# Smoke tests

Smoke tests används för att snabbt verifiera att applikationen fungerar efter bygg eller deployment.

Exempel:

* frontend laddar
* backend svarar på `/health`
* API för tjänster svarar
* API för systemlänkar svarar
* databasanslutning fungerar
* konfiguration kan läsas
* inga kritiska fel visas vid start

Smoke tests ska vara snabba och enkla att köra.

---

# Acceptanstester

Acceptanstester ska verifiera att portalen uppfyller användarbehov.

Exempel på acceptanskriterier:

* användaren kan hitta en tjänst utifrån behov
* användaren kan hitta relevanta systemlänkar
* användaren kan hitta dokumentation kopplad till en tjänst
* användaren kan hitta beställningsflöde
* användaren kan se kontaktväg
* användaren kan förstå om en teknik är aktiv eller under avveckling
* användaren kan skilja mellan tjänst, system och teknisk komponent

Acceptanstester bör tas fram tillsammans med produktägare eller verksamhetsrepresentanter.

---

# Test av beställningsflöden

Beställningsflöden är centrala för portalen och ska testas särskilt.

Exempel på saker att testa:

* ordertyper visas korrekt
* ordersteg visas i rätt ordning
* beroenden visas begripligt
* ansvarigt team visas
* kontaktväg visas
* användaren ser om flödet är manuellt eller automatiserat
* användaren förstår förutsättningar innan beställning
* länkar till externa beställningssystem hanteras via konfiguration

Exempel på beställningar:

* ny datamängd
* förändring av datamängd
* ny BI-tillämpning
* ändring av BI-tillämpning
* ny accessgrupp
* Qlik Sense-ström
* larm
* utvecklingsyta för data science
* AI- eller Machine Learning-yta
* K2- eller Nintex-yta

---

# Test av livscykelstatus

Livscykelstatus ska testas eftersom portalen ska kunna vägleda användaren mellan aktiva, äldre och avvecklade lösningar.

Exempel:

* aktiv tjänst visas normalt
* legacy-komponent visas med rätt markering
* avvecklad tjänst rekommenderas inte
* under avveckling visas tydligt
* planerad tjänst visas endast där det är relevant
* filtrering på livscykelstatus fungerar

---

# Test av synlighet och målgrupper

Portalen kan behöva visa olika information för olika målgrupper.

Synlighet ska därför testas när sådan funktion införs.

Exempel:

* allmän användare ser användarnära tjänster
* utvecklare kan se teknisk dokumentation
* data scientists kan se AI- och devspace-relaterad information
* förvaltare kan se tekniska komponenter
* dold information visas inte i vanliga vyer

Behörighetskritisk logik ska valideras i backend, inte endast i frontend.

---

# Test av felhantering

Felhantering ska testas för både frontend och backend.

Exempel:

* API svarar inte
* databas är nere
* integration är inaktiverad
* integration returnerar fel
* konfiguration saknas
* systemlänk saknas
* tom sökning ger inga resultat
* användaren försöker öppna okänt objekt
* backend returnerar valideringsfel

Felmeddelanden ska vara begripliga och inte exponera interna detaljer.

---

# Test av loggning

Loggning ska testas så att den är användbar men säker.

Kontrollera att loggar inte innehåller:

* tokens
* lösenord
* connection strings
* certifikat
* personuppgifter
* interna URL:er
* servernamn
* känsliga felmeddelanden

Loggar bör kunna visa:

* att applikationen startat
* aktivt mockläge
* konfigurationsfel
* integrationsfel
* databasfel
* oväntade undantag utan att läcka känslig information

---

# Test av dokumentation

Dokumentation ska granskas när funktionalitet ändras.

Kontrollera att dokumentation uppdateras vid:

* ny informationsmodell
* nytt API
* ny integration
* ny konfigurationsprincip
* ny beställningstyp
* ny teknisk komponent
* ändrad arkitektur
* ändrad lokal utvecklingsmiljö
* ändrad deploymentprincip

Dokumentation behöver normalt inte ändras vid mindre buggrättningar eller stylingjusteringar.

---

# Prestandatester

Prestandatester är inte huvudfokus i första versionen, men grundläggande prestanda bör beaktas.

Exempel på områden:

* startsidan laddar rimligt snabbt
* tjänstekatalogen fungerar med ökande antal tjänster
* sök och filtrering fungerar med större mockdata
* API:er svarar inom rimlig tid
* integrationer har timeout och felhantering
* frontend hämtar inte onödigt mycket data

Mer avancerad prestandatestning kan införas senare.

---

# Test av sök och filtrering

Sök och filtrering är centrala funktioner i portalen.

Exempel på testfall:

* sök på tjänstnamn
* sök på kategori
* sök på tagg
* sök på system
* sök på guide
* filtrera på område
* filtrera på målgrupp
* filtrera på livscykelstatus
* filtrera på aktiv/legacy
* hantera tomt resultat
* hantera specialtecken

---

# Test av responsivitet

Portalen bör fungera på olika skärmstorlekar.

Exempel:

* desktop
* laptop
* mindre skärm
* surfplatta om relevant

Viktiga vyer:

* startsida
* tjänstekatalog
* detaljsida
* systemlänkar
* guider
* beställningsflöden
* statuspanel

---

# Testansvar

Testansvar delas mellan flera roller.

## Utvecklare

Utvecklare ansvarar för att:

* skriva och köra relevanta tester
* säkerställa att kod kan byggas
* testa lokalt
* använda mockdata
* undvika secrets
* uppdatera dokumentation vid behov

## Produktägare

Produktägare ansvarar för att:

* granska att funktioner stödjer användarbehov
* bidra med acceptanskriterier
* granska språk och informationsstruktur
* prioritera viktiga användarflöden

## Arkitekt eller teknisk granskare

Arkitekt eller teknisk granskare ansvarar för att:

* granska arkitekturpåverkan
* säkerställa att informationsmodellen följs
* identifiera behov av ADR
* granska integrationsprinciper
* granska säkerhetsmässiga avvikelser

## AI-verktyg

AI-verktyg kan stödja testarbete genom att:

* föreslå testfall
* skapa testdata
* föreslå enhetstester
* granska kod för testbarhet
* hitta saknade tester
* kontrollera att testdata är fiktiv

AI-genererade tester ska granskas av människa.

---

# Testchecklista för ändringar

Varje större ändring bör granskas mot följande checklista:

```text
- [ ] Ändringen kan köras lokalt.
- [ ] Ändringen kräver inte interna system för grundtest.
- [ ] Mockdata är fiktiv.
- [ ] Inga secrets har lagts till.
- [ ] Inga interna URL:er har lagts till i generisk kod.
- [ ] Relevanta frontendtester har lagts till eller bedömts ej relevanta.
- [ ] Relevanta backendtester har lagts till eller bedömts ej relevanta.
- [ ] Felhantering har testats.
- [ ] Konfigurationspåverkan har testats.
- [ ] Dokumentation har uppdaterats vid behov.
- [ ] Informationsmodellen följs.
```

---

# Definition of Done kopplat till test

En ändring är inte färdig förrän den är testad i relevant omfattning.

Det innebär att:

* kod kan byggas
* relevanta tester passerar
* grundläggande manuell verifiering är gjord
* mockdata fungerar där det behövs
* konfiguration fungerar lokalt
* inga secrets har införts
* dokumentation är uppdaterad vid behov
* felhantering är rimlig
* ändringen följer informationsmodellen

---

# Första versionens rekommendation

I första versionen bör teststrategin fokusera på:

* att frontend kan byggas
* att backend kan byggas
* att applikationen kan köras lokalt
* att lokal PostgreSQL fungerar
* att mockdata kan visas
* att centrala API:er fungerar
* att tjänstekatalogen fungerar
* att systemlänkar fungerar med dummyvärden
* att beställningsflöden kan visas
* att statusinformation kan mockas
* att konfiguration kan valideras
* att inga secrets finns i repositoryt

Automatiseringsgraden kan öka stegvis.

---

# Avgränsningar

Detta dokument beskriver teststrategi på övergripande nivå.

Det beskriver inte:

* exakta testkommandon
* exakt testverktyg
* fullständig testsvit
* detaljerade pipeline-steg
* fullständig prestandatestplan
* fullständig säkerhetstestplan
* exakta acceptanskriterier för varje tjänst
* detaljerad testdata för varje objekt

Dessa delar kan dokumenteras senare när implementationen konkretiseras.

---

# Sammanfattning

Teststrategin ska säkerställa att portalen kan utvecklas säkert, lokalt och förvaltningsbart.

Tester ska i första hand kunna köras utan interna system och utan känslig information.

Mockdata, lokal PostgreSQL, exempelkonfiguration och mockade integrationer är centrala delar av teststrategin.

Testningen ska växa stegvis med projektet och fokusera på de funktioner som är viktigast för användaren, arkitekturen och säkerheten.
