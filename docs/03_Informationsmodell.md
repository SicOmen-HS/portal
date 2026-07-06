# 03_Informationsmodell.md

# Informationsmodell

## Dokumentinformation

| Egenskap | Värde                                                                                   |
| -------- | --------------------------------------------------------------------------------------- |
| Dokument | 03_Informationsmodell.md                                                                |
| Typ      | Informationsmodell                                                                      |
| Status   | Utkast                                                                                  |
| Ägare    | Data- och analysportalen                                                                |
| Syfte    | Beskriva vilka informationsobjekt portalen består av och hur de relaterar till varandra |

---

# Syfte

Detta dokument beskriver portalens informationsmodell.

Syftet är att skapa en gemensam förståelse för vilka informationsobjekt som finns i portalen, hur de ska användas och hur de hänger ihop.

Informationsmodellen ska ligga till grund för:

* portalens struktur
* navigation
* sök och filtrering
* datamodeller
* API-design
* konfiguration
* innehållshantering
* framtida integrationer
* framtida koppling till utvecklarportal, exempelvis Backstage

Dokumentet beskriver den konceptuella modellen. Det är inte en detaljerad databasspecifikation.

---

# Grundprinciper för informationsmodellen

## Användarens behov först

Portalen ska i första hand struktureras utifrån vad användaren vill göra, hitta, förstå eller beställa.

Tekniska komponenter, organisationsstruktur och bakomliggande system ska inte vara den primära navigationen för vanliga användare.

---

## Tjänster framför teknik

Användare ska primärt möta tjänster, förmågor, guider, datatjänster och beställningsflöden.

Tekniska komponenter ska kunna beskrivas i modellen, men ska främst användas som metadata, beroenden och förvaltningsinformation.

Exempel:

* Användaren söker efter en tjänst för att beställa en dashboard.
* Användaren ska inte behöva veta om tjänsten bygger på Qlik Sense eller annan teknisk komponent.

---

## Strukturerad information framför hårdkodning

Information ska i första hand beskrivas som strukturerade objekt.

Att lägga till en ny tjänst, guide, kontaktväg eller systemlänk ska normalt inte kräva ny programkod.

---

## En källa per informationsobjekt

Samma information ska inte dupliceras i onödan.

Om information finns i en annan källa, exempelvis OpenMetadata, Confluence eller ett annat system, ska portalen i första hand hänvisa till eller integrera med den källan istället för att skapa en parallell kopia.

---

## Teknik kan finnas bakom tjänsten

Portalen ska kunna visa enkel information för breda användargrupper och samtidigt bära mer teknisk metadata för utvecklare, förvaltare och granskare.

Det innebär att samma tjänst kan ha:

* en användarnära beskrivning
* relaterade guider
* beställningsflöde
* kontaktväg
* ansvarigt team
* tekniska beroenden
* livscykelstatus
* dokumentationslänkar

---

## Modellen ska stödja förändring

Leveransen förändras över tid.

Nya tjänster, plattformar, system, team och tekniska komponenter kan tillkomma eller avvecklas.

Informationsmodellen ska därför vara flexibel och stödja förändringar utan att portalens grundstruktur behöver byggas om.

---

# Begreppsmodell

Portalen består av ett antal centrala informationsobjekt.

De viktigaste objekten är:

* `ServiceOffering`
* `PlatformCapability`
* `System`
* `SystemLink`
* `TechnicalComponent`
* `Dataset`
* `DataService`
* `InformationMart` (visas i användargränssnittet som **Dataprodukt**, se `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`)
* `BusinessApplication`
* `ReportingContainer` och `ReportingAsset` (första steget av en generisk BI-objektmodell, se `docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md`)
* `Guide`
* `OrderFlow`
* `OrderType`
* `OrderStep`
* `OrderDependency`
* `AccessGroup`
* `ContactPoint`
* `StatusItem`
* `MonitoringSubscription`
* `Integration`
* `Team`
* `LifecycleStatus`
* `ResponsibilityBoundary`
* `MetadataSource`
* `AIApplication`
* `KnowledgeSource`


Namnen ovan är tekniska modellnamn som kan användas i kod, API:er eller konfiguration. I användargränssnitt och dokumentation kan svenska begrepp användas.

---

# Centrala informationsobjekt

## ServiceOffering

En `ServiceOffering` beskriver en tjänst som användaren kan hitta, förstå, beställa, använda eller få stöd kring.

Detta är ett av portalens viktigaste objekt.

En tjänst ska beskrivas utifrån användarens behov, inte utifrån underliggande teknik.

### Exempel

* Beställ dashboard
* Beställ AI- eller Machine Learning-yta
* Beställ utvecklingsyta för data science
* Beställ K2- eller Nintex-yta
* Begär åtkomst till datamängd
* Hitta datatjänster
* Få stöd med analys
* Få stöd med automation
* Hitta utvecklingsguider
* Hitta rätt kontaktväg

### Typiska egenskaper

En tjänst bör kunna innehålla:

* id
* namn
* kort beskrivning
* längre beskrivning
* kategori
* målgrupp
* ansvarigt team
* kontaktväg
* beställningsflöde
* dokumentationslänkar
* relaterade guider
* relaterade system
* relaterade plattformar
* tekniska komponenter som tjänsten bygger på
* livscykelstatus
* synlighet
* taggar
* senast uppdaterad
* källa för informationen
* prioriterad/utvald (för att kunna fokusera katalogen på överenskomna tjänster utan att ta bort övriga)
* egen ingångsväg, när en tjänst redan har ett fördjupat sidflöde istället för den generiska tjänstedetaljen

