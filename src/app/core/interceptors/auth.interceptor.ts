import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';
import { environment } from '../../../environments/environment';

/**
 * HTTP Interceptor that adds Supabase auth token to all outgoing requests to the backend API
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabaseService = inject(SupabaseService);
  const token = supabaseService.getAccessToken();

  // Only add auth header if we have a token and it's a request to our backend API
  if (token && req.url.startsWith(environment.apiUrl)) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedRequest);
  }

  return next(req);
};
