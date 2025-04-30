import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonText,
  ToastController,
  IonList,
  IonListHeader,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonCol,
  IonGrid,
  IonIcon, IonFooter } from '@ionic/angular/standalone';
import { BehaviorSubject, filter } from 'rxjs';
import { DBService, PersonProfile } from 'src/app/services/db/db.service';
import { GeodataService } from 'src/app/services/geodata/geodata.service';
import { LocationService } from 'src/app/services/location/location.service';
import { NakshatraService } from 'src/app/services/nakshatra/nakshatra.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [IonFooter, 
    IonIcon,
    IonGrid,
    IonCol,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonListHeader,
    IonList,
    IonText,
    IonButton,
    IonLabel,
    IonItem,
    IonInput,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
  ],
})
export class ProfilePage implements OnInit {
  data!: PersonProfile;
  profiles: PersonProfile[] = [];
  nakshatras: string[] = [];
  notificationsEnabled: boolean = false;
  showLocationRequest: boolean = false;
  location: string = 'Unknown';
  nearestLocation: string = 'Unknown';
  showAddForm = false;
  locationGranted = false;
  version: string = '1.1.9';

  constructor(
    private dbService: DBService,
    private nakshatraService: NakshatraService,
    private locationService: LocationService,
    private notificationService: NotificationService,
    private toastController: ToastController,
    private geoDataService: GeodataService,
    private profileService: ProfileService
  ) {}

  async ngOnInit() {
    this.nakshatras = this.nakshatraService.getAllNakshatras();
    this.data = {
      name: '',
      nakshatra: this.nakshatras[0],
    };
    this.dbService.getNotificationStatus().then((status) => {
      if (status) {
        this.notificationsEnabled = status.enabled;
      }
    });

    this.locationService.getLocation().then(async (location) => {
      if (location) {
        this.location = await this.locationService.getLocationString();
        this.showLocationRequest = false;
        this.locationGranted = true;
        this.geoDataService.ready$
          .pipe(filter((ready) => ready))
          .subscribe(async () => {
            const nearest = await this.geoDataService.nearest(
              location.lat,
              location.lng
            );
            if (nearest) {
              // update the nearest.name to SentenceCase and append with country
              this.nearestLocation =
                nearest.name.charAt(0).toUpperCase() +
                nearest.name.slice(1).toLowerCase() +
                ', ' +
                nearest.country;
            }
          });
      } else {
        this.showLocationRequest = true;
        this.locationGranted = false;
      }
    });

    this.profileService.getAllProfiles().then((profiles) => {
      this.profiles = profiles;
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  resetForm() {
    this.data = {
      name: '',
      nakshatra: this.nakshatras[0],
    };
  }

  async savePerson() {
    if (!this.data.name || !this.data.nakshatra) {
      const toast = await this.toastController.create({
        message: 'Please fill all fields',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    this.profileService.addProfile(this.data).then(async () => {
      const toast = await this.toastController.create({
        message: 'Profile added successfully!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
      this.profiles.push(this.data);
  
      this.resetForm();
      this.showAddForm = false;
    }).catch(async (error) => {
      console.error('Error adding profile:', error);
      const toast = await this.toastController.create({
        message: 'Error adding profile',
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    });
  }

  async deletePerson(index: number, personId: number) {
    await this.profileService.removeProfile(personId);
    this.profiles.splice(index, 1);
    const toast = await this.toastController.create({
      message: 'Profile removed successfully!',
      duration: 2000,
      color: 'success',
    });
    await toast.present();
  }

  async enableNotifications() {
    const token = await this.notificationService.requestPermissionAndGetToken();
    if (token) {
      this.notificationsEnabled = true;
      await this.dbService.saveNotificationStatus(true);

      const toast = await this.toastController.create({
        message: 'Notifications enabled!',
        duration: 2000,
        color: 'success',
      });
      await toast.present();
    } else {
      this.notificationsEnabled = true;
      await this.dbService.saveNotificationStatus(true);

      const toast = await this.toastController.create({
        message: 'Notifications already enabled or permission denied.',
        duration: 2000,
        color: 'medium',
      });
      await toast.present();
    }
  }

  async requestUserLocation() {
    await this.locationService.requestUserLocation(
      async () => {
        this.showLocationRequest = false;
        this.locationGranted = true;
        const toast = await this.toastController.create({
          message: 'Location saved successfully!',
          duration: 2000,
          color: 'success',
        });
        await this.getNearestLocation();
        await toast.present();
      },
      async (err) => {
        console.warn('Location access denied', err);
        const toast = await this.toastController.create({
          message: 'Location access denied',
          duration: 2000,
          color: 'danger',
        });
        await toast.present();
      }
    );
  }

  async getNearestLocation() {
    const location = await this.locationService.getLocation();
    if (location) {
      this.geoDataService
        .nearest(location.lat, location.lng)
        .then((nearest) => {
          if (nearest) {
            this.nearestLocation =
              nearest.name.charAt(0).toUpperCase() +
              nearest.name.slice(1).toLowerCase() +
              ', ' +
              nearest.country;
          }
        });
    }
  }

  onDismiss() {}
}
