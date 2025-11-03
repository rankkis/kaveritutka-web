import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./core/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./core/auth/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'playground/:id',
    loadComponent: () => import('./features/playground/playground-detail-page/playground-detail-page.component').then(m => m.PlaygroundDetailPageComponent)
  },
  {
    path: 'playground/:id/new-playtime',
    loadComponent: () => import('./features/playtime/playtime-form-page/playtime-form-page.component').then(m => m.PlaytimeFormPageComponent)
  },
  {
    path: 'friend-requests',
    loadComponent: () => import('./features/friend-request/friend-request-table-page/friend-request-table-page.component').then(m => m.FriendRequestTablePageComponent)
  }
];