### Princip

En tjänst ska vara något som är begripligt för användaren.

Om objektet främst beskriver en produkt, server, teknisk komponent eller intern implementation ska det normalt inte modelleras som en tjänst.

---

## PlatformCapability

En `PlatformCapability` beskriver en större plattform, förmåga eller domän som flera tjänster kan tillhöra.

Detta objekt hjälper till att gruppera tjänster och system utan att göra tekniken till huvudnavigation för alla användare.

### Exempel

* Dataplattform
* BI-plattform
* AI-plattform
* Automationsplattform
* Metadata- och datakatalogplattform
* Generativ AI-plattform

### Typiska egenskaper

En plattformsförmåga bör kunna innehålla:

* id
* namn
* beskrivning
* verksamhetsområde
* ansvarigt team
* relaterade tjänster
* relaterade system
* relaterade tekniska komponenter
* dokumentation
* kontaktväg
* livscykelstatus
* synlighet

### Princip

En plattform eller förmåga är bredare än en enskild tjänst.

Exempelvis kan AI-plattformen innehålla flera tjänster, som utvecklingsytor, chattportal, rådgivning och dokumentation.

---

## System

Ett `System` beskriver ett system, verktyg eller en applikation som användaren kan behöva nå eller förstå.

System kan vara interna verktyg, plattformar, specialistapplikationer eller närliggande system som portalen länkar vidare till.

### Exempel

* Qlik Sense
* Grafana
* OpenMetadata
* Generativ AI Chattportal
* UiPath
* Nintex
* Azure DevOps Server
* Red Hat OpenShift
* Red Hat OpenShift AI

### Typiska egenskaper

Ett system bör kunna innehålla:

* id
* namn
* beskrivning
* systemtyp
* ansvarigt team
* kontaktväg
* systemlänkar
* dokumentation
* relaterade tjänster
* relaterade plattformar
* autentiseringsmodell
* livscykelstatus
* synlighet
* källa för informationen

### Princip

Ett system är inte automatiskt en tjänst.

Ett system kan däremot vara kopplat till en eller flera tjänster.

Exempelvis kan Qlik Sense vara ett system, medan "Beställ dashboard" är en tjänst.

---

## SystemLink

En `SystemLink` beskriver en länk till ett system, en dokumentationsyta, ett formulär, en beställningssida eller annan extern resurs.

Eftersom företagsinterna URL:er inte ska finnas i det generiska repositoryt ska verkliga länkar kunna tillföras via lokal konfiguration.

### Exempel

* Länk till Qlik Sense
* Länk till Grafana
* Länk till OpenMetadata
* Länk till Generativ AI Chattportal
* Länk till beställningsformulär
* Länk till dokumentation
* Länk till supportyta

### Typiska egenskaper

En systemlänk bör kunna innehålla:

* id
* namn
* beskrivning
* länktyp
* url-nyckel eller konfigurationsnyckel
* relaterat system
* relaterad tjänst
* målgrupp
* synlighet
* öppnas i nytt fönster
* livscykelstatus

### Princip

Repositoryt ska inte innehålla verkliga interna URL:er.

I kod och exempeldata ska länkar därför representeras med nycklar eller platshållare.

---

## TechnicalComponent

En `TechnicalComponent` beskriver en teknisk produkt, komponent eller byggsten som kan ingå i en plattform eller tjänst.

Tekniska komponenter ska inte nödvändigtvis visas som användartjänster.

De är viktiga för förvaltning, spårbarhet, teknisk dokumentation, integrationer och framtida koppling till exempelvis Backstage.

### Exempel

* Trino
* Lakekeeper
* Dell Objectscale
* Dagster
* JupyterHub
* JupyterLab
* Spark
* MLflow
* Qlik Sense
* Grafana
* UiPath
* Nintex
* Keycloak
* OpenFGA
* OPA
* Quay
* PostgreSQL
* Microsoft SQL Server
* WhereScape
* SSIS
* Power BI

### Typiska egenskaper

En teknisk komponent bör kunna innehålla:

* id
* namn
* beskrivning
* komponenttyp
* tillhörande plattform
* ansvarigt team
* teknisk ägare
* livscykelstatus
* version
* dokumentation
* relaterade integrationer
* relaterade tjänster
* synlighet
* drift- eller förvaltningsansvar
* källa för informationen

### Princip

Tekniska komponenter ska finnas i modellen, men ska inte styra den användarnära upplevelsen.

Vanliga användare ska i första hand se tjänster och förmågor.

Tekniska användare och förvaltare kan behöva se tekniska komponenter, beroenden och livscykelstatus.

---

## Dataset

Ett `Dataset` beskriver en datamängd som användare kan hitta, förstå, begära åtkomst till eller konsumera.

Dataset kan komma från flera olika källor och kan på sikt hämtas från eller länkas till OpenMetadata.

### Exempel

* datamängd i Data Lake
* tabell eller vy i Data Warehouse
* Iceberg-tabell
* metadataobjekt i OpenMetadata
* rapportnära datamängd

### Typiska egenskaper

Ett dataset bör kunna innehålla:

* id
* namn
* beskrivning
* datadomän
* ägare
* förvaltare
* källa
* teknisk källa
* åtkomstmodell
* dataklassning
* uppdateringsfrekvens
* dokumentation
* relaterade datatjänster
* relaterade system
* relaterade tekniska komponenter
* livscykelstatus
* metadata-källa

### Princip

Portalen behöver inte äga all datasetinformation.

Om OpenMetadata är källa för datamängder ska portalen i första hand återanvända eller länka till den informationen.

---

## DataService

