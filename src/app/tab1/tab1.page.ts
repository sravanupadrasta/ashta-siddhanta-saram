import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { DistrictConfig, PrimaryHealthCenter } from '../models/location';
import { SurveyRecord } from '../models/survey';
import { DataService, DashboardMetric } from '../services/data.service';
import { AuthService } from '../services/auth.service';

interface DistrictDashboard {
  district?: DistrictConfig;
  phcs: PrimaryHealthCenter[];
  totalDivyang: number;
  totalSurveys: number;
  housesWithDivyang: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  readonly currentUser$ = this.auth.currentUser$;
  readonly metrics$: Observable<DashboardMetric[]> = this.currentUser$.pipe(
    switchMap((user) => (user ? this.data.getDashboardMetrics(user) : of([])))
  );
  readonly recentSurveys$: Observable<SurveyRecord[]> = this.currentUser$.pipe(
    switchMap((user) => (user ? this.data.getSurveysForUser(user) : of([]))),
    map((surveys) => [...surveys].sort((a, b) => (a.surveyDate < b.surveyDate ? 1 : -1)).slice(0, 5))
  );

  readonly districts$ = this.data.allDistricts$;
  readonly villages$ = this.data.allVillages$;
  readonly phcs$ = this.data.allPhcs$;
  private selectedDistrictId$ = new BehaviorSubject<string | null>(null);
  selectedDistrictId: string | null = null;

  readonly districtDashboard$: Observable<DistrictDashboard> = combineLatest([
    this.selectedDistrictId$,
    this.data.allSurveys$,
    this.data.allPhcs$,
    this.data.allDistricts$,
  ]).pipe(
    map(([districtId, surveys, phcs, districts]) => {
      if (!districtId) {
        return { phcs: [], totalDivyang: 0, totalSurveys: 0, housesWithDivyang: 0 };
      }
      const district = districts.find((item) => item.id === districtId);
      const districtPhcs = phcs.filter((phc) => phc.districtId === districtId);
      const districtSurveys = surveys.filter((survey) => survey.districtId === districtId);
      const totalDivyang = districtSurveys.reduce((sum, survey) => sum + survey.divyangCount, 0);
      const housesWithDivyang = new Set(
        districtSurveys.filter((survey) => survey.divyangCount > 0).map((survey) => survey.householdId)
      ).size;
      return {
        district,
        phcs: districtPhcs,
        totalDivyang,
        totalSurveys: districtSurveys.length,
        housesWithDivyang,
      };
    })
  );

  constructor(private auth: AuthService, private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.data.allDistricts$.pipe(take(1)).subscribe((districts) => {
      if (districts.length) {
        this.selectedDistrictId = districts[0].id;
        this.onDistrictChange(districts[0].id);
      }
    });
  }

  onDistrictChange(districtId: string): void {
    this.selectedDistrictId = districtId;
    this.selectedDistrictId$.next(districtId);
  }

  trackByMetric(_: number, metric: DashboardMetric): string {
    return metric.label;
  }

  trackBySurvey(_: number, survey: SurveyRecord): string {
    return survey.id;
  }

  resolveVillageName(villageId: string): string {
    return this.data.getVillageById(villageId)?.name ?? 'Unknown village';
  }

  resolvePhcName(phcId: string): string {
    return this.data.getPhcById(phcId)?.name ?? 'Unknown PHC';
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
