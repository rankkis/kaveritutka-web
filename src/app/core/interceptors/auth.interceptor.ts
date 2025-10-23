import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

/**
 * HTTP Interceptor that adds Supabase auth token to all outgoing requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabaseService = inject(SupabaseService);
  const token = supabaseService.getAccessToken();

  // Only add auth header if we have a token and it's an API request
  if (token && req.url.includes('/api')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest);
  }

  return next(req);
};