En `DataService` beskriver en användarnära tjänst eller åtkomstväg för att konsumera, kombinera eller använda data.

Detta skiljer sig från `Dataset`, som beskriver själva datamängden.

### Exempel

* Konsumera data från dataplattformen
* Begär åtkomst till datamängd
* Kombinera datamängder till rapport
* Använd data i Qlik Sense
* Använd data via Trino
* Hitta metadata i OpenMetadata

### Typiska egenskaper

En datatjänst bör kunna innehålla:

* id
* namn
* beskrivning
* målgrupp
* relaterade dataset
* relaterade plattformar
* relaterade tekniska komponenter
* beställningsflöde
* dokumentation
* kontaktväg
* åtkomstkrav
* livscykelstatus

### Princip

Datatjänster ska beskrivas utifrån hur användaren kan använda data, inte bara vilken teknik som används bakom.

---

## Dataprodukt (användarbegrepp)

> Se `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md` för det fullständiga beslutet,
> alternativen som övervägdes och externa referenser.

En **dataprodukt** är portalens primära användarbegrepp för en ägd, dokumenterad,
kvalitetssäkrad och konsumtionsbar datapaketering med ett tydligt syfte.

Detta skiljer sig från `Dataset`, som beskriver en bredare, upptäckbar datatillgång
eller ett byggblock. En dataprodukt bygger normalt på en eller flera datamängder.

I kod och mockdata modelleras en dataprodukt i denna iteration tekniskt som en
`InformationMart` (se nedan) – det finns inget separat `DataProduct`-objekt i
informationsmodellen ännu. Gränssnittet ska däremot alltid visa den som "Dataprodukt",
inte som "Information Mart".

### Exempel

* Dataprodukt för försäljningsanalys, byggd på flera datamängder om kundorder och fakturarader
* Dataprodukt som källa till en dashboard eller rapport
* Ny dataprodukt eller ny datakombination
* Förändring av befintlig dataprodukt

### Typiska egenskaper

En dataprodukt bör kunna kommunicera:

* id, namn och beskrivning (syfte)
* målgrupp
* ägare/ansvarigt team och kontaktväg
* vilka datamängder den bygger på
* vilka dashboards/rapporter/BI-tillämpningar som använder den
* åtkomstmodell
* aktualitet (uppdateringsfrekvens)
* tillit och kvalitet, uttryckt som en nivå (hög/medel/låg) med delsignaler
  (dokumentationsgrad, kvalitetskontroller, ägarskap, lineage, klassning, senaste
  granskning) – inte som ett ensamt, falskt precist procenttal
* dokumentation
* relaterade guider och beställningar
* teknisk implementation (t.ex. Information Mart, vy, tabellstruktur eller API) och
  eventuell modelltyp (t.ex. star schema eller flat table), som sekundär, teknisk
  information

### Princip

Användaren ska kunna hitta, förstå och bedöma en dataprodukt utan att först behöva
förstå vilket tekniskt lager eller vilken arkitekturmodell den bygger på.

Teknisk implementation ska vara tillgänglig för den som behöver den, men ska visas som
sekundär metadata – till exempel under en "Tekniska detaljer"-sektion – inte som
dataproduktens primära rubrik eller typmarkör.

---

## InformationMart

En `InformationMart` beskriver en strukturerad informationsprodukt eller konsumtionsyta som bygger på Data Vault 2.1 och används för rapportering, analys eller vidare konsumtion.

En Information Mart kan vara kopplad till datamängder, BI-tillämpningar, laddningsflöden, behörigheter och larm.

### Exempel

* Information Mart för en BI-tillämpning
* Information Mart som källa till rapportering
* Information Mart som underlag för dashboard
* ny Information Mart
* förändring av befintlig Information Mart

### Typiska egenskaper

En Information Mart bör kunna innehålla:

* id
* namn
* beskrivning
* datadomän
* ägare
* ansvarigt team
* relaterade datamängder
* relaterade BI-tillämpningar
* relaterade laddningsflöden
* relaterade accessgrupper
* relaterade larm
* dokumentation
* livscykelstatus
* synlighet

### Princip

En Information Mart ska inte modelleras som en vanlig teknisk komponent.

Den är en informationsprodukt eller konsumtionsyta som kan användas av flera tjänster, rapporter eller BI-tillämpningar.

**Information Mart är ett tekniskt/arkitekturellt begrepp, inte en primär användarterm.**
I portalens gränssnitt visas motsvarande objekt som **Dataprodukt** (se ovan). Information
Mart ska bara visas där en teknisk eller förvaltande målgrupp uttryckligen behöver veta
den faktiska implementationen, till exempel under "Tekniska detaljer" på en
dataproduktsida (`docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`).

---

## ReportingContainer och ReportingAsset (BI-objektmodell, första steget)

Ett första, avgränsat steg av en generisk BI-objektmodell för Qlik Sense, Grafana och
SAP BusinessObjects (`docs/adr/0003-generisk-bi-objektmodell-forsta-steg.md`,
`docs/analysis/AN-002_urler_bi_objektmodell_integrationsstrategi.md`). Används för att
låta användaren peka ut ett konkret rapport-/dashboardobjekt i en ändringsbegäran.

En `ReportingContainer` beskriver den gruppering källsystemet själv använder (Qlik
Sense-ström, Grafana-mapp, SAP BusinessObjects-mapp) och hör till ett `System`. En
`ReportingAsset` beskriver det körbara/visningsbara objektet (Qlik-app,
Grafana-dashboard, SAP BusinessObjects Web Intelligence-dokument) och hör till en
`ReportingContainer`.

### Typiska egenskaper

