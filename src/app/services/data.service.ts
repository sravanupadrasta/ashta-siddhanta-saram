import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { DistrictConfig, PrimaryHealthCenter, StateConfig, VillageConfig } from '../models/location';
import { SurveyRecord } from '../models/survey';
import { UserProfile } from '../models/user';

export interface DashboardMetric {
  label: string;
  value: number;
  suffix?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private states$ = new BehaviorSubject<StateConfig[]>([
    { id: 'state-tn', name: 'Tamil Nadu' },
    { id: 'state-ap', name: 'Andhra Pradesh' },
  ]);

  private districts$ = new BehaviorSubject<DistrictConfig[]>([
    {
      id: 'dist-chennai',
      name: 'Chennai',
      stateId: 'state-tn',
      population: 7090000,
      villages: 135,
      houses: 1800000,
    },
    {
      id: 'dist-salem',
      name: 'Salem',
      stateId: 'state-tn',
      population: 3482056,
      villages: 385,
      houses: 920000,
    },
  ]);

  private phcs$ = new BehaviorSubject<PrimaryHealthCenter[]>([
    {
      id: 'phc-adyar',
      name: 'Adyar PHC',
      address: 'Adyar, Chennai',
      districtId: 'dist-chennai',
      stateId: 'state-tn',
      estimatedHouses: 45000,
      estimatedPopulation: 140000,
    },
    {
      id: 'phc-salem-town',
      name: 'Salem Town PHC',
      address: 'Salem Town, Salem',
      districtId: 'dist-salem',
      stateId: 'state-tn',
      estimatedHouses: 52000,
      estimatedPopulation: 165000,
    },
  ]);

  private villages$ = new BehaviorSubject<VillageConfig[]>([
    {
      id: 'village-besant-nagar',
      name: 'Besant Nagar',
      phcId: 'phc-adyar',
      districtId: 'dist-chennai',
      stateId: 'state-tn',
    },
    {
      id: 'village-thiruvanmiyur',
      name: 'Thiruvanmiyur',
      phcId: 'phc-adyar',
      districtId: 'dist-chennai',
      stateId: 'state-tn',
    },
    {
      id: 'village-salem-old',
      name: 'Salem Old Town',
      phcId: 'phc-salem-town',
      districtId: 'dist-salem',
      stateId: 'state-tn',
    },
  ]);

  private surveys$ = new BehaviorSubject<SurveyRecord[]>([
    {
      id: 'survey-1',
      villageId: 'village-besant-nagar',
      phcId: 'phc-adyar',
      districtId: 'dist-chennai',
      stateId: 'state-tn',
      locationType: 'House',
      personName: 'Sundari Devi',
      wardNo: '21',
      pincode: '600020',
      phone: '+91-9800000001',
      surveyorId: 'surveyor-sample',
      surveyDate: new Date().toISOString(),
      divyangCount: 1,
      householdId: 'HH-0001',
    },
    {
      id: 'survey-2',
      villageId: 'village-thiruvanmiyur',
      phcId: 'phc-adyar',
      districtId: 'dist-chennai',
      stateId: 'state-tn',
      locationType: 'House',
      personName: 'Arjun',
      wardNo: '32',
      pincode: '600041',
      phone: '+91-9800000002',
      surveyorId: 'surveyor-sample',
      surveyDate: new Date().toISOString(),
      divyangCount: 2,
      householdId: 'HH-0002',
    },
  ]);

  readonly allStates$ = this.states$.asObservable();
  readonly allDistricts$ = this.districts$.asObservable();
  readonly allPhcs$ = this.phcs$.asObservable();
  readonly allVillages$ = this.villages$.asObservable();
  readonly allSurveys$ = this.surveys$.asObservable();

  addState(state: StateConfig): void {
    this.states$.next([...this.states$.value, state]);
  }

  addDistrict(district: DistrictConfig): void {
    this.districts$.next([...this.districts$.value, district]);
  }

  addPhc(phc: PrimaryHealthCenter): void {
    this.phcs$.next([...this.phcs$.value, phc]);
  }

  addVillage(village: VillageConfig): void {
    this.villages$.next([...this.villages$.value, village]);
  }

  addSurvey(record: SurveyRecord): void {
    this.surveys$.next([
      { ...record, id: record.id || `survey-${Date.now()}` },
      ...this.surveys$.value,
    ]);
  }

  getDistrictById(id: string): DistrictConfig | undefined {
    return this.districts$.value.find((district) => district.id === id);
  }

  getVillageById(id: string): VillageConfig | undefined {
    return this.villages$.value.find((village) => village.id === id);
  }

  getPhcById(id: string): PrimaryHealthCenter | undefined {
    return this.phcs$.value.find((phc) => phc.id === id);
  }

  getSurveysForUser(user: UserProfile): Observable<SurveyRecord[]> {
    return this.allSurveys$.pipe(
      map((surveys) => {
        if (user.role === 'admin') {
          return surveys;
        }
        if (user.role === 'supervisor') {
          return surveys.filter((survey) => survey.phcId === user.phcId);
        }
        return surveys.filter((survey) => survey.surveyorId === user.id);
      })
    );
  }

  getDashboardMetrics(user: UserProfile): Observable<DashboardMetric[]> {
    return combineLatest([this.getSurveysForUser(user), this.allDistricts$, this.allPhcs$]).pipe(
      map(([surveys, districts, phcs]) => {
        const today = new Date().toISOString().slice(0, 10);
        const todayCount = surveys.filter((survey) => survey.surveyDate.slice(0, 10) === today).length;
        const totalDivyang = surveys.reduce((sum, survey) => sum + survey.divyangCount, 0);
        const housesWithDivyang = new Set(
          surveys.filter((survey) => survey.divyangCount > 0).map((survey) => survey.householdId)
        ).size;

        if (user.role === 'admin') {
          return [
            {
              label: 'Total Surveys Completed',
              value: surveys.length,
            },
            {
              label: 'Surveys Completed Today',
              value: todayCount,
            },
            {
              label: 'Divyang Identified',
              value: totalDivyang,
            },
            {
              label: 'Houses with Divyang',
              value: housesWithDivyang,
            },
            {
              label: 'Total Districts Enabled',
              value: districts.length,
            },
            {
              label: 'Primary Health Centres Onboarded',
              value: phcs.length,
            },
          ];
        }

        if (user.role === 'supervisor') {
          const associatedSurveyors = new Set(
            surveys.filter((survey) => survey.surveyorId !== user.id).map((survey) => survey.surveyorId)
          ).size;
          return [
            {
              label: 'Surveys Today',
              value: todayCount,
            },
            {
              label: 'Total Surveys',
              value: surveys.length,
            },
            {
              label: 'Divyang Identified',
              value: totalDivyang,
            },
            {
              label: 'Surveyors Reporting',
              value: associatedSurveyors,
            },
          ];
        }

        return [
          {
            label: 'Surveys Today',
            value: todayCount,
          },
          {
            label: 'Total Surveys',
            value: surveys.length,
          },
          {
            label: 'Divyang Identified',
            value: totalDivyang,
          },
        ];
      })
    );
  }
}
