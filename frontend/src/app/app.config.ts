import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { RuntimeConfigService } from './core/config/runtime-config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // withFetch() används istället för XHR eftersom det fungerar med Angulars
    // moderna SSR-vänliga HttpClient och är standard i nya Angular-projekt.
    provideHttpClient(withFetch()),
    // Laddar runtime-config.json innan appen renderas, så att komponenter
    // aldrig visar ett "tomt" läge innan konfigurationen är på plats.
    // Se core/config/runtime-config.service.ts.
    provideAppInitializer(() => inject(RuntimeConfigService).load()),
  ],
};
