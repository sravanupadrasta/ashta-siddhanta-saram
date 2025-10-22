import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { DistrictConfig, PrimaryHealthCenter } from '../models/location';
import { SurveyRecord } from '../models/survey';
import { UserProfile } from '../models/user';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

interface SurveySummary {
  housesTarget: number;
  housesSurveyed: number;
  housesPending: number;
  divyangTotal: number;
  surveysToday: number;
  progress: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  readonly currentUser$ = this.auth.currentUser$;
  readonly districts$ = this.data.allDistricts$;
  readonly phcs$ = this.data.allPhcs$;
  readonly villages$ = this.data.allVillages$;

  private selectedDistrictId$ = new BehaviorSubject<string | null>(null);
  private selectedPhcId$ = new BehaviorSubject<string | 'all' | null>('all');

  readonly filteredSurveys$: Observable<SurveyRecord[]> = combineLatest([
    this.currentUser$,
    this.data.allSurveys$,
    this.selectedDistrictId$,
    this.selectedPhcId$,
  ]).pipe(
    map(([user, surveys, districtId, phcId]) => this.filterSurveys(user, surveys, districtId, phcId))
  );

  readonly summary$: Observable<SurveySummary> = combineLatest([
    this.filteredSurveys$,
    this.currentUser$,
    this.selectedDistrictId$,
    this.selectedPhcId$,
    this.districts$,
    this.phcs$,
  ]).pipe(map((value) => this.calculateSummary(...value)));

  selectedDistrictId: string | null = null;
  selectedPhcId: string | 'all' | null = 'all';

  constructor(
    private auth: AuthService,
    private data: DataService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit(): void {
    this.currentUser$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        return;
      }
      if (user.role === 'admin') {
        this.districts$.pipe(take(1)).subscribe((districts) => {
          if (districts.length) {
            this.selectedDistrictId = districts[0].id;
            this.selectedPhcId = 'all';
            this.selectedDistrictId$.next(districts[0].id);
            this.selectedPhcId$.next('all');
          }
        });
      } else if (user.role === 'supervisor' && user.phcId) {
        const phc = this.data.getPhcById(user.phcId);
        this.selectedPhcId = user.phcId;
        this.selectedPhcId$.next(user.phcId);
        this.selectedDistrictId = phc?.districtId ?? null;
        this.selectedDistrictId$.next(this.selectedDistrictId);
      } else {
        this.selectedDistrictId$.next(null);
        this.selectedPhcId$.next(null);
      }
    });
  }

  onDistrictChange(districtId: string): void {
    this.selectedDistrictId = districtId;
    this.selectedDistrictId$.next(districtId);
    this.selectedPhcId = 'all';
    this.selectedPhcId$.next('all');
  }

  onPhcChange(phcId: string | 'all'): void {
    this.selectedPhcId = phcId;
    this.selectedPhcId$.next(phcId);
  }

  async openSurveyDetail(survey: SurveyRecord): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: survey.personName,
      subHeader: `Survey ID ${survey.id}`,
      message: `
        <p><strong>Village:</strong> ${this.data.getVillageById(survey.villageId)?.name ?? 'Unknown'}</p>
        <p><strong>PHC:</strong> ${this.data.getPhcById(survey.phcId)?.name ?? 'Unknown'}</p>
        <p><strong>Location:</strong> ${survey.locationType}</p>
        <p><strong>Ward:</strong> ${survey.wardNo}</p>
        <p><strong>Pincode:</strong> ${survey.pincode}</p>
        <p><strong>Phone:</strong> ${survey.phone}</p>
        <p><strong>Divyang in household:</strong> ${survey.divyangCount}</p>
      `,
      buttons: ['Close'],
    });
    await alert.present();
  }

  resolveVillageName(id: string): string {
    return this.data.getVillageById(id)?.name ?? 'Unknown village';
  }

  resolvePhcName(id: string): string {
    return this.data.getPhcById(id)?.name ?? 'Unknown PHC';
  }

  resolveDistrictName(id?: string | null): string {
    if (!id) {
      return 'All districts';
    }
    return this.data.getDistrictById(id)?.name ?? 'Unknown district';
  }

  trackBySurvey(_: number, survey: SurveyRecord): string {
    return survey.id;
  }

  surveysWithDivyang(surveys: SurveyRecord[]): SurveyRecord[] {
    return surveys.filter((survey) => survey.divyangCount > 0);
  }

  private filterSurveys(
    user: UserProfile | null,
    surveys: SurveyRecord[],
    districtId: string | null,
    phcId: string | 'all' | null
  ): SurveyRecord[] {
    if (!user) {
      return [];
    }
    if (user.role === 'admin') {
      return surveys.filter((survey) => {
        const districtMatch = !districtId || survey.districtId === districtId;
        const phcMatch = !phcId || phcId === 'all' || survey.phcId === phcId;
        return districtMatch && phcMatch;
      });
    }
    if (user.role === 'supervisor') {
      return surveys.filter((survey) => survey.phcId === user.phcId);
    }
    return surveys.filter((survey) => survey.surveyorId === user.id);
  }

  private calculateSummary(
    surveys: SurveyRecord[],
    user: UserProfile | null,
    districtId: string | null,
    phcId: string | 'all' | null,
    districts: DistrictConfig[],
    phcs: PrimaryHealthCenter[]
  ): SurveySummary {
    const uniqueHouseholds = new Set(surveys.map((survey) => survey.householdId));
    const housesSurveyed = uniqueHouseholds.size;
    const today = new Date().toISOString().slice(0, 10);
    const surveysToday = surveys.filter((survey) => survey.surveyDate.slice(0, 10) === today).length;
    const divyangTotal = surveys.reduce((sum, survey) => sum + survey.divyangCount, 0);

    let housesTarget = housesSurveyed;
    if (user?.role === 'admin' && districtId) {
      const district = districts.find((item) => item.id === districtId);
      housesTarget = district?.houses ?? housesSurveyed;
    } else if (user?.role === 'supervisor' && user.phcId) {
      const phc = phcs.find((item) => item.id === user.phcId);
      housesTarget = phc?.estimatedHouses ?? housesSurveyed;
    }

    if (housesTarget === 0) {
      housesTarget = housesSurveyed;
    }

    const housesPending = Math.max(housesTarget - housesSurveyed, 0);
    const progress = housesTarget ? Math.min(housesSurveyed / housesTarget, 1) : 1;

    return {
      housesTarget,
      housesSurveyed,
      housesPending,
      divyangTotal,
      surveysToday,
      progress,
    };
  }
}