En container bör kunna innehålla: id, namn, beskrivning, tillhörande system,
containertyp (ström/mapp), källsystemets eget id, livscykelstatus, synlighet och
senast synkad.

Ett asset bör kunna innehålla: id, namn, beskrivning, tillhörande container, assettyp
(Qlik-app/Grafana-dashboard/Web Intelligence-dokument), källsystemets eget id,
ansvarigt team, fiktiv ansvarig person/funktion, en mockad godkännandeprincip (inget
separat godkännande, eller godkännande från ansvarig krävs), livscykelstatus,
synlighet och senast synkad.

### Princip

Etiketter i användargränssnittet ska styras av containerns/assetets typ, inte
hårdkodas per system, så att ett nytt BI-system kan läggas till utan modelländring.

Ansvarig och godkännandeprincip är en förberedelse för ett framtida, riktigt
godkännandeflöde – inte en behörighetskontroll. `ReportingPart` (enskilt ark/panel/
rapportflik) och `ReportingDataBinding` (datakoppling) är medvetet inte införda ännu;
de läggs till som en separat utökning när ett konkret behov uppstår.

---

## Guide

En `Guide` beskriver stödmaterial som hjälper användaren att förstå, komma igång med eller använda en tjänst, plattform eller ett system.

### Exempel

* Kom igång med Qlik Sense
* Kom igång med AI/ML-yta
* Så beställer du en dashboard
* Så hittar du datamängder
* Så använder du OpenMetadata
* Så ansöker du om behörighet
* Utvecklingsguide för dataplattformen

### Typiska egenskaper

En guide bör kunna innehålla:

* id
* titel
* beskrivning
* målgrupp
* guide-typ
* relaterade tjänster
* relaterade system
* relaterade plattformar
* dokumentationslänk
* innehåll eller sammanfattning
* ansvarigt team
* senast uppdaterad
* livscykelstatus
* synlighet

### Princip

Guider ska vara kopplade till relevanta tjänster och system så att användaren hittar dem i rätt sammanhang.

---

## OrderFlow

Ett `OrderFlow` beskriver ett beställningsflöde, formulär eller process för att begära något.

Beställningsflödet kan ligga i portalen eller i ett annat system.

### Exempel

* Beställ dashboard
* Beställ AI/ML-yta
* Beställ data science devspace
* Beställ K2- eller Nintex-yta
* Begär åtkomst till datamängd
* Ändra behörighet för dashboard
* Beställ AI-chatt eller RAG-applikation, framtida möjlighet

### Typiska egenskaper

Ett beställningsflöde bör kunna innehålla:

* id
* namn
* beskrivning
* typ av beställning
* relaterad tjänst
* ansvarigt team
* målgrupp
* krav innan beställning
* länk eller konfigurationsnyckel
* handläggningsinformation
* dokumentation
* livscykelstatus
* synlighet

### Princip

Beställningsflöden ska vara enkla att hitta från relevanta tjänster.

Om beställningen sker i ett annat system ska portalen länka användaren vidare.

## OrderType

En `OrderType` beskriver en specifik typ av beställning som användaren kan göra.

Detta skiljer sig från `OrderFlow`, som beskriver själva flödet eller processen för att hantera beställningen.

En tjänst kan ha flera beställningstyper.

### Exempel

* Ny datamängd
* Förändring av datamängd
* Ny BI-tillämpning
* Ändring av befintlig BI-tillämpning
* Namnändring på BI-tillämpning
* Beställ ny koppling till befintlig BI-tillämpning
* Beställ koppling till informationsmodell
* Beställ ny AD-grupp eller accessgrupp
* Beställ ändring av behörighet
* Beställ Qlik Sense-ström
* Beställ larm
* Beställ automationsjobb
* Beställ utvecklingsresurs

### Typiska egenskaper

En beställningstyp bör kunna innehålla:

* id
* namn
* beskrivning
* kategori
* relaterad tjänst
* relaterad plattform
* målgrupp
* ansvarigt team
* beställningsflöde
* förutsättningar
* beroenden
* krav på godkännande
* typ av leverans
* om beställningen är manuell, automatiserad eller delvis automatiserad
* relaterade resurser
* dokumentation
* livscykelstatus
* synlighet

### Princip

Beställningstyper ska beskriva vad användaren vill beställa eller förändra.

De ska inte blandas ihop med de tekniska eller organisatoriska steg som krävs för att genomföra beställningen.


---

## OrderStep

Ett `OrderStep` beskriver ett steg som kan ingå i ett beställningsflöde.

Ett beställningsflöde kan bestå av ett eller flera steg.

Steg kan vara synliga för användaren eller endast interna för handläggning och förvaltning.

### Exempel

* skapa ny AD-grupp
* lägga till accessgrupp i Qlik Sense
* skapa koppling till informationsmodell
* sätta upp Qlik Sense-ström
* skapa eller ändra datamängd
* utveckla ny BI-tillämpning
* skapa larm
* genomföra manuell plattformsändring
* skicka beställning vidare till ansvarigt team

### Typiska egenskaper

Ett beställningssteg bör kunna innehålla:

* id
* namn
* beskrivning
* stegordning
* relaterat beställningsflöde
* ansvarigt team
* utförandeläge
* förutsättningar
* beroenden
* system som påverkas
* om steget är användarsynligt eller internt
* status
* dokumentation

### Utförandeläge

Ett steg kan exempelvis vara:

* manuellt
* automatiserat
* delvis automatiserat
* externt
* framtida automatiseringskandidat

### Princip

Ordersteg ska göra det möjligt att beskriva komplexa beställningar utan att hårdkoda varje flöde i applikationen.

