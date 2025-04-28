import { Routes } from '@angular/router';
import { HomePage } from './home.page';

export const routes: Routes = [
  {
    path: 'home',
    component: HomePage,
    children: [
      {
        path: 'panchang',
        loadComponent: () =>
          import('../pages/panchangam/panchangam.page').then(
            (m) => m.PanchangamPage
          ),
      },
      {
        path: 'today',
        loadComponent: () =>
          import('../pages/today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'day-table',
        loadComponent: () =>
          import('../pages/day-table/day-table.page').then(
            (m) => m.DayTablePage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'anandadiyogam',
        loadComponent: () =>
          import('../pages/anandadiyogam/anandadiyogam.page').then(
            (m) => m.AnandadiyogamPage
          ),
      },
      {
        path: '',
        redirectTo: '/home/today',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/home/today',
    pathMatch: 'full',
  },
];
