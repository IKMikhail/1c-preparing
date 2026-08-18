import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // HashLocationStrategy so deep links (e.g. #/exam/topic-1) work on GitHub Pages
    // without any server-side rewrite configuration for the /1c-preparing/ sub-path.
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withFetch()),
  ],
};