Samma steg ska kunna återanvändas i flera beställningsflöden där det är relevant.

---

## OrderDependency

En `OrderDependency` beskriver ett beroende mellan beställningar, steg, resurser eller system.

Vissa beställningar kan inte genomföras förrän andra delar finns på plats.

### Exempel

* En ny BI-tillämpning kan kräva en AD-grupp.
* En BI-tillämpning kan behöva kopplas till en informationsmodell.
* En datamängd kan behöva finnas innan den kan användas i en rapport.
* Ett larm kan behöva kopplas till en BI-tillämpning, informationsmodell eller laddningsprocess.
* En Qlik Sense-ström kan behöva sättas upp innan en applikation publiceras.

### Typiska egenskaper

Ett beroende bör kunna innehålla:

* id
* namn
* beskrivning
* beroendetyp
* källa
* mål
* obligatoriskt eller valfritt
* ordning
* påverkan om beroendet saknas
* ansvarigt team

### Princip

Beroenden ska beskrivas som metadata.

Det gör det möjligt att visa användaren vilka förutsättningar som krävs innan en beställning kan genomföras.


---

## ContactPoint

En `ContactPoint` beskriver en kontaktväg för frågor, support, rådgivning eller förvaltning.

Kontaktvägar kan vara kopplade till tjänster, system, plattformar eller team.

### Exempel

* supportkanal
* funktionsbrevlåda
* ärendeväg
* kontaktperson
* teamkontakt
* dokumentationsyta med kontaktinformation

### Typiska egenskaper

En kontaktväg bör kunna innehålla:

* id
* namn
* beskrivning
* kontakttyp
* relaterad tjänst
* relaterat system
* relaterat team
* målgrupp
* kontaktvärde eller konfigurationsnyckel
* öppettider eller förväntad hanteringstid
* synlighet
* livscykelstatus

### Princip

Kontaktinformation som är företagsspecifik ska inte hårdkodas i repositoryt.

Den ska tillföras via konfiguration eller intern innehållskälla.

---

## StatusItem

Ett `StatusItem` beskriver driftstatus, planerade avbrott, incidenter eller annan statusinformation.

Status kan vara kopplad till tjänster, system, plattformar eller tekniska komponenter.

### Exempel

* driftstörning i Qlik Sense
* planerat underhåll i dataplattformen
* status för AI-plattform
* incident kopplad till dashboardtjänst
* status för OpenMetadata

### Typiska egenskaper

Ett statusobjekt bör kunna innehålla:

* id
* titel
* beskrivning
* statustyp
* allvarlighetsgrad
* starttid
* sluttid
* påverkan
* relaterade tjänster
* relaterade system
* relaterade tekniska komponenter
* ansvarigt team
* senast uppdaterad
* synlighet

### Princip

Statusinformation ska kunna visas samlat, men också i kontext vid berörd tjänst eller plattform.

---

## Integration

En `Integration` beskriver en koppling mellan portalen och ett annat system, eller mellan två system som är relevanta för leveransen.

Integrationer är viktiga för arkitektur, spårbarhet, säkerhet och förvaltning.

### Exempel

* Portal API till OpenMetadata
* Portal API till Qlik Sense API
* Portal API till Grafana
* Portal API till Trino
* Portal API till Keycloak
* Portal API till Microsoft SQL Server
* Portal API till PostgreSQL
* Portal API till Chattportalen, framtida möjlighet
* CI/CD-integration mot Azure DevOps Server
* container image-publicering mot Quay

### Typiska egenskaper

En integration bör kunna innehålla:

* id
* namn
* beskrivning
* integrationsriktning
* källsystem
* målsystem
* autentiseringsmodell
* data som utbyts
* tekniskt ansvar
* säkerhetsklassning
* dokumentation
* livscykelstatus
* synlighet

### Princip

Integrationer ska kapslas bakom tydliga gränssnitt och integrationslager.

Portalens kärna ska inte vara hårt kopplad till enskilda system eller produkter.

---

## Team

Ett `Team` beskriver ansvarig grupp, funktion eller förvaltande enhet.

Team används som metadata, inte som primär navigation.

### Exempel

* Frontend/visualisering
* Backend/dataplattform
* AI-plattform
* Automation
* Nintex/K2
* UiPath
* särskilda team för avgränsade datamängder eller infrastruktur

### Typiska egenskaper

Ett team bör kunna innehålla:

* id
* namn
* beskrivning
* ansvarsområde
* kontaktväg
* relaterade tjänster
* relaterade system
* relaterade plattformar
* synlighet
* livscykelstatus

### Princip

Organisationen kan förändras över tid.

Portalen ska därför inte byggas utifrån teamstrukturen.

Team ska användas som ansvarsinformation kopplad till andra objekt.

---

## LifecycleStatus

`LifecycleStatus` beskriver var i livscykeln en tjänst, plattform, teknisk komponent, guide eller system befinner sig.

### Exempel på statusar

* planned
* active
* under-introduction
* legacy
* deprecated
* retiring
* retired

I svenskt användargränssnitt kan dessa visas som:

* planerad
* aktiv
* under införande
* legacy
* avråds
* under avveckling
* avvecklad

### Princip

Livscykelstatus är viktigt eftersom flera tekniker och lösningar fortfarande kan förekomma trots att de är under avveckling.

Portalen ska hjälpa användaren att förstå vad som är rekommenderat och vad som är på väg bort.

---

## ResponsibilityBoundary

En `ResponsibilityBoundary` beskriver vad leveransen ansvarar för och inte ansvarar för.

