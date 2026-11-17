import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { adminInterceptor } from './admin/admin.interceptor';
import { ENTORNO } from './core/entorno';
import { demoInterceptor } from './demo/demo.interceptor';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { routes } from './app.routes';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      // En la demo (GitHub Pages) no hay servidor: el simulador responde antes que nadie.
      withInterceptors(ENTORNO.demo ? [demoInterceptor, adminInterceptor] : [adminInterceptor]),
    ),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' })),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
