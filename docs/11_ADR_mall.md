# 11_ADR_mall.md

# ADR-mall

## Dokumentinformation

| Egenskap | Värde                                                      |
| -------- | ---------------------------------------------------------- |
| Dokument | 11_ADR_mall.md                                             |
| Typ      | Mall för arkitekturbeslut                                  |
| Status   | Utkast                                                     |
| Ägare    | Data- och analysportalen                                   |
| Syfte    | Beskriva hur arkitekturbeslut ska dokumenteras i projektet |

---

# Syfte

Detta dokument beskriver hur arkitekturbeslut ska dokumenteras i projektet.

ADR står för **Architecture Decision Record**.

En ADR används för att dokumentera ett viktigt beslut, varför beslutet togs, vilka alternativ som övervägdes och vilka konsekvenser beslutet får.

Syftet är att skapa spårbarhet över tid.

Det ska gå att förstå varför portalen är byggd på ett visst sätt även när personer, team eller förutsättningar förändras.

---

# Grundprincip

Viktiga beslut ska dokumenteras nära den tidpunkt då de tas.

En ADR ska vara kort, tydlig och konkret.

Den ska inte vara en lång utredning, men den ska ge tillräcklig information för att framtida utvecklare, arkitekter, produktägare och granskare ska förstå beslutet.

---

# När en ADR ska skapas

En ADR ska skapas när ett beslut påverkar projektets långsiktiga riktning, arkitektur, säkerhet, förvaltning eller större tekniska struktur.

Exempel på beslut som bör dokumenteras som ADR:

* val av frontendramverk
* val av backendteknik
* val av applikationsdatabas
* val av integrationsprincip
* val av konfigurationsstrategi
* val av autentiseringslösning
* större ändring av informationsmodellen
* införande av ny central integration
* införande av ny deploymentmodell
* beslut om containerisering
* beslut om framtida Backstage-integration
* beslut om hur Chattportalen ska kopplas till huvudportalen
* beslut om hur OpenMetadata ska användas
* beslut om hur beställningsflöden ska modelleras

---

# När en ADR normalt inte behövs

En ADR behövs normalt inte för små implementationer eller ändringar som inte påverkar arkitekturen.

Exempel:

* mindre buggrättning
* textändring
* stylingjustering
* mindre refaktorering utan ändrat ansvar
* ny mockdata
* ny guide eller systemlänk enligt befintlig modell
* mindre komponent som följer befintligt mönster
* uppdatering av dokumentation utan nytt beslut

---

# ADR:er i repositoryt

ADR:er ska ligga i dokumentationskatalogen.

Rekommenderad struktur:

```text
docs/
  adr/
    0001-val-av-frontendramverk.md
    0002-val-av-backendteknik.md
    0003-val-av-applikationsdatabas.md
```

Filnamn ska vara:

```text
NNNN-kort-beskrivande-namn.md
```

Exempel:

```text
0001-val-av-angular-som-frontendramverk.md
0002-val-av-dotnet-web-api-som-backend.md
0003-val-av-postgresql-som-applikationsdatabas.md
0004-konfiguration-utan-interna-varden-i-repository.md
```

Numret ska vara löpande och ändras inte efter att ADR:en skapats.

---

# Status för ADR

En ADR ska ha en tydlig status.

Tillåtna statusar:

* Föreslagen
* Accepterad
* Ersatt
* Avvisad
* Föråldrad

## Föreslagen

Beslutet är inte taget ännu.

ADR:en används som beslutsunderlag.

## Accepterad

Beslutet är taget och gäller.

## Ersatt

Beslutet har ersatts av en ny ADR.

Den gamla ADR:en ska ligga kvar för spårbarhet.

## Avvisad

Förslaget övervägdes men valdes bort.

## Föråldrad

Beslutet är inte längre relevant, men har inte nödvändigtvis ersatts av ett nytt beslut.

---

# Ändra inte historiska beslut i onödan

En accepterad ADR ska normalt inte skrivas om i efterhand.

Om beslutet ändras ska en ny ADR skapas som ersätter den tidigare.

Den tidigare ADR:en kan uppdateras med en hänvisning till den nya, men själva historiken ska bevaras.

Exempel:

```text
Status: Ersatt av ADR-0007
```

---

# ADR-mall

Följande mall ska användas för nya ADR:er.

