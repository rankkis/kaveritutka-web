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
    loadComponent: () => import('./features/playground/playground-detail-page/playground-detail-page.component').then(m => m.PlaygroundDetailPageComponent)
  },
  {
    path: 'playground/:id/new-playtime',
    loadComponent: () => import('./features/playtime/playtime-form-page/playtime-form-page.component').then(m => m.PlaytimeFormPageComponent)
  }
];
