# 12_Designsystem_och_UI.md

# Designsystem och UI

## Dokumentinformation

| Egenskap | Värde                                                                                       |
| -------- | ------------------------------------------------------------------------------------------- |
| Dokument | 12_Designsystem_och_UI.md                                                                   |
| Typ      | Design- och UI-principer                                                                    |
| Status   | Utkast                                                                                      |
| Ägare    | Data- och analysportalen                                                                    |
| Syfte    | Beskriva portalens visuella uttryck, färgtema, typografi, layoutprinciper och UI-riktlinjer |

---

# Syfte

Detta dokument beskriver hur portalens visuella uttryck ska utformas.

Syftet är att säkerställa att portalen:

* följer företagets grafiska profil
* är tydlig och användbar
* har god tillgänglighet
* får ett konsekvent och förvaltningsbart UI
* kan byggas med återanvändbara komponenter
* använder färg, typografi och layout på ett kontrollerat sätt

Dokumentet ska fungera som stöd för utvecklare, designers, produktägare, granskare och AI-verktyg.

---

# Grundprincip

Portalens design ska vara:

* enkel
* tydlig
* luftig
* konsekvent
* tillgänglig
* professionell
* behovsstyrd

Portalen ska inte försöka visa allt samtidigt.

Användaren ska snabbt kunna förstå:

* var man är
* vad man kan göra
* vilka tjänster som finns
* hur man kommer vidare
* vad som är viktigt
* om något kräver åtgärd

---

# Relation till övriga dokument

Designsystemet ska stödja projektets övriga dokumentation.

Särskilt viktiga dokument är:

* `01_Projektvision.md`
* `02_Verksamhetsbeskrivning.md`
* `03_Informationsmodell.md`
* `04_Systemarkitektur.md`
* `06_Utvecklingsprinciper.md`
* `08_Lokal_utvecklingsmiljö.md`
* `09_Teststrategi.md`

Designen ska utgå från informationsmodellen och användarens behov, inte från tekniska komponenter eller organisationsstruktur.

---

# Visuell riktning

Portalen ska ha ett modernt, internt och förtroendeingivande uttryck.

Den ska kännas som ett arbetsverktyg snarare än en kampanjsida.

Det visuella uttrycket bör vara:

* minimalistiskt
* datadrivet
* sakligt
* lugnt
* tydligt
* lätt att skanna
* anpassat för återkommande användning

Färgprofilen ska användas för igenkänning och prioritering, men inte dominera gränssnittet.

---

# Färgprinciper

Färg ska användas för att:

* skapa igenkänning
* visa interaktivitet
* markera prioritet
* visa status
* stödja navigation
* skapa tydlig hierarki

Färg ska inte vara den enda informationsbäraren.

Information ska alltid kunna förstås även utan färg, exempelvis genom text, ikon, placering eller form.

---

# Huvudfärg

Företagets röda profilfärg är portalens huvudsakliga accentfärg.

Den används främst för:

* aktiva menyval
* primära knappar
* länkar
* fokusmarkeringar
* viktiga interaktiva element
* ikoner i neutral kontext
* diskreta accentytor
* markering av vald flik eller sektion

## Primär röd

```text
RGB: 215, 0, 0
HEX: #D70000
```

Denna färg ska vara den huvudsakliga röda färgen i portalen.

## Digital förstärkningsröd

```text
RGB: 255, 0, 0
HEX: #FF0000
```

Denna färg får användas sparsamt i digitala sammanhang där starkare accent behövs.

Den ska inte användas som standardfärg för stora ytor eller längre text.

---

# Röd färgskala

Den röda färgskalan kan användas för att skapa djup, variation och visuella tillstånd.

Exempel på röd skala:

