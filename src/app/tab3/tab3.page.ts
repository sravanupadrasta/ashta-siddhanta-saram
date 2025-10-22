import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { combineLatest, map } from 'rxjs';
import { VillageConfig } from '../models/location';
import { SurveyRecord } from '../models/survey';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  readonly currentUser$ = this.auth.currentUser$;
  readonly villages$ = combineLatest([this.currentUser$, this.data.allVillages$]).pipe(
    map(([user, villages]) => {
      if (!user) {
        return [] as VillageConfig[];
      }
      if (user.role === 'supervisor' && user.phcId) {
        return villages.filter((village) => village.phcId === user.phcId);
      }
      if (user.role === 'surveyor' && user.supervisorId) {
        const supervisor = this.auth.getUserById(user.supervisorId);
        if (supervisor?.phcId) {
          return villages.filter((village) => village.phcId === supervisor.phcId);
        }
      }
      return villages;
    })
  );

  readonly form = this.fb.nonNullable.group({
    villageId: ['', Validators.required],
    locationType: ['House', Validators.required],
    personName: ['', [Validators.required, Validators.minLength(3)]],
    wardNo: ['', Validators.required],
    pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{8,15}$/)]],
    householdId: ['', Validators.required],
    divyangCount: [1, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private data: DataService,
    private toastCtrl: ToastController
  ) {}

  async onSubmit(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }

    if (user.role === 'admin') {
      const toast = await this.toastCtrl.create({
        message: 'Only supervisors and surveyors can submit survey data.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const village = this.data.getVillageById(formValue.villageId);
    const phcId = village?.phcId ?? user.phcId ?? '';
    const phc = phcId ? this.data.getPhcById(phcId) : undefined;
    const districtId = phc?.districtId ?? village?.districtId ?? '';
    const stateId = phc?.stateId ?? village?.stateId ?? '';

    const record: SurveyRecord = {
      id: '',
      villageId: formValue.villageId,
      phcId,
      districtId,
      stateId,
      locationType: formValue.locationType as SurveyRecord['locationType'],
      personName: formValue.personName,
      wardNo: formValue.wardNo,
      pincode: formValue.pincode,
      phone: formValue.phone,
      householdId: formValue.householdId,
      divyangCount: formValue.divyangCount,
      surveyorId: user.id,
      surveyDate: new Date().toISOString(),
    };

    this.data.addSurvey(record);

    const toast = await this.toastCtrl.create({
      message: 'Survey saved successfully.',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
    this.form.reset({
      villageId: formValue.villageId,
      locationType: 'House',
      divyangCount: 1,
    });
  }
}