Detta är särskilt viktigt när en tjänst bygger på plattformar eller tekniska komponenter som förvaltas av andra delar av organisationen.

### Exempel

För data science devspaces:

* Leveransen ansvarar för färdiga devspace-paket.
* Leveransen ansvarar för dokumentation, vägledning och beställningsflöde.
* Leveransen ansvarar inte för hela Kubernetes- eller OpenShift-plattformen.

För Chattportalen:

* Huvudportalen länkar initialt till Chattportalen.
* Huvudportalen administrerar inte Chattportalens tenants i första versionen.

### Typiska egenskaper

En ansvarsgräns bör kunna innehålla:

* id
* namn
* beskrivning
* gäller för tjänst, system eller plattform
* ansvar inom leveransen
* ansvar utanför leveransen
* beroenden
* kontaktväg
* dokumentation

### Princip

Ansvarsgränser ska vara tydliga för att undvika felaktiga förväntningar från användare, beställare och granskare.

---

## MetadataSource

En `MetadataSource` beskriver var information kommer ifrån.

Detta är viktigt för spårbarhet och för att undvika duplicering.

### Exempel

* lokal portal-konfiguration
* portalens applikationsdatabas
* OpenMetadata
* Confluence
* Azure DevOps Server
* Qlik Sense
* Grafana
* manuellt förvaltad innehållsfil
* framtida Backstage-katalog

### Typiska egenskaper

En metadatakälla bör kunna innehålla:

* id
* namn
* beskrivning
* källtyp
* ansvarig
* uppdateringsfrekvens
* relaterade objekt
* integrationsstatus
* livscykelstatus

### Princip

När portalen visar information som kommer från en annan källa bör det vara tydligt var informationen ägs och hur den uppdateras.

---

## AIApplication

En `AIApplication` beskriver en AI-baserad applikation, exempelvis en chatt, RAG-applikation eller annan AI-funktion.

I första versionen behöver portalen inte administrera dessa, men modellen bör kunna stödja att de visas eller beställs på sikt.

### Exempel

* Generativ AI Chattportal
* AI-chatt för ett visst verksamhetsområde
* RAG-baserad applikation
* framtida tenant i Chattportalen

### Typiska egenskaper

En AI-applikation bör kunna innehålla:

* id
* namn
* beskrivning
* målgrupp
* ägare
* relaterad plattform
* relaterade kunskapskällor
* autentiseringsmodell
* dataseparation
* beställningsflöde
* dokumentation
* kontaktväg
* livscykelstatus
* synlighet

### Princip

AI-applikationer ska kunna beskrivas på en nivå som är begriplig för användaren.

Detaljerad intern RAG-arkitektur ska normalt ligga i separat systemdokumentation.

---

## KnowledgeSource

En `KnowledgeSource` beskriver en informationskälla som kan användas av AI-lösningar, guider eller dokumentationsflöden.

### Exempel

* Confluence-yta
* SharePoint-yta
* TDOK
* PDF-dokument
* Word-dokument
* annan intern dokumentationskälla

### Typiska egenskaper

En kunskapskälla bör kunna innehålla:

* id
* namn
* beskrivning
* källtyp
* ägare
* informationsklassning
* uppdateringsfrekvens
* relaterad AI-applikation
* relaterad tjänst
* dokumentation
* livscykelstatus
* synlighet

### Princip

Kunskapskällor ska beskriva vilken information en AI-lösning eller guide bygger på, men får inte exponera känslig information i det generiska repositoryt.

---

# Relationer mellan objekt

Informationsobjekten ska kunna kopplas till varandra.

Följande relationer är centrala:

## Tjänst till plattform

En tjänst kan tillhöra en eller flera plattformar eller förmågor.

Exempel:

* "Beställ dashboard" tillhör BI-plattform.
* "Beställ AI/ML-yta" tillhör AI-plattform.
* "Begär åtkomst till datamängd" tillhör dataplattform.

---

## Tjänst till system

En tjänst kan använda eller länka till ett eller flera system.

Exempel:

* "Beställ dashboard" kan relatera till Qlik Sense.
* "Hitta datamängder" kan relatera till OpenMetadata.
* "Använd AI-chatt" kan relatera till Generativ AI Chattportal.

---

## Tjänst till teknisk komponent

En tjänst kan bygga på tekniska komponenter utan att dessa exponeras som tjänster för alla användare.

Exempel:

* Data science devspace kan bygga på JupyterHub, Spark, MLflow och OpenShift AI.
* Datatjänster kan bygga på Trino, Lakekeeper, Dell Objectscale och Iceberg.
* Generativ AI Chattportal kan bygga på PostgreSQL, pgvector och interna kunskapskällor.

---

## Tjänst till beställningsflöde

En tjänst kan ha ett eller flera beställningsflöden.

Exempel:

* Beställ dashboard
* Beställ AI/ML-yta
* Begär åtkomst till datamängd
* Beställ K2/Nintex-yta

---

## Tjänst till guide

En tjänst kan ha flera relaterade guider.

Exempel:

* "Beställ dashboard" kan ha guiden "Så beställer du en dashboard".
* "Hitta datamängder" kan ha guiden "Så använder du OpenMetadata".
* "AI/ML-yta" kan ha guiden "Kom igång med data science devspace".

---

## Tjänst till kontaktväg

En tjänst ska kunna ha en tydlig kontaktväg.

Kontaktvägen kan vara direkt kopplad till tjänsten eller ärvas från ansvarigt team.

---

## System till systemlänk

Ett system kan ha en eller flera länkar.

Exempel:

* användarlänk
* administrationslänk
* dokumentationslänk
* statuslänk
* beställningslänk