| Namn    |       RGB | HEX       | Rekommenderad användning                |
| ------- | --------: | --------- | --------------------------------------- |
| Red 100 | 255, 0, 0 | `#FF0000` | Stark digital accent, mycket sparsamt   |
| Red 200 | 215, 0, 0 | `#D70000` | Primär accentfärg                       |
| Red 300 | 175, 0, 0 | `#AF0000` | Hover, mörkare accent                   |
| Red 400 | 135, 0, 0 | `#870000` | Aktivt tillstånd, mörk knapp            |
| Red 500 |  95, 0, 0 | `#5F0000` | Djup accent, varning i grafiska element |
| Red 600 |  55, 0, 0 | `#370000` | Mycket mörk röd, används sparsamt       |

## Princip

Rött ska användas med återhållsamhet.

I portalen bör rött främst fungera som accentfärg, inte som bakgrundsfärg för stora ytor.

---

# Gråskala

Gråskalan är viktig för att skapa ett lugnt och tydligt gränssnitt.

Grå används för:

* bakgrunder
* kort
* ramar
* sekundär text
* inaktiva element
* avdelare
* sidopaneler
* tabeller
* informationsytor

Exempel på gråskala:

| Namn     |           RGB | HEX       | Rekommenderad användning       |
| -------- | ------------: | --------- | ------------------------------ |
| Gray 100 | 245, 245, 245 | `#F5F5F5` | Sidbakgrund                    |
| Gray 200 | 235, 235, 235 | `#EBEBEB` | Alternativ bakgrund            |
| Gray 300 | 210, 210, 210 | `#D2D2D2` | Ramar och avdelare             |
| Gray 400 | 160, 160, 160 | `#A0A0A0` | Sekundär ikon eller stödtext   |
| Gray 500 | 120, 120, 120 | `#787878` | Sekundär text                  |
| Gray 600 |    80, 80, 80 | `#505050` | Brödtext i vissa lägen         |
| Black    |       0, 0, 0 | `#000000` | Hög kontrast, används sparsamt |

## Princip

Gråskalan ska bära större delen av gränssnittets struktur.

Rött ska användas för att hjälpa användaren att hitta rätt, inte för att färga hela upplevelsen.

---

# Kompletterande färger

Kompletterande färger får användas när information behöver särskiljas från profilrött.

De ska främst användas för:

* diagram
* informationsgrafik
* status
* kategorier
* tekniska illustrationer
* visuella markörer där rött inte är lämpligt

Exempel på kompletterande färger:

| Färg   |         RGB | HEX       | Rekommenderad användning                  |
| ------ | ----------: | --------- | ----------------------------------------- |
| Grön   |   0, 95, 55 | `#005F37` | Positiv status, aktiv, i drift            |
| Blå    |   0, 55, 95 | `#00375F` | Information, datatjänster, neutral teknik |
| Orange |  255, 95, 0 | `#FF5F00` | Varning, uppmärksamhet                    |
| Gul    | 255, 215, 0 | `#FFD700` | Information, markering, diagram           |

## Princip

Kompletterande färger får inte användas som nya profilfärger.

De ska användas funktionellt, inte dekorativt.

---

# Statusfärger

Statusfärger ska vara konsekventa i hela portalen.

| Status          | Färg             | Exempel                                |
| --------------- | ---------------- | -------------------------------------- |
| I drift / OK    | Grön             | Aktiv tjänst, fungerande system        |
| Information     | Blå              | Informativt meddelande                 |
| Varning         | Orange eller gul | Planerat underhåll, begränsad påverkan |
| Fel / kritiskt  | Röd              | Incident, driftstörning                |
| Inaktiv / okänd | Grå              | Saknad status, avvecklad eller dold    |

## Princip

Status ska alltid visas med både färg och text.

Exempel:

```text
Grön ikon + "I drift"
Röd ikon + "Driftstörning"
Orange ikon + "Planerat underhåll"
```

---

# Kontrast och tillgänglighet

Alla komponenter i portalen ska ha tillräcklig kontrast.

Det gäller särskilt:

* text
* knappar
* länkar
* kort
* formulärfält
* statusmarkeringar
* tabeller
* diagram
* ikoner
* navigationsobjekt

## Principer

* Färg får inte vara enda informationsbäraren.
* Text ska ha god läsbarhet mot bakgrund.
* Fokusmarkeringar ska vara tydliga.
* Interaktiva element ska vara möjliga att använda med tangentbord.
* Formulärfält ska ha tydliga etiketter.
* Felmeddelanden ska vara begripliga.
* Länkar ska kunna identifieras även utan färg.

