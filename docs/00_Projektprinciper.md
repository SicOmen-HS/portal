# 00_Projektprinciper.md

# Projektprinciper

## Syfte

Detta dokument beskriver de grundläggande principer som styr utvecklingen av projektet.

Projektprinciperna fungerar som projektets gemensamma riktlinjer och ska ligga till grund för tekniska beslut, arkitektur, utveckling, dokumentation och förvaltning.

Om en lösning står i konflikt med dessa principer ska principerna alltid ha företräde.

---

# Projektets mål

Projektets mål är att utveckla en intern portal som fungerar som den naturliga ingången till leveransen **Data- och analysportalen**.

Portalen ska göra det enkelt för interna användare att:

* hitta tjänster
* hitta dokumentation
* beställa funktioner och plattformar
* hitta system och verktyg
* hitta tillgängliga datamängder
* förstå hur leveransen fungerar
* hitta rätt kontaktvägar

Portalen ska samtidigt vara enkel att vidareutveckla, säker att förvalta och möjlig att integrera med framtida lösningar.

---

# Grundprinciper

## 1. Säkerhet först

Säkerhet har alltid högre prioritet än bekvämlighet.

Repositoryt får aldrig innehålla:

* interna URL:er
* autentiseringsuppgifter
* API-nycklar
* certifikat
* lösenord
* servernamn
* personuppgifter
* annan företagsintern information som inte behöver versionshanteras

Känslig information ska alltid hanteras utanför Git.

---

## 2. Konfiguration före kod

Miljöberoende information ska inte hårdkodas.

Projektet ska använda externa konfigurationsfiler för exempelvis:

* URL:er
* miljöinställningar
* autentisering
* navigationsstruktur
* systemkopplingar
* företagsspecifika inställningar

Repositoryt ska endast innehålla mallar eller exempel på dessa filer.

---

## 3. Innehåll före implementation

Portalens innehåll ska i första hand vara datadrivet.

Att lägga till en ny tjänst, guide eller länk ska normalt inte kräva ny programkod utan kunna lösas genom att uppdatera innehåll eller konfiguration.

---

## 4. Enkelhet framför komplexitet

Den enklaste lösningen som uppfyller kraven ska väljas.

Onödig komplexitet ska undvikas.

Tekniska lösningar ska vara lätta att förstå även för utvecklare som inte deltagit i projektet tidigare.

---

## 5. Förvaltningsbarhet

Projektet ska byggas för långsiktig förvaltning.

Kod ska vara:

* tydlig
* modulär
* återanvändbar
* enkel att testa
* enkel att vidareutveckla

Projektet ska inte vara beroende av en enskild utvecklares kunskap.

## 6. Domändriven utveckling

Projektets struktur ska i första hand spegla verksamheten och användarnas behov, inte den underliggande tekniken.

Navigation, informationsstruktur och funktioner ska utformas utifrån de tjänster och processer som användarna arbetar med.

Tekniska implementationer och organisationsstrukturer ska inte styra användarupplevelsen.

---

## 7. Spårbarhet

Alla större förändringar ska kunna följas över tid.

Tekniska beslut ska dokumenteras.

Dokumentation ska uppdateras när förändringar påverkar projektets struktur eller arkitektur.

---

## 8. Dokumentation är en del av leveransen

Dokumentation ska vara aktuell, relevant och enkel att underhålla.

Dokumentationen ska beskriva:

* varför ett beslut har tagits
* hur lösningen är uppbyggd
* hur den ska förvaltas


Dokumentationen ska inte upprepa det som redan tydligt framgår av koden.

---

## 9. Företagets standarder ska följas

Projektet ska i första hand följa företagets etablerade standarder.

Det innebär bland annat:

* Kod skrivs på engelska.
* Dokumentation skrivs på svenska.
* Statisk kodanalys är styrande.
* Etablerade kodstandarder för respektive språk följs.

Projektets teknikval och arkitektur dokumenteras i projektets arkitekturdokument.

---

## 10. AI är ett utvecklingsverktyg

AI används som stöd vid utveckling, dokumentation och kvalitetssäkring.

AI ersätter inte utvecklarens ansvar.

All AI-genererad kod ska granskas innan den används.

Projektets arkitektur och principer ska alltid vara styrande framför AI:s förslag.

---

## 11. Integration och öppna standarder

Projektet ska utformas med en modulär arkitektur och följa öppna standarder där det är möjligt.

Lösningen ska kunna integreras med andra interna plattformar utan omfattande ombyggnation.

Särskild hänsyn ska tas till framtida integration med en utvecklarportal, exempelvis Backstage.
Projektet ska därför undvika lösningar som försvårar framtida exponering av metadata, kataloginformation eller API:er.

Det innebär bland annat att:

- metadata ska vara strukturerad och maskinläsbar
- tjänster och resurser ska kunna beskrivas som objekt
- integrationer ska ske via väldefinierade gränssnitt
- komponenter ska vara löst kopplade
- lösningen ska undvika onödiga beroenden till specifika implementationer
    
Integrationer med interna system ska i första hand ske via tydliga gränssnitt och separata integrationslager, så att portalens kärna inte blir hårt kopplad till enskilda produkter eller plattformar.

---
## 12. Återanvändning före speciallösningar 

Gemensamma komponenter ska prioriteras framför specialanpassade implementationer.

Kod ska återanvändas där det är möjligt utan att försämra läsbarhet eller underhållbarhet.


---

## 13. Repositoryt ska vara generiskt

Repositoryt ska inte innehålla företagsspecifik information.

Projektets källkod ska vara frikopplad från den lokala företagsmiljön.

Företagsspecifik information, såsom URL:er, servernamn, autentiseringsuppgifter, certifikat och miljökonfiguration, ska hållas utanför repositoryt och tillföras vid installation eller driftsättning.

Denna princip möjliggör säker lokal utveckling, användning av externa utvecklingsverktyg samt framtida förändringar av utvecklings- eller driftmiljön utan att projektets källkod behöver ändras.

---

## 14. Beslut ska kunna motiveras 

Alla större tekniska beslut ska kunna motiveras utifrån projektets mål och principer. 
Beslut ska baseras på exempelvis: 
* säkerhet 
* förvaltningsbarhet 
* användbarhet 
* prestanda 
* företagets standarder 
* långsiktig hållbarhet 

Personliga preferenser ska inte ensamma styra tekniska vägval.

## 15. Beslut ska dokumenteras

Alla större beslut som påverkar projektets arkitektur, teknikval eller arbetssätt ska dokumenteras.

Beslut ska beskriva:

- vilket problem som skulle lösas
- vilka alternativ som övervägdes
- varför beslutet togs
- vilka konsekvenser beslutet får

Detta säkerställer spårbarhet och förenklar framtida förvaltning.

---

# Definition av kvalitet

En ny funktion anses färdig först när den:

* uppfyller verksamhetens behov
* följer projektets principer
* är säker
* är dokumenterad
* är testbar
* är möjlig att förvalta
* följer kodstandarden
* följer projektets dokumentationsprinciper
* introducerar inte onödig komplexitet

---

# Dokumentets livscykel

Detta dokument är ett styrande dokument och ska endast ändras när projektets grundläggande principer förändras.

Detaljerade tekniska beslut dokumenteras i separata arkitektur- eller beslutsdokument.