---

## Dataset till metadata-källa

Ett dataset ska kunna kopplas till den källa där metadata ägs.

Exempel:

* OpenMetadata
* portalens egen databas
* manuell innehållsfil
* annan intern datakatalog

---

## Teknisk komponent till livscykelstatus

Tekniska komponenter ska kunna markeras som aktiva, legacy, under avveckling eller avvecklade.

Det är viktigt för att kunna vägleda användare bort från äldre lösningar.

---

## BI-tillämpning till Information Mart

En BI-tillämpning kan vara kopplad till en eller flera Information Marts.

Exempel:

* En Qlik Sense-applikation använder en Information Mart som källa.
* En rapport kan kräva förändring av en befintlig Information Mart.
* En ny BI-tillämpning kan kräva att en ny Information Mart skapas.

---

## Källsystem till datamängd till dataprodukt till dashboard/rapport

Detta är dataproduktens grundkedja, se `docs/adr/0001-dataprodukt-som-anvandarbegrepp.md`:

```text
Källsystem
→ Datamängd
→ Dataprodukt
→ Dashboard / Rapport / BI-tillämpning
```

En dataprodukt kan bygga på flera datamängder:

```text
Flera datamängder
→ ny analys / ny dataprodukt / ny dashboard
```

Exempel:

* Kundorder-, fakturarad-, produkt- och kundregisterdatamängder kan tillsammans bygga en
  dataprodukt för försäljningsanalys.
* Dataprodukten kan i sin tur användas av en eller flera dashboards/BI-tillämpningar,
  utan att dashboarden behöver känna till de enskilda datamängderna.
* Samma datamängd kan ingå i flera olika dataprodukter.

---

## Beställning till accessgrupp

En beställning kan kräva att en accessgrupp skapas, ändras eller kopplas till ett system.

Exempel:

* Ny BI-tillämpning kan kräva ny AD-grupp.
* En accessgrupp kan behöva läggas till i Qlik Sense.
* Behörighet till en dashboard kan kräva ändring av befintlig grupp.

---

## Larm till BI-tillämpning, Information Mart eller laddningsflöde

Ett larm kan vara kopplat till en BI-tillämpning, en Information Mart, en dataplattformskomponent eller ett laddningsflöde.

Exempel:

* larm vid fel i laddning av Information Mart
* larm när laddning är klar
* larm vid utebliven laddning
* larm kopplat till dataplattform eller BI-tillämpning

---

# Synlighet och målgrupper

Alla objekt ska kunna ha en synlighetsnivå eller målgrupp.

Detta gör att portalen kan innehålla både användarnära och teknisk information utan att alla användare behöver se allt.

## Exempel på synlighetsnivåer

* all-users
* business-users
* developers
* data-scientists
* maintainers
* administrators
* hidden

I svenskt gränssnitt kan dessa motsvara:

* alla användare
* verksamhetsanvändare
* utvecklare
* data scientists
* förvaltare
* administratörer
* dold

## Princip

Vanliga användare ska främst se tjänster, guider, beställningar, systemlänkar och kontaktvägar.

Tekniska användare och förvaltare kan behöva se tekniska komponenter, integrationer, beroenden och livscykelstatus.

---

# Kategorisering och taggar

Objekt bör kunna kategoriseras och taggas för att stödja sök, filtrering och navigation.

## Exempel på kategorier

* Data
* Analys
* Business Intelligence
* AI
* Machine Learning
* Generativ AI
* Automation
* Metadata
* Drift
* Dokumentation
* Beställning
* Behörighet

## Exempel på taggar

* dashboard
* dataset
* qlik
* grafana
* openmetadata
* ai
* rag
* machine-learning
* devspace
* automation
* nintex
* uipath
* trino
* dataplattform
* legacy

## Princip

Kategorier bör vara få och begripliga.

Taggar kan vara fler och mer detaljerade.

---

# Namngivning och identifierare

Alla objekt bör ha stabila identifierare.

Identifierare ska inte innehålla företagshemligheter, interna URL:er eller miljöspecifika värden.

## Exempel

Bra identifierare:

```text
service-order-dashboard
service-data-science-devspace
system-qlik-sense
platform-data
component-trino
guide-openmetadata-get-started
```

Undvik identifierare som innehåller:

* interna servernamn
* miljönamn
* personnamn
* interna system-ID:n som inte är avsedda att delas
* känsliga organisationsnamn

---

# Källor och ägarskap

Varje informationsobjekt bör ha en tydlig ägare eller källa.

Det ska vara möjligt att förstå:

* vem som ansvarar för informationen
* var informationen kommer ifrån
* när den senast uppdaterades
* om portalen äger informationen eller bara visar/länkar till den

## Exempel

En tjänst kan ägas av ett team.

Ett dataset kan ägas i OpenMetadata.

En guide kan ägas av en dokumentationsyta.

En systemlänk kan ägas av lokal konfiguration.

---

# Generativ AI Chattportal

Generativ AI Chattportal är en separat lösning för verksamhetsnära AI-stöd baserat på interna informationskällor.

I portalens första version ska Chattportalen främst hanteras som ett system eller en länkad plattform dit användaren kan navigera.

På sikt kan Chattportalen utvecklas till en tydligare tjänst i portalen, exempelvis för att beställa en ny AI-chatt, tenant eller RAG-baserad applikation.

## Modellering i portalen

Chattportalen ska initialt kunna beskrivas som:

* `System`
* `PlatformCapability`
* `SystemLink`
* framtida `ServiceOffering`
* framtida `AIApplication`

## Exempel