---

# Typografi

Portalens digitala typografi ska utgå från företagets kommunikationstypsnitt.

## Digitalt typsnitt

För digitala produktioner används:

```text
Open Sans Regular
Open Sans Bold
```

Open Sans ska vara primärt typsnitt i portalen.

## Fallback

Om Open Sans inte är tillgängligt används fallback enligt exempel:

```css
font-family: "Open Sans", Arial, sans-serif;
```

## Office och övriga sammanhang

I Office-miljö används Arial och Georgia.

Dessa ska inte vara portalens primära webbtypsnitt, men kan förekomma i dokument, exporter eller material som skapas utanför portalen.

---

# Typsnittsprinciper

Portalen ska använda få typografiska varianter.

Det innebär:

* undvik för många storlekar
* undvik för många vikter
* använd Regular och Bold som huvudregel
* undvik kursiv text
* undvik understruken text annat än för länkar
* undvik versaler i längre rubriker
* använd korta och tydliga rubriker

## Versaler

Versal text kan användas i korta etiketter eller små kategorimarkörer om det behövs.

Versaler ska undvikas i längre rubriker eftersom det försämrar läsbarheten.

---

# Rekommenderad typografisk skala

Exempel på typografisk skala för portalen:

| Element | Rekommenderad användning |
| ------- | ------------------------ |
| H1      | Sidtitel                 |
| H2      | Större sektion           |
| H3      | Kort- eller blockrubrik  |
| Body    | Brödtext                 |
| Small   | Hjälptext, metadata      |
| Label   | Formulär och filter      |
| Badge   | Status och kategori      |

Exakta storlekar kan definieras i SCSS eller design tokens när implementationen påbörjas.

---

# Layoutprinciper

Företagets grafiska profil använder kvadraten som layoutprincip.

I portalen ska detta översättas till ett tydligt och konsekvent gridsystem.

## Digital layout

Portalen ska använda ett responsivt grid.

Gridet ska stödja:

* tydliga marginaler
* konsekvent avstånd
* kortbaserade ytor
* jämna kolumner
* stabil sidstruktur
* responsiv anpassning

Bootstrap kan användas som tekniskt stöd för grid och responsiv layout.

## Princip

Layouten ska vara luftig.

Det ska finnas tydlig separation mellan:

* navigation
* sidhuvud
* huvudsektioner
* kort
* listor
* filter
* formulär
* statusytor

---

# Grid och avstånd

Portalen bör använda konsekventa avstånd.

Exempel på spacing-skala:

| Token     | Exempelvärde | Användning                          |
| --------- | -----------: | ----------------------------------- |
| `space-1` |         4 px | Små interna avstånd                 |
| `space-2` |         8 px | Tät placering                       |
| `space-3` |        12 px | Mindre komponentavstånd             |
| `space-4` |        16 px | Standardavstånd                     |
| `space-5` |        24 px | Mellan sektioner                    |
| `space-6` |        32 px | Större sektioner                    |
| `space-7` |        48 px | Sidhuvud och större block           |
| `space-8` |        64 px | Stort mellanrum mellan större ytor  |

## Princip

Avstånd ska vara konsekvent.

Hellre färre tydliga avstånd än många specialfall.

---

# Sidstruktur

En standardsida i portalen bör bestå av:

* toppnavigation eller sidnavigation
* sidrubrik
* kort beskrivning
* sök eller filter där det är relevant
* huvudinnehåll
* relaterade länkar eller åtgärder
* eventuell status eller hjälp

Exempel:

```text
Sidtitel
Kort beskrivning
Sök/filter
Innehållskort eller lista
Relaterade resurser
```

---

# Navigation

Navigationen ska hjälpa användaren att hitta utifrån behov.

Primära navigationsområden kan exempelvis vara:

* Hem
* Data & insikter
* Tjänster
* Beställ & samverka
* Kunskap & styrning
* Hjälp

