import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../tab1/tab1.module').then((m) => m.Tab1PageModule),
      },
      {
        path: 'my-surveys',
        loadChildren: () => import('../tab2/tab2.module').then((m) => m.Tab2PageModule),
      },
      {
        path: 'new-survey',
        loadChildren: () => import('../tab3/tab3.module').then((m) => m.Tab3PageModule),
      },
      {
        path: 'admin-panel',
        loadChildren: () => import('../admin-panel/admin-panel.module').then((m) => m.AdminPanelPageModule),
      },
      {
        path: 'team',
        loadChildren: () => import('../team/team.module').then((m) => m.TeamPageModule),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
