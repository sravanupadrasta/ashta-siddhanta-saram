import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  IonIcon,
} from '@ionic/angular/standalone';
import { filter } from 'rxjs';
import { DBService, PersonProfile } from 'src/app/services/db/db.service';
import { GeodataService } from 'src/app/services/geodata/geodata.service';
import { LocationService } from 'src/app/services/location/location.service';
import { NakshatraService } from 'src/app/services/nakshatra/nakshatra.service';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
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
    IonInput,
    IonLabel,
    IonItem,
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

  constructor(
    private dbService: DBService,
    private nakshatraService: NakshatraService,
    private locationService: LocationService,
    private notificationService: NotificationService,
    private toastController: ToastController,
    private geoDataService: GeodataService
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
      }
    });

    this.dbService.getAllProfiles().then((profiles) => {
      this.profiles = profiles;
    });

    // subscribe to geo data service with the updated location and find the nearest location
    // subscribe to locationString in location service and update the location and find the nearest location
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

    await this.dbService.addProfile(this.data);
    const toast = await this.toastController.create({
      message: 'Profile added successfully!',
      duration: 2000,
      color: 'success',
    });

    await toast.present();
    this.profiles.push(this.data);

    this.resetForm();
    this.showAddForm = false;
  }

  async deletePerson(index: number, personId: number) {
    await this.dbService.removeProfile(personId);
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