Alternativt kan en mer applikationslik sidomeny användas med:

* Hem
* Tjänster
* System & länkar
* Data & katalog
* Guider & dokumentation
* Beställ & få tillgång
* Status & drift
* Kontakt & support
* Om portalen

## Princip

Navigationen ska vara stabil och konsekvent.

Tekniska komponenter ska inte dominera huvudnavigationen.

## Topbar

* Topbar på undersidor ska inte innehålla konkurrerande sökfält.
* Global sök erbjuds via startsida, sökresultatsida och relevanta katalogvyer.
* Topbar används för driftstatus, hjälp och eventuell användarkontext.

---

# Startsida

Startsidan ska ge en enkel ingång till vanliga behov.

Den bör innehålla:

* tydlig huvudrubrik
* kort beskrivning
* central sökfunktion
* genvägar till vanliga behov
* utvalda tjänster
* beställningar och självbetjäning
* status i korthet
* hjälp och support

Startsidan ska inte visa för mycket information samtidigt.

Den ska vara en startpunkt, inte en komplett katalog.

---

# Kortkomponenter

Kort används för att visa tjänster, system, guider, beställningar och status.

## Ett kort bör innehålla

* ikon
* titel
* kort beskrivning
* status eller kategori vid behov
* tydlig åtgärd
* eventuell metadata

## Principer

Kort ska vara:

* skanningsbara
* jämnstora där det är möjligt
* tydliga
* klickbara endast när det är tydligt
* konsekventa i layout

Exempel på korttyper:

* ServiceCard
* SystemCard
* GuideCard
* OrderCard
* StatusCard
* ContactCard
* DatasetCard

---

# Knappar

Knappar används för tydliga åtgärder.

## Knappnivåer

| Typ        | Användning                        |
| ---------- | --------------------------------- |
| Primär     | Viktigaste åtgärden på sidan      |
| Sekundär   | Alternativ åtgärd                 |
| Tertiär    | Diskret åtgärd eller textlänk     |
| Destruktiv | Åtgärd med risk eller borttagning |

## Princip

Det ska normalt bara finnas en primär knapp per tydlig yta.

Röd används för primära åtgärder, men ska användas återhållsamt.

---

# Länkar

Länkar används för navigation och externa system.

Länkar ska vara tydliga även utan färg.

## Principer

* Länktext ska beskriva målet.
* Undvik "klicka här".
* Externa systemlänkar ska vara tydliga.
* Länkar till interna system ska hanteras via konfiguration.
* Länkar ska ha tydligt hover- och fokustillstånd.

---

# Ikoner

Ikoner kan användas för att förstärka förståelse och göra gränssnittet lättare att skanna.

## Principer

* Ikoner ska stödja text, inte ersätta text.
* Ikoner ska användas konsekvent.
* Samma begrepp ska ha samma ikon.
* Ikoner ska inte bära kritisk information ensamma.
* Dekorativa ikoner ska inte störa läsbarhet.

Exempel:

| Område     | Ikonidé             |
| ---------- | ------------------- |
| Data       | databas             |
| Dashboard  | diagram             |
| AI         | robot eller gnista  |
| Automation | flöde               |
| Guide      | bok                 |
| Systemlänk | länk                |
| Support    | headset             |
| Status     | check, varning, fel |

---

# Formulär

Formulär används för beställningar, filtrering och framtida självbetjäning.

## Principer

Formulär ska ha:

* tydliga labels
* hjälptext där det behövs
* validering
* begripliga felmeddelanden
* tydliga obligatoriska fält
* logisk gruppering
* tydlig primär åtgärd
* möjlighet att avbryta eller gå tillbaka

Beställningsformulär ska visa förutsättningar och eventuella beroenden innan användaren skickar in.

---

# Tabeller och listor

Tabeller används för strukturerad information, exempelvis datamängder, systemstatus eller teknisk metadata.

## Principer

Tabeller ska:

* ha tydliga kolumnrubriker
* kunna filtreras där det behövs
* kunna sorteras där det ger värde
* inte innehålla för många kolumner samtidigt
* fungera på mindre skärm genom förenkling eller alternativ vy
* visa tomt läge när data saknas

