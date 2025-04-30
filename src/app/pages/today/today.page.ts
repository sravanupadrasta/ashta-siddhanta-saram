import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
} from '@ionic/angular/standalone';
import { NakshatraComponent } from 'src/app/components/nakshatra/nakshatra.component';
import {
  AshtaRecord,
  AshtaSiddhantaService,
} from 'src/app/services/ashta-siddhanta/ashta-siddhanta.service';
import { DBService } from 'src/app/services/db/db.service';
import { LocationService } from 'src/app/services/location/location.service';
import { NotificationService } from 'src/app/services/notification/notification.service';
import { SunriseService } from 'src/app/services/sunrise/sunrise.service';
import { ThidhiService } from 'src/app/services/thidhi/thidhi.service';
import { Helper } from 'src/app/utils/helper';

@Component({
  selector: 'app-today',
  templateUrl: './today.page.html',
  styleUrls: ['./today.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonText,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonCol,
    IonRow,
    IonGrid,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    NakshatraComponent,
    CommonModule,
  ],
})
export class TodayPage implements OnInit {
  locationString: string = 'Unknown';
  currentSunrise: string = '';
  currentTime: string = '';
  currentSegment: any = null;
  adjustedSegmentsCurrent: any[] = [];
  minutesLeft: number = 0;
  currentThidhiName = '';
  currentThidhiStart = '';
  currentThidhiEnd = '';
  nextThidhiName = '';
  nextThidhiEnd = '';
  notificationsEnabled: boolean = false;
  showLocationRequest: boolean = false;
  offsetMinutesCurrent: number = 0;
  rawData: AshtaRecord[] = [];
  private clockInterval: any;
  locationGranted = false;

  constructor(
    private ashtaService: AshtaSiddhantaService,
    private thidhiService: ThidhiService,
    private notificationService: NotificationService,
    private dbService: DBService,
    private toastController: ToastController,
    private sunriseService: SunriseService,
    private locationServcie: LocationService
  ) {}

