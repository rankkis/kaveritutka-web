import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take, filter } from 'rxjs';
import { UserService } from '../services/user.service';
import { SupabaseService } from '../../shared/services/supabase.service';

/**
 * Guard to ensure user has completed their profile before accessing protected routes
 * Redirects to /profile if user is authenticated but hasn't set a display name
 *
 * If user is not authenticated, allows access (anonymous usage is permitted)
 * If user is authenticated, waits for profile data and checks if complete
 */
export const profileCompletionGuard: CanActivateFn = (_route, state) => {
  const userService = inject(UserService);
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // If user is not authenticated, allow access (anonymous usage)
  if (!supabaseService.isAuthenticated()) {
    return true;
  }

  // User is authenticated, wait for profile data to load
  return userService.getCurrentUser().pipe(
    // Wait until we have a definitive user state (not null)
    filter(user => user !== null),
    // Take the first non-null value
    take(1),
    // Check if profile is complete
    map(user => {
      const hasDisplayName = !!user?.displayName && user.displayName.trim().length > 0;

      if (hasDisplayName) {
        return true;
      }

      // Redirect to profile page if not completed
      return router.createUrlTree(['/profile'], {
        queryParams: { returnUrl: state.url }
      });
    })
  );
};