Listor kan användas när informationen är mer beskrivande än numerisk.

---

# Sök och filtrering

Sök är en central funktion i portalen.

Sök ska stödja behov som:

* hitta tjänst
* hitta system
* hitta guide
* hitta datamängd
* hitta beställning
* hitta kontaktväg

## Principer

* Sökfält ska vara lätt att hitta.
* Filter ska vara begripliga.
* Tomma resultat ska ge vägledning.
* Sökresultat ska visa typ av objekt.
* Sök ska inte kräva att användaren kan rätt tekniskt begrepp.

---

# Tillgänglighetsprinciper

Portalen ska byggas med tillgänglighet från början.

## Viktiga principer

* använd semantisk HTML
* använd tydlig rubrikstruktur
* säkerställ tangentbordsnavigation
* visa fokus tydligt
* använd labels på formulär
* undvik färg som enda bärare av betydelse
* skriv tydliga felmeddelanden
* säkerställ kontrast
* ge bilder och ikoner rätt alternativtext eller dölj dekorativa element

---

# Responsivitet

Portalen ska fungera på olika skärmstorlekar.

Primärt fokus är desktop och laptop, men gränssnittet ska kunna anpassas till mindre skärmar.

## Principer

* kort ska kunna staplas
* tabeller ska kunna förenklas
* navigation ska kunna kollapsa
* filter ska kunna visas i panel eller dropdown
* viktiga åtgärder ska vara lätta att nå

## Styrande princip för nya vyer

* Nya vyer och större UI-ändringar ska fungera på mobil, tablet och desktop.
* Centrala funktioner får inte vara beroende av hover.
* Formulär, processer, navigation och sök ska fungera med tangentbord, touch och smal skärm.
* Nya eller ändrade komponenter ska minst granskas vid cirka 375 px, 768 px och desktopbredd.
* Om något inte är fullt responsivt i en iteration ska det dokumenteras som känd begränsning i work itemets handoff.

---

# Bootstrap

Bootstrap kan användas som stöd för:

* grid
* responsiv layout
* spacing
* knappar
* formulär
* kort
* modaler
* badges
* grundläggande komponentmönster

## Princip

Bootstrap ska inte definiera portalens identitet ensam.

Projektets egna design tokens, färger, typografi och komponentprinciper ska styra uttrycket.

Bootstrap används som tekniskt stöd, inte som ersättning för designsystemet.

---

# Design tokens

Färger, spacing, typografi och andra återkommande designvärden bör samlas som design tokens.

Exempel:

```scss
$color-red-primary: #D70000;
$color-red-strong: #FF0000;
$color-red-dark: #870000;

$color-gray-100: #F5F5F5;
$color-gray-200: #EBEBEB;
$color-gray-300: #D2D2D2;
$color-gray-500: #787878;
$color-gray-700: #505050;
$color-black: #000000;

$color-status-success: #005F37;
$color-status-info: #00375F;
$color-status-warning: #FF5F00;
$color-status-highlight: #FFD700;
```

## Princip

Färger ska inte spridas som hårdkodade hex-värden i komponenter.

Komponenter ska använda gemensamma tokens eller CSS-variabler.

---

# Exempel på CSS-variabler

```css
:root {
  --color-brand-red: #D70000;
  --color-brand-red-strong: #FF0000;
  --color-brand-red-dark: #870000;

  --color-gray-100: #F5F5F5;
  --color-gray-200: #EBEBEB;
  --color-gray-300: #D2D2D2;
  --color-gray-500: #787878;
  --color-gray-700: #505050;

  --color-status-success: #005F37;
  --color-status-info: #00375F;
  --color-status-warning: #FF5F00;

  --font-family-base: "Open Sans", Arial, sans-serif;
}
```

---

# UI-komponenter

Portalen bör byggas med återanvändbara UI-komponenter.

Exempel:

* PageHeader
* SearchBox
* FilterBar
* ServiceCard
* SystemLinkCard
* GuideCard
* OrderCard
* StatusBadge
* LifecycleBadge
* ContactCard
* EmptyState
* LoadingState
* ErrorMessage
* Breadcrumb
* SectionHeader

