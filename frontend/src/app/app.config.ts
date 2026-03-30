import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Configures Angular's change detection. eventCoalescing: true allows Angular to batch multiple events together, improving performance by reducing the number of change detection cycles.
    provideRouter(routes), // Registers the routing configuration defined in the app.routes.ts file. This allows Angular to handle navigation and URL changes based on the defined routes.
    provideClientHydration(withEventReplay()), // SSR enabled.
    provideHttpClient() // Registers the HttpClient service, which allows the application to make HTTP requests to backend APIs. This is essential for fetching data and interacting with servers.
  ]
};
