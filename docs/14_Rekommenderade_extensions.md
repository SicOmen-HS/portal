# 14_Rekommenderade_extensions.md

# Rekommenderade extensions

## Dokumentinformation

| Egenskap | Värde                                                                 |
| -------- | ------------------------------------------------------------------- |
| Dokument | 14_Rekommenderade_extensions.md                                     |
| Typ      | Utvecklingsmiljö                                                     |
| Status   | Utkast                                                               |
| Ägare    | Data- och analysportalen                                            |
| Syfte    | Rekommendera editor-extensions för att utveckla portalens frontend  |

---

## Syfte

Detta dokument listar rekommenderade extensions för att utveckla portalens Angular-
frontend lokalt. Listan utgår från projektets faktiska teknikval (se
`04_Systemarkitektur.md` och `06_Utvecklingsprinciper.md`): Angular, TypeScript,
Bootstrap/SCSS och Markdown-dokumentation. Det finns i dagsläget ingen backend i
repositoryt, så inga C#/.NET-extensions listas – det avsnittet läggs till när en
backend införs enligt `04_Systemarkitektur.md`.

Ingen extension nedan kräver interna credentials, ett internt marketplace eller
åtkomst till företagets nätverk. Alla kan installeras från det publika VS Code
Marketplace.

---

## Rekommenderad editor

Visual Studio Code, eftersom det är den editor projektets `.vscode/extensions.json`
och Angular CLI:s scaffolding (`.vscode/launch.json`, `.vscode/tasks.json`) redan är
anpassade för. Visual Studio fungerar också för TypeScript/Angular-utveckling, men
extensionslistan nedan förutsätter VS Code.

---

## Obligatoriska extensions

Dessa behövs för att effektivt kunna arbeta med kodbasen som den ser ut idag.

| Namn                       | Extension-id                     | Syfte                                                                 |
| --------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Angular Language Service   | `Angular.ng-template`            | Typkontroll, autocomplete och navigering i Angular-templates (`.html`). Utan denna blir templatefel svåra att upptäcka innan runtime. |
| Prettier - Code formatter  | `esbenp.prettier-vscode`         | Projektet har en `.prettierrc` i `frontend/`. Denna extension formaterar TypeScript, HTML och SCSS enligt den konfigurationen. |
| EditorConfig for VS Code   | `EditorConfig.EditorConfig`      | Projektet har en `.editorconfig` (indenting, radslut, teckenkodning). Utan extensionen respekteras inte filen automatiskt av VS Code. |

---

## Rekommenderade extensions

Inte strikt nödvändiga, men gör arbetet betydligt smidigare.

| Namn                              | Extension-id                     | Syfte                                                                 |
| ---------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| GitLens                           | `eamodio.gitlens`                | Historik, blame och spårbarhet direkt i editorn – stödjer principen om spårbarhet (`00_Projektprinciper.md`, princip 7). |
| Markdown All in One                | `yzhang.markdown-all-in-one`     | Underlättar att skriva och navigera i `docs/`-katalogens många markdown-dokument (innehållsförteckning, förhandsgranskning). |
| markdownlint                       | `DavidAnson.vscode-markdownlint` | Enkel konsekvenskontroll av markdown-formatering i `docs/`.            |
| SCSS IntelliSense                  | `mrmlnc.vscode-scss`             | Autocomplete för SCSS-variabler och `@use`/`@import`, relevant för `frontend/src/styles/`. |
| Code Spell Checker (svenska tillägg valfritt) | `streetsidesoftware.code-spell-checker` | Fångar enkla stavfel i både kod och svensk UI-text/dokumentation. |
| REST Client                        | `humao.rest-client`              | Användbart den dag ett backend-API (`04_Systemarkitektur.md`) finns att testa mot. Inte nödvändigt för den nuvarande frontend-mockupen. |

---

## Valfria extensions

Kan vara till nytta beroende på personlig arbetsstil, men påverkar inte projektets
kodstandard om de saknas.

| Namn                    | Extension-id            | Syfte                                                             |
| ------------------------ | ------------------------- | -------------------------------------------------------------------- |
| Path Intellisense       | `christian-kohler.path-intellisense` | Autocomplete för relativa import-sökvägar i TypeScript. |
| Better Comments         | `aaron-bond.better-comments`         | Visuell markering av kommentarer, t.ex. `// TODO`.        |
| Todo Tree               | `Gruntfuggly.todo-tree`              | Samlar `TODO`/`FIXME`-kommentarer i en panel.             |
| Bootstrap 5 Quick Snippets | `wcwhitehead.bootstrap-4-vscode` (fungerar även för v5-klasser) | Snabbare Bootstrap-klassnamn. Valfritt, används sparsamt eftersom Bootstrap enligt `12_Designsystem_och_UI.md` inte ska styra projektets identitet. |

---

## VS Code extensions.json

Repositoryt innehåller `.vscode/extensions.json` med rekommendationerna ovan
(obligatoriska och rekommenderade). VS Code visar automatiskt en notis om att
installera dessa när projektmappen öppnas första gången. Filen innehåller inga
inställningar och inga interna sökvägar, och är därför säker att versionshantera
(se `05_Konfiguration.md`).

---

## Extensions som inte behövs i första versionen

* **C#/.NET-extensions** (t.ex. C# Dev Kit) – relevant först när backend enligt
  `04_Systemarkitektur.md` läggs till i detta repository.
* **Docker/containers** – mockupen kräver ingen containerisering för lokal utveckling
  (`08_Lokal_utvecklingsmiljö.md`). Relevant först vid arbete med deployment enligt
  `10_Release_och_deployment.md`.
* **ESLint-extension** – projektet har i dagsläget ingen ESLint-konfiguration
  (Angular CLI 22 scaffoldar inte längre ESLint som standard). Om projektet inför
  ESLint senare ska detta dokument uppdateras med `dbaeumer.vscode-eslint`.
* **Databasverktyg** (t.ex. PostgreSQL-klienter) – relevant först när en riktig
  applikationsdatabas införs.

---

## Sammanfattning

Extensionslistan är medvetet kort och matchar exakt den teknik som faktiskt finns i
repositoryt idag: Angular, TypeScript, SCSS och Markdown. Lägg inte till extensions
"för säkerhets skull" – utöka istället listan när en ny del av teknikstacken
(till exempel en backend) faktiskt läggs till i projektet, och uppdatera samtidigt
`.vscode/extensions.json`.