## Princip

Komponenter ska vara generiska och kunna återanvändas mellan olika sidor.

Specialkomponenter ska bara skapas när det finns ett tydligt behov.

---

# Design för olika sidor

## Startsida

Startsidan ska vara enkel och vägledande.

Fokus:

* sök
* genvägar
* prioriterade tjänster
* beställningar
* status
* hjälp

## Tjänstekatalog

Tjänstekatalogen ska stödja sök, filtrering och tydlig översikt.

Fokus:

* tjänstens namn
* kort beskrivning
* kategori
* målgrupp
* livscykelstatus
* ansvar eller kontaktväg

## Tjänstedetalj

Tjänstedetaljen ska förklara vad tjänsten är, vem den är till för och hur användaren kommer vidare.

Fokus:

* beskrivning
* målgrupp
* beställning
* dokumentation
* systemlänkar
* kontaktväg
* relaterade tjänster
* status
* teknisk metadata vid behov

## Data och katalog

Data- och katalogsidor ska hjälpa användaren att hitta och förstå datamängder.

Fokus:

* sök
* filter
* datadomän
* ägare
* klassning
* åtkomst
* metadata
* relaterade Information Marts
* relaterade BI-tillämpningar

## Beställ och få tillgång

Beställningssidor ska vara tydliga och stegvisa.

Fokus:

* vad användaren kan beställa
* förutsättningar
* beroenden
* ansvarigt team
* manuell eller automatiserad hantering
* förväntad hantering
* länk eller formulär

## Status och drift

Statussidor ska vara tydliga och lugna.

Fokus:

* aktuell status
* pågående incidenter
* planerat underhåll
* berörda tjänster
* berörda system
* tidpunkt för uppdatering
* kontaktväg vid problem

---

# Minimalism och informationsmängd

Portalen ska undvika plottrighet.

## Principer

* visa färre saker per vy
* prioritera tydliga rubriker
* använd luft
* använd korta texter
* gruppera relaterad information
* visa detaljer först när användaren behöver dem
* använd progressiv fördjupning
* undvik onödiga ikoner, ramar och färger
* undvik flera konkurrerande primära åtgärder

## Progressiv fördjupning

Startsidan ska visa ingångar.

Listor ska visa översikt.

Detaljsidor ska visa fördjupning.

Teknisk metadata ska visas där den hjälper, inte överallt.

---

# Bildspråk och illustrationer

Illustrationer kan användas sparsamt för att förstärka portalens uttryck.

## Principer

* illustrationer ska vara lugna och sakliga
* använd ljus gråskala med röda accenter
* undvik röriga bakgrunder
* undvik stock-känsla
* undvik illustrationer som tar fokus från uppgiften
* använd inte interna skärmbilder i generiskt repository

Illustrationer ska stödja innehållet, inte ersätta det.

---

# Mockups

Mockups kan användas för att diskutera layout, informationsstruktur och visuell riktning.

Mockups är inte bindande implementation.

När mockups används ska de granskas mot:

* användarbehov
* informationsmodell
* tillgänglighet
* färgprofil
* enkelhet
* responsivitet
* teknisk genomförbarhet

## Princip

Mockups ska hjälpa projektet att fatta bättre beslut, men den faktiska implementationen ska följa dokumenterade principer och komponentstruktur.

---

# Användning av företagets grafiska profil

Företagets grafiska profil ska översättas till ett digitalt arbetsverktyg.

Det innebär att profilen ska användas konsekvent men återhållsamt.

## Viktiga delar

* röd huvudfärg
* kompletterande gråskala
* Open Sans för digitalt gränssnitt
* kvadratbaserad layoutprincip
* tydliga kontraster
* återkommande visuella mönster

## Avgränsning

Portalen ska inte kopiera trycksaksprinciper direkt.

Digital användbarhet, responsivitet och tillgänglighet går före dekorativa profiluttryck.

---

# Logotyp och varumärkesyta

