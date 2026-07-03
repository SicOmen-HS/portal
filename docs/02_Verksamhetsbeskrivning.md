# 02_Verksamhetsbeskrivning.md

# Verksamhetsbeskrivning

## Dokumentinformation

| Egenskap | Värde                                                    |
| -------- | -------------------------------------------------------- |
| Dokument | 02_Verksamhetsbeskrivning.md                             |
| Typ      | Verksamhets- och domänbeskrivning                        |
| Status   | Utkast                                                   |
| Ägare    | Data- och analysportalen                                 |
| Syfte    | Beskriva den verksamhetsdomän som portalen utvecklas för |

---

# Syfte

Detta dokument beskriver den verksamhetsdomän som portalen utvecklas för.

Syftet är att ge utvecklare, arkitekter, produktägare, granskare och AI-verktyg en gemensam förståelse för leveransen, dess tjänster, plattformar, användarbehov och ansvarsområden.

Dokumentet beskriver verksamheten och domänen på en övergripande nivå. Det är inte en detaljerad teknisk systemarkitektur.

---

# Leveransen

Portalen utvecklas för leveransen **Data- och analysportalen**.

Leveransen ansvarar för plattformar, tjänster och stöd inom områdena data, analys, AI och automation.

Målet är att tillhandahålla gemensamma förmågor som gör det möjligt för verksamheten att:

* samla in data
* bearbeta data
* tillgängliggöra data
* analysera data
* visualisera information
* automatisera processer
* använda AI och Machine Learning på ett säkert och kontrollerat sätt

Portalen ska fungera som den gemensamma ingången till dessa förmågor.

---

# Övergripande verksamhetsområden

Leveransen omfattar flera större verksamhetsområden.

Dessa områden beskriver vad leveransen stödjer, inte nödvändigtvis hur portalen ska navigeras eller struktureras.

---

## Data och dataplattform

Leveransen arbetar med plattformar och tjänster för att samla in, lagra, bearbeta, beskriva och tillgängliggöra data.

Området omfattar bland annat:

* Data Lake
* Data Warehouse
* datatjänster
* datakatalog och metadata
* ingestzon
* Iceberg-tabeller
* SQL-baserade datakällor
* frågemotorer och åtkomstvägar till data

Exempel på tekniker och plattformskomponenter inom området är:

* OpenMetadata
* Trino
* Lakekeeper
* Dell Objectscale
* Dagster
* WhereScape
* Microsoft SQL Server
* SSIS
* Informatica PowerCenter

Alla tekniska komponenter är inte användarnära tjänster. Vissa komponenter används som underliggande byggblock för tjänster som användaren konsumerar via mer verksamhetsnära gränssnitt.

Exempelvis kan Trino, Lakekeeper, Iceberg och Dell Objectscale ligga bakom datatjänster utan att användaren behöver förstå eller navigera utifrån dessa tekniker.

---

## Business Intelligence och visualisering

Leveransen tillhandahåller stöd för analys, visualisering och rapportering.

Området omfattar bland annat:

* dashboards
* rapporter
* visualisering
* analysstöd
* behörighetshantering kopplat till analysytor
* vägledning kring rätt visualiseringsverktyg

Aktiva eller relevanta tekniker inom området är bland annat:

* Qlik Sense
* Grafana

Äldre tekniker förekommer fortfarande men är under avveckling eller används i begränsad omfattning.

Exempel på sådana tekniker är:

* Power BI
* QlikView
* SSRS
* SAP BusinessObjects

Portalen ska kunna beskriva både aktiva lösningar och lösningar som är under avveckling, så att användaren får rätt vägledning.

---

## AI och Machine Learning

Leveransen erbjuder plattformar, stöd och tjänster inom AI och Machine Learning.

Området omfattar bland annat:

* Machine Learning
* Generativ AI
* AI-plattformar
* utvecklingsytor för data scientists
* paketerade devspaces
* stöd för experiment, modellutveckling och AI-baserade lösningar

Exempel på tekniker och plattformskomponenter inom området är:

* Red Hat OpenShift AI
* JupyterHub
* JupyterLab
* Spark
* MLflow
* Kubernetes/OpenShift-baserade devspaces

Leveransen ansvarar för vissa paketerade tjänster och utvecklingsytor inom den större container- och AI-miljön.

Det innebär inte nödvändigtvis att leveransen ansvarar för hela den underliggande containerplattformen.

Ansvarsgränser ska därför beskrivas tydligt i portalen när en tjänst bygger på en plattform som även andra delar av organisationen ansvarar för.

---

## Generativ AI Chattportal

Leveransen omfattar även en Generativ AI Chattportal för verksamhetsnära AI-stöd baserat på interna informationskällor.

Chattportalen är en separat lösning för säker och kontrollerad AI-användning, där användare kan interagera med AI-funktionalitet baserad på dokumentation, kunskapskällor eller annan intern information.

I portalens första version betraktas Chattportalen främst som ett separat system som användaren länkas vidare till.

På sikt kan portalen även stödja tjänster kopplade till Chattportalen, exempelvis:

