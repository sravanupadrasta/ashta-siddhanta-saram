import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { combineLatest, map, Observable, take } from 'rxjs';
import { PrimaryHealthCenter } from '../models/location';
import { SurveyRecord } from '../models/survey';
import { UserProfile } from '../models/user';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

interface SurveyorSummary {
  profile: UserProfile;
  surveyCount: number;
  divyang: number;
}

interface SupervisorSummary {
  profile: UserProfile;
  phc?: PrimaryHealthCenter;
  surveyCount: number;
  divyang: number;
  surveyors: SurveyorSummary[];
}

@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
  standalone: false,
})
export class TeamPage {
  readonly currentUser$ = this.auth.currentUser$;
  readonly phcs$ = this.data.allPhcs$;
  readonly users$ = this.auth.users$;
  readonly surveys$ = this.data.allSurveys$;

  readonly supervisorSummaries$: Observable<SupervisorSummary[]> = combineLatest([
    this.users$,
    this.surveys$,
    this.phcs$,
  ]).pipe(map(([users, surveys, phcs]) => this.buildSupervisorSummaries(users, surveys, phcs)));

  readonly supervisorSurveyors$: Observable<SurveyorSummary[]> = combineLatest([
    this.currentUser$,
    this.users$,
    this.surveys$,
  ]).pipe(
    map(([user, users, surveys]) => {
      if (!user || user.role !== 'supervisor') {
        return [];
      }
      const team = users.filter((candidate) => candidate.supervisorId === user.id);
      return team.map((surveyor) => ({
        profile: surveyor,
        surveyCount: surveys.filter((survey) => survey.surveyorId === surveyor.id).length,
        divyang: surveys
          .filter((survey) => survey.surveyorId === surveyor.id)
          .reduce((sum, survey) => sum + survey.divyangCount, 0),
      }));
    })
  );

  readonly newSurveyorForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{8,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private auth: AuthService,
    private data: DataService,
    private fb: FormBuilder,
    private toastCtrl: ToastController
  ) {}

  async addSurveyor(): Promise<void> {
    const supervisor = this.auth.currentUser;
    if (!supervisor || supervisor.role !== 'supervisor') {
      return;
    }
    if (this.newSurveyorForm.invalid) {
      this.newSurveyorForm.markAllAsTouched();
      return;
    }
    const password = this.generatePassword();
    const payload = {
      ...this.newSurveyorForm.getRawValue(),
      role: 'surveyor' as const,
      supervisorId: supervisor.id,
      password,
    };
    this.auth.createUser(payload).pipe(take(1)).subscribe(async (user) => {
      await this.presentToast(
        `Surveyor ${user.name} added. Temporary password: ${password}`,
        'success',
        5000
      );
      this.newSurveyorForm.reset();
    });
  }

  trackBySupervisor(_: number, supervisor: SupervisorSummary): string {
    return supervisor.profile.id;
  }

  trackBySurveyor(_: number, surveyor: SurveyorSummary): string {
    return surveyor.profile.id;
  }

  private buildSupervisorSummaries(
    users: UserProfile[],
    surveys: SurveyRecord[],
    phcs: PrimaryHealthCenter[]
  ): SupervisorSummary[] {
    const supervisors = users.filter((user) => user.role === 'supervisor');
    const surveyors = users.filter((user) => user.role === 'surveyor');

    return supervisors.map((supervisor) => {
      const assignedSurveyors = surveyors.filter((surveyor) => surveyor.supervisorId === supervisor.id);
      const supervisorSurveys = surveys.filter((survey) => survey.surveyorId === supervisor.id);
      const teamSurveyorIds = new Set(assignedSurveyors.map((surveyor) => surveyor.id));
      const teamSurveys = surveys.filter((survey) => teamSurveyorIds.has(survey.surveyorId));
      const surveyorsSummary: SurveyorSummary[] = assignedSurveyors.map((surveyor) => {
        const individualSurveys = surveys.filter((survey) => survey.surveyorId === surveyor.id);
        return {
          profile: surveyor,
          surveyCount: individualSurveys.length,
          divyang: individualSurveys.reduce((sum, survey) => sum + survey.divyangCount, 0),
        };
      });

      return {
        profile: supervisor,
        phc: supervisor.phcId ? phcs.find((phc) => phc.id === supervisor.phcId) : undefined,
        surveyCount: supervisorSurveys.length + teamSurveys.length,
        divyang: [...supervisorSurveys, ...teamSurveys].reduce(
          (sum, survey) => sum + survey.divyangCount,
          0
        ),
        surveyors: surveyorsSummary,
      };
    });
  }

  private generatePassword(): string {
    return `Seed@${Math.random().toString(36).slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
  }

  private async presentToast(message: string, color: 'success' | 'primary' = 'primary', duration = 2000) {
    const toast = await this.toastCtrl.create({ message, duration, color });
    await toast.present();
  }
}