Logotyp och eventuell varumärkesyta ska hanteras enligt företagets grafiska riktlinjer.

I portalens generiska repository ska verklig logotyp inte behöva finnas.

## Principer

* använd platshållare i generisk kod
* verklig logotyp tillförs i intern miljö eller via godkänd asset-hantering
* logotyp ska inte dominera arbetsytan
* navigation och innehåll ska vara viktigare än dekorativ varumärkesyta

---

# Filer och assets

Verkliga profilfiler, logotyper och typsnitt ska inte läggas i ett generiskt repository om de inte uttryckligen får delas och versionshanteras.

## Repositoryt får innehålla

* generiska ikonexempel
* design tokens
* CSS-variabler
* dokumentation
* placeholders
* mockups utan känslig information

## Repositoryt bör inte innehålla

* interna logotypfiler om de inte är godkända för det
* licensierade typsnittsfiler
* interna skärmbilder
* profilmanualer som inte får spridas
* bilder med intern information

---

# AI-stödd UI-generering

AI-verktyg får hjälpa till att ta fram mockups, komponentförslag och designidéer.

AI ska följa detta dokument och får inte skapa mockups med:

* verkliga interna URL:er
* verkliga systemnamn som inte är godkända
* personuppgifter
* interna skärmbilder
* hemliga logotyper eller assets
* interna ärenden eller produktionsdata

AI-genererade mockups ska ses som visuella förslag, inte som färdig design.

---

# Checklista för UI-granskning

Vid granskning av nya UI-delar bör följande kontrolleras:

```text
- [ ] Följer sidan portalens informationsmodell?
- [ ] Är användarens behov tydligt?
- [ ] Är sidan tillräckligt enkel?
- [ ] Finns tydlig rubrik och beskrivning?
- [ ] Används rött som accent, inte som överlastning?
- [ ] Är kontrasten tillräcklig?
- [ ] Är färg inte enda informationsbärare?
- [ ] Är texten begriplig?
- [ ] Är komponenterna konsekventa?
- [ ] Fungerar layouten responsivt?
- [ ] Finns tydliga tomma lägen?
- [ ] Finns begripliga felmeddelanden?
- [ ] Finns inga interna URL:er eller känsliga uppgifter?
```

---

# Checklista för färganvändning

```text
- [ ] Primär röd används endast där den hjälper användaren.
- [ ] Stora röda ytor undviks i arbetsvyer.
- [ ] Gråskala används för struktur och lugn.
- [ ] Kompletterande färger används funktionellt.
- [ ] Status visas med både färg och text.
- [ ] Kontrast är kontrollerad.
- [ ] Färger används via tokens eller CSS-variabler.
```

---

# Första versionens rekommendation

Första versionen av portalen bör hålla UI:t enkelt.

Fokus bör ligga på:

* tydlig startsida
* tydlig navigation
* sök
* kort för genvägar
* tjänstekatalog
* systemlänkar
* beställningar
* status i korthet
* support och dokumentation
* konsekvent färgtema
* Open Sans
* återanvändbara komponenter
* god kontrast

Mer avancerade visuella mönster kan införas senare.

---

# Avgränsningar

Detta dokument beskriver design- och UI-principer.

Det beskriver inte:

* fullständig grafisk profilmanual
* exakta designfiler
* exakta Figma-komponenter
* verkliga logotypfiler
* licensierade typsnittsfiler
* detaljerad implementation av varje Angular-komponent
* komplett tillgänglighetsrevision

Dessa delar hanteras separat vid behov.

---

# Sammanfattning

Portalens UI ska vara enkelt, tydligt, tillgängligt och konsekvent.

Företagets röda färgprofil ska användas som accent och igenkänning, medan gråskala, luft och tydlig typografi ska bära huvuddelen av gränssnittet.

Open Sans ska vara primärt digitalt typsnitt.

Layouten ska vara gridbaserad, luftig och lätt att skanna.

Designsystemet ska stödja portalens viktigaste mål: att hjälpa användaren att snabbt hitta rätt tjänst, system, dokumentation, beställning eller kontaktväg.