* beställning av ny AI-chatt
* beställning av ny tenant
* beställning av RAG-baserad applikation
* vägledning kring vilka datakällor som kan användas
* kontaktväg för rådgivning och stöd

Chattportalen använder ADFS som huvudsaklig autentiseringslösning.

Detaljerad arkitektur för Chattportalen hanteras i separat systemdokumentation.

---

## Automation

Leveransen erbjuder plattformar och stöd inom automation.

Området omfattar bland annat:

* processautomation
* formulärlösningar
* självbetjäning
* robotiserad processautomation
* utveckling och förvaltning av automationslösningar

Relevanta tekniker är bland annat:

* Nintex
* UiPath

För Nintex finns även behov av att beskriva självbetjäningsytor och beställningsflöden där användare kan skapa eller beställa egna formulär- och workflowlösningar.

---

## Metadata, katalogisering och informationsförståelse

Metadata är en viktig del av leveransens framtida förmåga.

OpenMetadata används eller planeras användas som en central komponent för metadata och datakatalogisering.

Portalen ska kunna hjälpa användare att hitta och förstå tillgängliga datamängder.

På sikt kan portalen hämta eller visa information från OpenMetadata, men första versionen kan även fungera som en vägvisare till relevant metadata- eller datakatalogyta.

Metadata ska ses som en viktig del av portalens informationsmodell, särskilt för datatjänster, dataset, ansvar, ägarskap och dokumentation.

---

# Teknisk miljö

Leveransen bygger huvudsakligen på lokalt installerade plattformar, det vill säga on-premises.

Det gäller både verksamhetsplattformar, integrationsmiljöer och utvecklingskedja.

Exempel på viktiga delar av den tekniska miljön är:

* Red Hat OpenShift
* Kubernetes
* Red Hat OpenShift AI
* Azure DevOps Server
* Azure Pipelines i lokal installation
* Quay eller motsvarande container registry
* PostgreSQL
* Microsoft SQL Server
* interna autentiserings- och behörighetslösningar

Molnbaserade tjänster ska inte ses som en grundförutsättning för portalen.

Projektet ska därför utgå från att integrationer, autentisering, drift och publicering i första hand sker inom den interna miljön.

---

# Identitet, åtkomst och policy

Flera olika lösningar kan förekomma för identitet, autentisering, auktorisering och policyhantering.

Exempel på relevanta komponenter är:

* ADFS
* Keycloak
* OpenFGA
* OPA

Olika delar av leveransen kan använda olika identitets- eller policykomponenter.

Exempelvis används ADFS i Chattportalen, medan Keycloak förekommer i dataplattformen.

Portalen ska inte förutsätta att alla system använder samma autentiseringslösning.

Integrationer mot identitet, åtkomst och policy ska därför beskrivas separat i arkitekturdokumentation och teknisk design.

---

# Organisation

Leveransen består av flera team med olika ansvarsområden.

Organisationen kan förändras över tid.

Portalen ska därför inte byggas utifrån organisationsstrukturen utan utifrån de tjänster, förmågor och behov som användarna har.

Teamtillhörighet ska betraktas som metadata kopplad till respektive tjänst, system, plattform eller komponent.

Exempel på team- eller ansvarsområden inom leveransen är:

* frontend och visualisering
* backend och dataplattform
* AI-plattform
* automation
* Nintex/K2
* UiPath
* särskilda datamängder eller avgränsade infrastrukturområden

Portalen ska kunna visa ansvar och kontaktvägar utan att användaren behöver förstå hela organisationen.

---

# Tjänster och tekniska komponenter

En viktig princip för verksamhetsdomänen är att skilja mellan tjänster, plattformar och tekniska komponenter.

## Tjänst

En tjänst är något användaren kan hitta, förstå, beställa, använda eller få stöd kring.

Exempel:

* Beställ dashboard
* Beställ AI- eller Machine Learning-yta
* Beställ utvecklingsyta för data science
* Beställ K2- eller Nintex-yta
* Begär åtkomst till datamängd
* Hitta utvecklingsguider
* Hitta datatjänster
* Hitta rätt kontaktväg

## Plattform eller förmåga

En plattform eller förmåga är ett större område som flera tjänster kan bygga på.

Exempel:

* Dataplattform
* BI-plattform
* AI-plattform
* Automationsplattform
* Metadata- och datakatalogplattform
* Generativ AI-plattform

## Teknisk komponent

En teknisk komponent är en produkt, tjänst eller teknisk byggsten som kan ingå i en plattform eller tjänst.

Exempel:

* Trino
* Lakekeeper
* Dell Objectscale
* Dagster
* JupyterHub
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

Tekniska komponenter ska inte nödvändigtvis exponeras som egna användartjänster.

De ska däremot kunna beskrivas som beroenden, metadata eller förvaltningsinformation bakom tjänster och plattformar.

---

# Portalens roll

Portalen ska fungera som den gemensamma ingången till leveransen.

Användaren ska inte behöva känna till:

* ansvarigt team
* teknisk plattform
* organisationsstruktur
* underliggande tekniska komponenter
* var dokumentationen finns
* vilket system som hanterar beställningen

