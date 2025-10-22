import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { DistrictConfig, PrimaryHealthCenter, StateConfig, VillageConfig } from '../models/location';
import { UserProfile, UserRole } from '../models/user';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 6)}-${Date.now().toString(36).slice(-4)}`;
}

function generatePassword(): string {
  return `Seed@${Math.random().toString(36).slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.page.html',
  styleUrls: ['./admin-panel.page.scss'],
  standalone: false,
})
export class AdminPanelPage {
  readonly states$ = this.data.allStates$;
  readonly districts$ = this.data.allDistricts$;
  readonly phcs$ = this.data.allPhcs$;
  supervisors: UserProfile[] = [];

  readonly stateForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  readonly districtForm = this.fb.nonNullable.group({
    stateId: ['', Validators.required],
    name: ['', Validators.required],
    population: [0, [Validators.required, Validators.min(0)]],
    villages: [0, [Validators.required, Validators.min(0)]],
    houses: [0, [Validators.required, Validators.min(0)]],
  });

  readonly phcForm = this.fb.nonNullable.group({
    stateId: ['', Validators.required],
    districtId: ['', Validators.required],
    name: ['', Validators.required],
    address: ['', Validators.required],
    estimatedHouses: [0, [Validators.required, Validators.min(0)]],
    estimatedPopulation: [0, [Validators.required, Validators.min(0)]],
  });

  readonly villageForm = this.fb.nonNullable.group({
    stateId: ['', Validators.required],
    districtId: ['', Validators.required],
    phcId: ['', Validators.required],
    name: ['', Validators.required],
  });

  readonly userForm = this.fb.nonNullable.group({
    role: ['supervisor' as UserRole, Validators.required],
    name: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{8,15}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phcId: [''],
    supervisorId: [''],
  });

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private auth: AuthService,
    private toastCtrl: ToastController
  ) {
    this.refreshSupervisors();
    this.userForm.controls.role.valueChanges.subscribe((role) => {
      const phcControl = this.userForm.controls.phcId;
      const supervisorControl = this.userForm.controls.supervisorId;
      if (role === 'supervisor') {
        phcControl.setValidators([Validators.required]);
        supervisorControl.clearValidators();
        supervisorControl.setValue('');
      } else {
        supervisorControl.setValidators([Validators.required]);
        phcControl.clearValidators();
        phcControl.setValue('');
      }
      phcControl.updateValueAndValidity();
      supervisorControl.updateValueAndValidity();
    });
  }

  async addState(): Promise<void> {
    if (this.stateForm.invalid) {
      this.stateForm.markAllAsTouched();
      return;
    }
    const state: StateConfig = { id: generateId('state'), name: this.stateForm.value.name ?? '' };
    this.data.addState(state);
    await this.presentToast(`Added state ${state.name}`);
    this.stateForm.reset();
  }

  async addDistrict(): Promise<void> {
    if (this.districtForm.invalid) {
      this.districtForm.markAllAsTouched();
      return;
    }
    const { stateId, name, population, villages, houses } = this.districtForm.getRawValue();
    const district: DistrictConfig = {
      id: generateId('district'),
      stateId,
      name,
      population,
      villages,
      houses,
    };
    this.data.addDistrict(district);
    await this.presentToast(`District ${name} added successfully`);
    this.districtForm.reset({ stateId: '' });
  }

  async addPhc(): Promise<void> {
    if (this.phcForm.invalid) {
      this.phcForm.markAllAsTouched();
      return;
    }
    const value = this.phcForm.getRawValue();
    const phc: PrimaryHealthCenter = {
      id: generateId('phc'),
      name: value.name,
      address: value.address,
      districtId: value.districtId,
      stateId: value.stateId,
      estimatedHouses: value.estimatedHouses,
      estimatedPopulation: value.estimatedPopulation,
    };
    this.data.addPhc(phc);
    await this.presentToast(`PHC ${value.name} added`);
    this.phcForm.reset({ stateId: '', districtId: '' });
  }

  async addVillage(): Promise<void> {
    if (this.villageForm.invalid) {
      this.villageForm.markAllAsTouched();
      return;
    }
    const value = this.villageForm.getRawValue();
    const village: VillageConfig = {
      id: generateId('village'),
      name: value.name,
      phcId: value.phcId,
      districtId: value.districtId,
      stateId: value.stateId,
    };
    this.data.addVillage(village);
    await this.presentToast(`Village ${value.name} added`);
    this.villageForm.reset({ stateId: '', districtId: '', phcId: '' });
  }

  async createUser(): Promise<void> {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const value = this.userForm.getRawValue();
    const password = generatePassword();
    const payload = {
      name: value.name,
      address: value.address,
      phone: value.phone,
      email: value.email,
      role: value.role,
      password,
      phcId: value.role === 'supervisor' ? value.phcId : undefined,
      supervisorId: value.role === 'surveyor' ? value.supervisorId : undefined,
    };

    this.auth.createUser(payload).pipe(take(1)).subscribe(async (user) => {
      await this.presentToast(
        `Created ${user.role} account for ${user.name}. Temporary password: ${password}`,
        'success',
        5000
      );
      this.userForm.reset({ role: 'supervisor' });
      if (user.role === 'supervisor') {
        this.refreshSupervisors();
      }
    });
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'primary' = 'primary', duration = 2000) {
    const toast = await this.toastCtrl.create({ message, duration, color });
    await toast.present();
  }

  private refreshSupervisors(): void {
    this.supervisors = this.auth.findUsersByRole('supervisor');
  }
}
