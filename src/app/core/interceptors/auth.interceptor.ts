import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

/**
 * HTTP Interceptor for automatic authentication token handling
 *
 * Features:
 * - Automatically attaches JWT token to outgoing requests
 * - Handles 401 Unauthorized responses
 * - Implements automatic token refresh flow
 * - Redirects to login on authentication failure
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the token from AuthService
  const token = authService.getToken();

  // Clone the request and add Authorization header if token exists
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Process the request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Check if this is already a token refresh request
        if (req.url.includes('/auth/refresh')) {
          // Token refresh failed, logout and redirect to login
          console.error('Token refresh failed, logging out');
          authService.logout();
          router.navigate(['/']); // Redirect to home/map page
          return throwError(() => error);
        }

        // Check if this is a login request
        if (req.url.includes('/auth/login')) {
          // Let login errors pass through
          return throwError(() => error);
        }

        // Try to refresh the token
        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            // Retry the original request with the new token
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Token refresh failed, logout and redirect
            console.error('Token refresh failed during retry, logging out');
            authService.logout();
            router.navigate(['/']); // Redirect to home/map page
            return throwError(() => refreshError);
          })
        );
      }

      // For other errors, pass them through
      return throwError(() => error);
    })
  );
};