Portalen ska hjälpa användaren att hitta rätt utifrån sitt behov.

Den ska kunna samla och vägleda till:

* tjänster
* system
* plattformar
* dokumentation
* guider
* beställningar
* kontaktvägar
* datamängder
* datatjänster
* driftinformation
* vanliga frågor
* chattportal och andra närliggande system

Portalen ska inte ersätta alla dessa system, utan fungera som en vägvisare och samlingsplats.

---

# Typiska användarbehov

Exempel på vanliga behov är:

* Jag vill hitta tillgängliga datamängder.
* Jag vill se vilka datamängder jag kan konsumera.
* Jag vill beställa en dashboard.
* Jag vill kombinera flera datamängder till en rapport.
* Jag vill hitta länk till ett system.
* Jag vill hitta utvecklingsguider.
* Jag vill lägga till eller ändra behörighet för min dashboard.
* Jag vill beställa en Machine Learning-yta.
* Jag vill beställa en utvecklingsyta för data science.
* Jag vill hitta eller använda en AI-chatt.
* Jag vill beställa en K2- eller Nintex-yta.
* Jag vill veta vem som ansvarar för en tjänst.
* Jag vill hitta rätt kontaktväg för support eller rådgivning.
* Jag vill förstå vilken tjänst jag behöver.

Dessa behov ska vara mer styrande för portalens struktur än den underliggande tekniken eller organisationen.

---

# Portalens informationsområden

Portalen förväntas innehålla eller vägleda till information inom exempelvis:

* tjänster
* system
* plattformar
* datamängder
* datatjänster
* dokumentation
* guider
* beställningar
* kontaktvägar
* driftinformation
* statusinformation
* vanliga frågor
* teknisk metadata
* livscykelstatus
* ansvar och ägarskap
* relaterade system
* relaterade dokumentationsytor

Informationsmodellen ska göra det möjligt att koppla samman dessa områden.

Exempelvis ska en tjänst kunna kopplas till ansvarigt team, dokumentation, beställningsflöde, relaterade system, tekniska komponenter och kontaktvägar.

---

# Livscykel och avveckling

Leveransen innehåller både aktiva, framtida och äldre lösningar.

Portalen ska kunna beskriva livscykelstatus för tjänster, system och tekniska komponenter.

Exempel på livscykelstatus kan vara:

* aktiv
* planerad
* under införande
* legacy
* under avveckling
* avvecklad

Detta är viktigt eftersom vissa tekniker fortfarande kan förekomma i verksamheten även om de inte längre är strategiska framåt.

Portalen ska hjälpa användaren att förstå vad som är rekommenderat, vad som är på väg bort och vart man ska vända sig vid frågor.

---

# Ansvarsgränser

Leveransen ansvarar inte nödvändigtvis för hela den underliggande infrastrukturen som tjänsterna bygger på.

En tjänst kan bygga på plattformar eller tekniska komponenter som ägs, driftas eller förvaltas av andra delar av organisationen.

Exempel:

* Leveransen kan ansvara för färdiga devspace-paket inom Kubernetes/OpenShift utan att ansvara för hela containerplattformen.
* Leveransen kan erbjuda datatjänster som bygger på dataplattformskomponenter utan att varje underliggande komponent är en användarnära tjänst.
* Leveransen kan länka till Chattportalen utan att huvudportalen själv ansvarar för Chattportalens interna funktioner.

Ansvarsgränser ska kunna beskrivas tydligt i portalens innehåll och informationsmodell.

---

# Avgränsningar

Portalen är inte avsedd att ersätta befintliga verksamhetssystem, specialistverktyg eller tekniska plattformar.

Den ska fungera som en gemensam ingång till leveransens tjänster och peka användaren vidare till rätt system, dokumentation, kontaktväg eller beställningsflöde.

Specialiserade verktyg för exempelvis utveckling, analys, övervakning, metadatahantering, AI, automation eller drift används fortsatt där de är mest lämpliga.

Portalen ska inte innehålla hemligheter, interna tekniska detaljer eller miljöspecifik konfiguration som inte behövs för användarens förståelse.

---

# Förändringshantering

Verksamheten utvecklas kontinuerligt.

Nya plattformar, tjänster, system, team och tekniska komponenter kan tillkomma eller avvecklas.

Portalens informationsmodell ska därför utformas så att förändringar kan hanteras genom konfiguration och innehåll snarare än genom omfattande kodförändringar.

När nya tjänster eller system tillkommer ska de i första hand beskrivas som strukturerad information.

När tekniska komponenter byts ut ska detta helst kunna hanteras som metadata kopplat till berörda tjänster och plattformar.

---

# Sammanfattning

Data- och analysportalen är en bred leverans med ansvar för flera verksamhetskritiska förmågor inom data, analys, AI och automation.

Portalen som utvecklas ska fungera som en gemensam, användarnära ingång till denna leverans.

Den ska presentera tjänster och behov före tekniska komponenter, men samtidigt kunna bära tillräcklig teknisk metadata för att stödja förvaltning, spårbarhet, integrationer och framtida vidareutveckling.