```text
System:
Generativ AI Chattportal

PlatformCapability:
Generativ AI

SystemLink:
Länk till Chattportalen

Future ServiceOffering:
Beställ AI-chatt eller RAG-applikation

Future AIApplication:
AI-chatt för specifikt verksamhetsområde
```

## Autentisering

Chattportalen använder ADFS som huvudsaklig autentiseringslösning.

Keycloak används i andra delar av dataplattformen och ska därför modelleras som en separat teknisk komponent eller integration där det är relevant.

## Avgränsning

Portalens första version ska inte bädda in Chattportalens funktionalitet eller administrera dess tenants.

Portalen ska i första hand hjälpa användaren att förstå vad Chattportalen är, vem den är till för och hur man når den.

Eventuell framtida integration, exempelvis beställning av nya AI-chattar eller visning av tillgängliga tenants, ska hanteras som en separat vidareutveckling.

---

# Exempel på modellering

## Exempel 1: Beställ dashboard

```text
ServiceOffering:
Beställ dashboard

PlatformCapability:
BI-plattform

System:
Qlik Sense

OrderFlow:
Beställ dashboard

Guide:
Så beställer du en dashboard

ContactPoint:
BI-support eller ansvarigt team

TechnicalComponent:
Qlik Sense

LifecycleStatus:
active
```

---

## Exempel 2: Data science devspace

```text
ServiceOffering:
Beställ utvecklingsyta för data science

PlatformCapability:
AI-plattform

System:
Red Hat OpenShift AI

TechnicalComponents:
JupyterHub
JupyterLab
Spark
MLflow

OrderFlow:
Beställ data science devspace

ResponsibilityBoundary:
Leveransen ansvarar för paketerade devspace-lösningar.
Leveransen ansvarar inte för hela containerplattformen.

TargetAudience:
data-scientists
```

---

## Exempel 3: Hitta datamängder

```text
ServiceOffering:
Hitta datamängder

PlatformCapability:
Dataplattform

System:
OpenMetadata

Dataset:
Datamängd från datakatalog

DataService:
Konsumera data från dataplattformen

TechnicalComponents:
Trino
Lakekeeper
Dell Objectscale
Iceberg

MetadataSource:
OpenMetadata
```

---

## Exempel 4: Generativ AI Chattportal

```text
System:
Generativ AI Chattportal

PlatformCapability:
Generativ AI

SystemLink:
Länk till Chattportalen

Authentication:
ADFS

Future ServiceOffering:
Beställ AI-chatt

Future AIApplication:
RAG-applikation för verksamhetsnära informationsstöd
```

---

## Exempel 5: Automation med Nintex

```text
ServiceOffering:
Beställ K2- eller Nintex-yta

PlatformCapability:
Automationsplattform

System:
Nintex

OrderFlow:
Beställ formulär- eller workflowyta

Guide:
Kom igång med Nintex

ContactPoint:
Automationsteam eller ansvarig supportkanal
```

---

# Koppling till Backstage

Informationsmodellen ska utformas så att framtida integration med en utvecklarportal, exempelvis Backstage, blir möjlig.

Det innebär att objekt som tjänster, system, tekniska komponenter och integrationer bör kunna mappas till katalogmetadata.

## Exempel på möjlig mappning

| Portalobjekt       | Möjlig Backstage-motsvarighet       |
| ------------------ | ----------------------------------- |
| ServiceOffering    | Component, Resource eller System    |
| PlatformCapability | System eller Domain                 |
| TechnicalComponent | Component eller Resource            |
| System             | System eller Component              |
| Integration        | API eller Relation                  |
| Team               | Group                               |
| Documentation      | TechDocs eller länkad dokumentation |

## Princip

Portalen behöver inte implementera Backstage från början.

Däremot ska informationsmodellen inte försvåra en framtida koppling.

---

# Avgränsningar

Informationsmodellen beskriver portalens konceptuella objekt.

Den beskriver inte:

* exakt databasschema
* tabellstruktur
* API-kontrakt
* Angular-komponenter
* behörighetsimplementation
* teknisk integrationsdesign
* detaljerad systemarkitektur

Dessa delar dokumenteras i senare arkitektur- och utvecklingsdokument.

---

# Första versionens omfattning

I första versionen bör portalen fokusera på de mest användarnära objekten:

* tjänster
* systemlänkar
* guider
* dokumentation
* beställningsflöden
* kontaktvägar
* plattformar/förmågor
* grundläggande statusinformation

Tekniska komponenter, integrationer, dataset och AI-applikationer kan finnas i modellen men behöver inte vara fullt utbyggda i första implementationen.

---

# Framtida utökningar

Informationsmodellen ska kunna byggas ut över tid.

Möjliga framtida utökningar är:

* administrativt gränssnitt för att hantera tjänster
* integration med OpenMetadata
* integration med Backstage
* visning av tekniska beroenden
* visning av livscykelstatus för tekniska komponenter
* beställning av AI-chattar eller RAG-applikationer
* status per system eller tjänst
* personaliserade vyer baserat på roll
* favoriter eller vanligast använda tjänster
* sök över dokumentation och metadata

---

# Sammanfattning

Informationsmodellen ska göra portalen behovsstyrd, strukturerad och förvaltningsbar.

Den ska hjälpa användaren att hitta rätt tjänst, system, guide, datamängd, beställning eller kontaktväg utan att behöva förstå hela den tekniska eller organisatoriska komplexiteten bakom leveransen.

Samtidigt ska modellen kunna bära teknisk metadata, beroenden, integrationer, ansvar och livscykelstatus för att stödja förvaltning, spårbarhet, granskning och framtida vidareutveckling.