```markdown
# ADR-0000: Titel på beslutet

## Status

Föreslagen | Accepterad | Ersatt | Avvisad | Föråldrad

## Datum

YYYY-MM-DD

## Beslutsfattare

Namn, roll eller forum.

## Kontext

Beskriv bakgrunden till beslutet.

Vilket problem behöver lösas?

Vilka förutsättningar gäller?

Vilka dokument, principer eller begränsningar påverkar beslutet?

## Beslut

Beskriv det beslut som har tagits.

Var tydlig och konkret.

## Alternativ som övervägdes

Beskriv de viktigaste alternativen.

### Alternativ 1

Kort beskrivning.

Fördelar:

- ...

Nackdelar:

- ...

### Alternativ 2

Kort beskrivning.

Fördelar:

- ...

Nackdelar:

- ...

## Motivering

Beskriv varför det valda alternativet valdes.

Koppla gärna till projektets principer, exempelvis säkerhet, förvaltningsbarhet, enkelhet, konfiguration före kod eller företagets tekniska standarder.

## Konsekvenser

Beskriv vad beslutet innebär.

### Positiva konsekvenser

- ...

### Negativa konsekvenser eller risker

- ...

### Saker att följa upp

- ...

## Påverkade delar

Beskriv vilka delar av projektet som påverkas.

Exempel:

- frontend
- backend
- databas
- konfiguration
- deployment
- informationsmodell
- dokumentation
- test
- säkerhet
- integrationer

## Relaterade dokument

Lista relevanta dokument.

Exempel:

- `00_Projektprinciper.md`
- `03_Informationsmodell.md`
- `04_Systemarkitektur.md`
- `05_Konfiguration.md`

## Relaterade ADR:er

Lista relaterade ADR:er.

Exempel:

- ADR-0001
- ADR-0002

## Kommentarer

Eventuella kompletterande kommentarer.
```

---

# Förkortad ADR-mall

För mindre beslut som ändå behöver spårbarhet kan en kortare mall användas.

```markdown
# ADR-0000: Titel på beslutet

## Status

Accepterad

## Datum

YYYY-MM-DD

## Kontext

Kort beskrivning av problemet.

## Beslut

Kort beskrivning av beslutet.

## Motivering

Varför detta beslut valdes.

## Konsekvenser

Vad beslutet innebär framåt.

## Relaterade dokument

- ...
```

---

# Exempel på ADR

Nedan är ett exempel på hur en ADR kan se ut.

```markdown
# ADR-0001: Val av Angular som frontendramverk

## Status

Accepterad

## Datum

YYYY-MM-DD

## Beslutsfattare

Projektet för Data- och analysportalen.

## Kontext

Portalen behöver ett frontendramverk för att bygga ett internt webbgränssnitt.

Företagets etablerade standard för frontendutveckling är Angular.

Projektet behöver kunna utvecklas och förvaltas av interna utvecklare över tid.

## Beslut

Portalen ska använda Angular som frontendramverk.

Bootstrap får användas som stöd för layout, responsivitet och grundläggande UI-komponenter.

## Alternativ som övervägdes

### Angular

Fördelar:

- Följer företagets etablerade standard.
- Har tydlig struktur för större applikationer.
- Stödjer routing, komponenter, services och TypeScript.

Nackdelar:

- Kräver Angular-kompetens.
- Kan upplevas mer omfattande än enklare frontendalternativ.

### React

Fördelar:

- Brett ekosystem.
- Flexibelt.

Nackdelar:

- Är inte företagets primära standard för detta område.
- Skulle öka behovet av separata struktur- och kodstandarder.

## Motivering

Angular väljs eftersom det följer företagets etablerade standard och ger en tydlig struktur för en intern portal som ska kunna förvaltas över tid.

## Konsekvenser

### Positiva konsekvenser

- Bättre linjering med intern kompetens.
- Tydlig struktur för komponenter och routing.
- Godt stöd för TypeScript.

### Negativa konsekvenser eller risker

- Projektet blir beroende av Angular-kompetens.
- Ramverket kan vara mer omfattande än vad en enklare webbplats hade krävt.

### Saker att följa upp

- Säkerställ att frontendstrukturen dokumenteras.
- Säkerställ att Angulars stilprinciper följs.

## Påverkade delar

- frontend
- utvecklingsprinciper
- lokal utvecklingsmiljö
- teststrategi

## Relaterade dokument

- `04_Systemarkitektur.md`
- `06_Utvecklingsprinciper.md`
```

