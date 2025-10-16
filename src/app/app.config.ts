import { ApplicationConfig, InjectionToken, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { Service } from './services/service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BASE_URL } from './base_url';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide:BASE_URL,
      useValue:'http://localhost:3000'
    },
    Service,
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    //provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch()
    )
  ]
};
