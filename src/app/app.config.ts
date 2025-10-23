import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { initializeAuth } from './core/initializers/auth.initializer';
import { SupabaseService } from './shared/services/supabase.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, httpErrorInterceptor])
    ),
    // Initialize authentication on app startup
    // This restores and validates session from localStorage
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [SupabaseService],
      multi: true
    }
  ]
};
