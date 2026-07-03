# Frontend – Data- och analysportalen (mockup)

Angular-applikation som utgör den lokala mockupen av Data- och analysportalen. Se
[repositoryts huvud-README](../README.md) och [`docs/`](../docs/) för projektets fulla kontext,
principer och informationsmodell.

Detta är en visuell och funktionell prototyp. Det finns ingen backend – all data läses från fiktiv
mockdata under `public/assets/mock/`.

## Köra lokalt

```bash
npm install
npm start
```

Öppna `http://localhost:4200/` i webbläsaren. Sidan laddas om automatiskt vid ändringar.

## Struktur

```text
src/app/
├── core/           Runtime-konfiguration och generisk mockdata-åtkomst
├── shared/         Återanvändbara komponenter (kort, badges, sökruta, m.m.)
├── layout/         Applikationsskal: sidomeny, topbar, sidfot
├── features/       Sidor/vyer, en katalog per informationsområde
├── models/         TypeScript-modeller som speglar informationsmodellen (docs/03)
└── services/       Angular services som läser mockdata per informationsobjekt
```

Mockdata ligger under `public/assets/mock/*.json` och runtime-konfiguration under
`public/assets/config/runtime-config.json`. Inget av innehållet är känsligt – se
[`docs/05_Konfiguration.md`](../docs/05_Konfiguration.md).

## Bygga

```bash
npm run build
```

Byggartefakter hamnar i `dist/` (ingår inte i versionshantering).

## Tester

```bash
npm test
```

## Mer information

Genererat med [Angular CLI](https://github.com/angular/angular-cli) 22. För kommandoreferens, se
[Angular CLI Overview](https://angular.dev/tools/cli).
