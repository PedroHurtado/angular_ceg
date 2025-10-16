import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { Service } from './services/service';

export const appConfig: ApplicationConfig = {
  providers: [
    Service,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    //provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};
