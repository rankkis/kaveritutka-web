import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map/map.component').then(m => m.MapComponent)
  },
  {
    path: 'playground/:id',
    loadComponent: () => import('./features/playground-detail/playground-detail.component').then(m => m.PlaygroundDetailComponent)
  },
  {
    path: 'playground/:id/new-checkin',
    loadComponent: () => import('./features/check-in-form-page/check-in-form-page.component').then(m => m.CheckInFormPageComponent)
  }
];