  async ngOnInit() {
    // Update current time every second and recompute current segment
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();

    this.locationServcie.getLocation();

    this.locationServcie.locationUpdated$.subscribe(async (location) => {
      if(location) {
        const sunrise = await this.sunriseService.getSunriseAll(new Date(), { coordinate: { lat: location.lat, lng: location.lng } });
        this.currentSunrise = sunrise.sunriseTimeString;
        this.offsetMinutesCurrent = sunrise.offset;
        this.locationString = await this.locationServcie.getLocationString();
        this.locationGranted = true;
        this.showLocationRequest = false;
        await this.loadCurrentDaySegments();
      } else {
        this.showLocationRequest = true;
        this.locationGranted = false;
      }
    });

    if(!location) {
      this.showLocationRequest = true;
      this.locationGranted = false;
    }

    this.clockInterval = setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString();
      this.computeCurrentSegment();
    }, 10000);

    const notificationStatus = await this.dbService.getNotificationStatus();

    if (notificationStatus?.enabled) {
      this.notificationsEnabled = true;
    }

    // Get user location and load JSON data
    // this.getUserLocation();
    this.ashtaService.getData().subscribe((data) => {
      this.rawData = data;
      // If no sunrise computed yet, use fallback—but this will soon be overwritten by getUserLocation
      if (!this.currentSunrise) {
        this.currentSunrise = '07:00:00';
        this.offsetMinutesCurrent = Helper.computeOffset(
          this.currentSunrise,
          '06:00:00'
        );
      }

      this.loadCurrentDaySegments();
      this.computeCurrentSegment();
    });

    const { current, next } = this.thidhiService.getCurrentAndNextThidhi(
      new Date()
    );

    this.currentThidhiName = `${current.phase} Paksha - ${current.thidhi}`;
    this.currentThidhiStart = current.start.toLocaleString();
    this.currentThidhiEnd = current.end.toLocaleString();

    this.nextThidhiName = `${next.phase} Paksha - ${next.thidhi}`;
    this.nextThidhiEnd = next.end.toLocaleString();

    const savedFlag = localStorage.getItem('notificationsEnabled');
    if (savedFlag === 'true') {
      this.notificationsEnabled = true;
    }
  }

  computeCurrentSegment() {
    // If no segments available, set currentSegment to null and minutesLeft to 0
    if (
      !this.adjustedSegmentsCurrent ||
      this.adjustedSegmentsCurrent.length === 0
    ) {
      this.currentSegment = null;
      this.minutesLeft = 0;
      return;
    }
    const now = new Date();
    // Use the cycle's sunrise (already computed in currentSunrise)
    const cycleSunrise = Helper.parseTime(this.currentSunrise);
    cycleSunrise.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    // If now is before the cycle's sunrise, then current cycle is from yesterday
    if (now < cycleSunrise) {
      cycleSunrise.setDate(cycleSunrise.getDate() - 1);
    }
    // compute minutes since day start
    let diff = now.getHours() * 60 + now.getMinutes(); // minutes since cycle sunrise
    let found = null;
    for (const seg of this.adjustedSegmentsCurrent) {
      const segStart = Helper.timeToMinutes(seg.adjustedStart);
      const segEnd = Helper.timeToMinutes(seg.adjustedEnd);
      if (diff >= segStart && diff < segEnd) {
        found = seg;
        this.minutesLeft = Math.floor(segEnd - diff);
        break;
      }
    }
    this.currentSegment = found;
    if (!found) {
      this.minutesLeft = 0;
    }
  }

  async loadCurrentDaySegments() {
    if (!this.rawData.length) {
      return;
    }
    const now = new Date();
    const { lat, lng } = Helper.getLatLng(this.locationString);

    try {
      let sunriseDate = await this.sunriseService.getSunrise(now, {
        coordinate: { lat, lng },
      });

      // If current time is before today's sunrise, then use yesterday's sunrise.
      if (now < sunriseDate) {
        let yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        sunriseDate = await this.sunriseService.getSunrise(yesterday, {
          coordinate: { lat, lng },
        });
      }

      this.currentSunrise = Helper.formatTime(sunriseDate);
      this.offsetMinutesCurrent =
        await this.sunriseService.getSunriseOffsetMinutes(sunriseDate);

      // Use the weekday of the cycle's sunrise (not necessarily today)
      const cycleWeekday = Helper.getWeekday(sunriseDate);
      const segments12h = this.rawData.filter(
        (rec) => rec.DayOfWeek === cycleWeekday
      );
      segments12h.sort((a, b) => Helper.compareTime(a.StartTime, b.StartTime));

      const firstHalf = segments12h.map((rec) => ({
        adjustedStart: Helper.addOffset(
          rec.StartTime,
          this.offsetMinutesCurrent
        ),
        adjustedEnd: Helper.addOffset(rec.EndTime, this.offsetMinutesCurrent),
        Result: rec.Result,
        Status: rec.Status,
      }));
      const secondHalf = segments12h.map((rec) => ({
        adjustedStart: Helper.addOffset(
          rec.StartTime,
          this.offsetMinutesCurrent + 720
        ),
        adjustedEnd: Helper.addOffset(
          rec.EndTime,
          this.offsetMinutesCurrent + 720
        ),
        Result: rec.Result,
        Status: rec.Status,
      }));
      this.adjustedSegmentsCurrent = [...firstHalf, ...secondHalf];
      this.computeCurrentSegment();
    } catch (error) {
      console.error('Error loading segments:', error);
      const toast = await this.toastController.create({
        message: 'Error loading segments',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  async requestUserLocation() {
    await this.locationServcie.requestUserLocation(
      async () => {
        this.showLocationRequest = false;
        this.locationGranted = true;
        await this.loadCurrentDaySegments();
        // this.loadDailySegments(new Date(this.selectedDate));
        const toast = await this.toastController.create({
          message: 'Location saved successfully!',
          duration: 2000,
          color: 'success',
        });
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

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }
}