---

# Rekommenderade första ADR:er

Följande ADR:er bör skapas tidigt eftersom besluten redan är centrala för projektet.

## ADR-0001: Val av Angular som frontendramverk

Dokumenterar att frontend byggs med Angular.

## ADR-0002: Val av .NET Web API som backend

Dokumenterar att backend byggs som .NET Web API.

## ADR-0003: Val av PostgreSQL som portalens applikationsdatabas

Dokumenterar att PostgreSQL används för portalens egen applikationsdata.

## ADR-0004: Konfiguration före kod

Dokumenterar att miljöberoende och företagsspecifika värden hanteras via konfiguration, inte hårdkodning.

## ADR-0005: Integrationer via backend-adaptrar

Dokumenterar att frontend inte ska integrera direkt mot interna system och att integrationer kapslas i backend.

## ADR-0006: Generiskt repository utan företagsspecifik information

Dokumenterar att repositoryt ska vara säkert att utveckla i utanför intern miljö och inte innehålla interna URL:er, secrets eller miljödata.

## ADR-0007: Chattportalen hanteras initialt som separat systemlänk

Dokumenterar att Generativ AI Chattportal i första versionen ska länkas från portalen och inte byggas in eller administreras direkt.

---

# ADR-process

## 1. Identifiera beslut

När ett beslut påverkar arkitektur, säkerhet, förvaltning eller större struktur ska behov av ADR identifieras.

## 2. Skapa ADR som föreslagen

En ADR kan först skapas med status `Föreslagen`.

## 3. Granska

ADR:en granskas av relevanta personer, exempelvis:

* utvecklare
* arkitekt
* produktägare
* teknisk granskare
* säkerhetsfunktion där det är relevant

## 4. Acceptera eller avvisa

När beslut är taget ändras status till `Accepterad` eller `Avvisad`.

## 5. Följ beslutet i implementation

Kod, konfiguration och dokumentation ska följa accepterade ADR:er.

## 6. Ersätt vid ändrat beslut

Om beslutet ändras senare skapas en ny ADR.

Den gamla ADR:en markeras som `Ersatt`.

---

# AI och ADR

AI-verktyg får hjälpa till att föreslå eller formulera ADR:er.

AI får däremot inte själv fatta arkitekturbeslut.

AI ska föreslå ADR när en ändring påverkar exempelvis:

* teknikval
* databasstrategi
* integrationsprincip
* autentisering
* deploymentmodell
* informationsmodell
* säkerhetsprincip
* större frontendstruktur
* större backendstruktur

AI-genererade ADR:er ska granskas av människa innan de accepteras.

---

# Kvalitetskriterier för en ADR

En bra ADR ska vara:

* tydlig
* kortfattad
* daterad
* spårbar
* begriplig för nya utvecklare
* kopplad till ett konkret beslut
* tydlig med konsekvenser
* fri från secrets och företagsspecifika känsliga värden

En ADR ska inte vara:

* en fullständig teknisk specifikation
* en detaljerad implementationsmanual
* en allmän diskussion utan beslut
* en plats för hemligheter eller interna miljövärden

---

# Checklista för ny ADR

```text
- [ ] Beslutet är tillräckligt viktigt för att dokumenteras.
- [ ] Kontexten är tydlig.
- [ ] Beslutet är konkret formulerat.
- [ ] Alternativ har beskrivits i rimlig omfattning.
- [ ] Motiveringen är kopplad till projektets principer.
- [ ] Konsekvenser är beskrivna.
- [ ] Påverkade delar är angivna.
- [ ] Relaterade dokument är listade.
- [ ] ADR:en innehåller inga secrets.
- [ ] ADR:en innehåller inga interna URL:er eller miljövärden.
- [ ] Status är satt.
```

---

# Avgränsningar

Detta dokument beskriver hur ADR:er ska användas i projektet.

Det dokumenterar inte de faktiska arkitekturbesluten.

Faktiska beslut dokumenteras som separata ADR-filer i `docs/adr/`.

---

# Sammanfattning

ADR:er används för att skapa spårbarhet kring viktiga arkitekturbeslut.

De ska beskriva vad som beslutades, varför beslutet togs och vilka konsekvenser det får.

ADR:er ska vara korta, tydliga och fria från känslig information.

När projektets riktning ändras ska nya ADR:er skapas i stället för att historiken skrivs över.
