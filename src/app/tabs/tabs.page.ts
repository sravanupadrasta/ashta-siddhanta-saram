import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '../models/user';
import { AuthService } from '../services/auth.service';

interface TabLink {
  route: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  readonly currentUser$ = this.auth.currentUser$;

  readonly tabs: TabLink[] = [
    { route: 'dashboard', label: 'Dashboard', icon: 'analytics', roles: ['admin', 'supervisor', 'surveyor'] },
    { route: 'my-surveys', label: 'My Surveys', icon: 'clipboard', roles: ['admin', 'supervisor', 'surveyor'] },
    { route: 'new-survey', label: 'New Survey', icon: 'create', roles: ['admin', 'supervisor', 'surveyor'] },
    { route: 'admin-panel', label: 'Admin', icon: 'settings', roles: ['admin'] },
    { route: 'team', label: 'Team', icon: 'people', roles: ['admin', 'supervisor'] },
  ];

  readonly visibleTabs$: Observable<TabLink[]> = this.currentUser$.pipe(
    map((user) => {
      if (!user) {
        return [];
      }
      return this.tabs.filter((tab) => tab.roles.includes(user.role));
    })
  );

  constructor(private auth: AuthService) {}
}
