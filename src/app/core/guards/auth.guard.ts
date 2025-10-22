import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

/**
 * Auth Guard to protect routes requiring authentication
 *
 * Usage:
 * - Add to route definition: canActivate: [authGuard]
 * - Checks if user is authenticated via AuthService
 * - Redirects to home page if not authenticated
 * - Stores intended URL in query params for post-login redirect
 */
export const authGuard: CanActivateFn = (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;

  // Redirect to home page with return URL in query params
  // This allows the login component to redirect back after successful login
  router.navigate(['/'], {
    queryParams: { returnUrl }
  });

  return false;
};
