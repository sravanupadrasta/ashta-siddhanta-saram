import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonLabel,
  IonIcon, IonTabs, IonTabBar, IonTabButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonTabButton, IonTabBar, IonTabs, IonIcon, IonLabel, CommonModule ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  // selectedTab: string = 'current';

  // // Data from JSON
  // rawData: AshtaRecord[] = [];
  // // For current tab (for the current cycle)
  // adjustedSegmentsCurrent: any[] = [];
  // // For daily table tab (for selected date)
  // adjustedSegmentsDaily: any[] = [];

  // // Current segment info (current tab)
  // currentSegment: any = null;
  // minutesLeft: number = 0; // minutes remaining in current segment

  // // Sunrise info for current tab (the cycle's sunrise)
  // currentSunrise: string = ''; // "HH:mm:ss" computed for the cycle’s sunrise
  // offsetMinutesCurrent: number = 0; // difference from base 06:00:00

  // // For location
  // locationString: string = 'Unknown';

  // // For daily table date selection
  // selectedDate: string = new Date().toISOString(); // default to today
  // showCalendar: boolean = false; // calendar hidden by default

  // // Live clock
  // currentTime: string = '';

  // loading: boolean = false;

  // cities: any[] = [];
  // // List of filtered cities based on user input.
  // filteredLocations: any[] = [];
  // // Currently selected city.
  // selectedLocation: any = null;
  // // Text entered in the searchbar.
  // searchText = '';
  // // Toggle dropdown visibility.
  // showDropdown = false;

  // currentTithiName = '';
  // currentTithiStart = '';
  // currentTithiEnd = '';
  // nextTithiName = '';
  // nextTithiEnd = '';

  // notificationsEnabled: boolean = false;
  // showLocationRequest: boolean = false;
  // private clockInterval: any;

  // constructor(
  //   private ashtaService: AshtaSiddhantaService,
  //   private thidhiService: ThidhiService,
  //   private loadingController: LoadingController,
  //   private notificationService: NotificationService,
  //   private dbService: DBService,
  //   private toastController: ToastController,
  //   private http: HttpClient
  // ) {}

  // async ngOnInit() {
  //   // Update current time every second and recompute current segment
  //   const now = new Date();
  //   this.currentTime = now.toLocaleTimeString();
  //   this.clockInterval = setInterval(() => {
  //     const now = new Date();
  //     this.currentTime = now.toLocaleTimeString();
  //     this.computeCurrentSegment();
  //   }, 30000);

  //   const location = await this.dbService.getLocation();
  //   const notificationStatus = await this.dbService.getNotificationStatus();

  //   if (notificationStatus?.enabled) {
  //     this.notificationsEnabled = true;
  //   }

  //   if (location) {
  //     this.locationString = `Lat: ${location.lat.toFixed(
  //       4
  //     )}, Lng: ${location.lng.toFixed(4)}`;
  //     this.loadCurrentDaySegments();
  //     this.loadDailySegments(new Date(this.selectedDate));
  //   } else {
  //     this.showLocationRequest = true;
  //   }
  //   // Get user location and load JSON data
  //   // this.getUserLocation();
  //   this.ashtaService.getData().subscribe((data) => {
  //     this.rawData = data;
  //     // If no sunrise computed yet, use fallback—but this will soon be overwritten by getUserLocation
  //     if (!this.currentSunrise) {
  //       this.currentSunrise = '07:00:00';
  //       this.offsetMinutesCurrent = this.computeOffset(
  //         this.currentSunrise,
  //         '06:00:00'
  //       );
  //     }
  //   });

  //   this.http.get<any[]>('assets/static-data/geodata.min.json').subscribe(
  //     (data) => {
  //       this.cities = data;
  //     },
  //     (error) => {
  //       console.error('Error loading cities data:', error);
  //     }
  //   );

  //   const { current, next } = this.thidhiService.getCurrentAndNextThidhi(
  //     new Date()
  //   );

  //   this.currentTithiName = `${current.phase} Paksha - ${current.thidhi}`;
  //   this.currentTithiStart = current.start.toLocaleString();
  //   this.currentTithiEnd = current.end.toLocaleString();

  //   this.nextTithiName = `${next.phase} Paksha - ${next.thidhi}`;
  //   this.nextTithiEnd = next.end.toLocaleString();

  //   const savedFlag = localStorage.getItem('notificationsEnabled');
  //   if (savedFlag === 'true') {
  //     this.notificationsEnabled = true;
  //   }
  // }

  // async requestUserLocation() {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         const lat = pos.coords.latitude;
  //         const lng = pos.coords.longitude;
  //         await this.dbService.saveLocation(lat, lng);
  //         this.locationString = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(
  //           4
  //         )}`;
  //         this.showLocationRequest = false;
  //         this.loadCurrentDaySegments();
  //         this.loadDailySegments(new Date(this.selectedDate));

  //         const toast = await this.toastController.create({
  //           message: 'Location saved successfully!',
  //           duration: 2000,
  //           color: 'success',
  //         });
  //         await toast.present();
  //       },
  //       async (err) => {
  //         console.warn('Location access denied', err);
  //         const toast = await this.toastController.create({
  //           message: 'Location permission denied.',
  //           duration: 2000,
  //           color: 'danger',
  //         });
  //         await toast.present();
  //       }
  //     );
  //   } else {
  //     const toast = await this.toastController.create({
  //       message: 'Geolocation not supported on this device.',
  //       duration: 2000,
  //       color: 'danger',
  //     });
  //     await toast.present();
  //   }
  // }

  // async enableNotifications() {
  //   const token = await this.notificationService.requestPermissionAndGetToken();
  //   if (token) {
  //     this.notificationsEnabled = true;
  //     await this.dbService.saveNotificationStatus(true);

  //     const toast = await this.toastController.create({
  //       message: 'Notifications enabled!',
  //       duration: 2000,
  //       color: 'success',
  //     });
  //     await toast.present();
  //   } else {
  //     this.notificationsEnabled = true;
  //     await this.dbService.saveNotificationStatus(true);

  //     const toast = await this.toastController.create({
  //       message: 'Notifications already enabled or permission denied.',
  //       duration: 2000,
  //       color: 'medium',
  //     });
  //     await toast.present();
  //   }
  // }

  // ngOnDestroy() {
  //   if (this.clockInterval) {
  //     clearInterval(this.clockInterval);
  //   }
  // }

  // /**
  //  * doRefresh() reloads the location and recalculates all segments.
  //  * It can be triggered by either the refresh button or pull-to-refresh.
  //  */
  // doRefresh(event?: any) {
  //   // Refresh user location and then reload the segments.
  //   if (event) {
  //     event.detail.complete();
  //   }
  // }

  // // Toggle calendar display in Daily Table tab
  // toggleCalendar() {
  //   this.showCalendar = !this.showCalendar;
  // }

  // // Called when a new date is picked in Daily Table tab
  // onDateChange(event: any) {
  //   if (!event.detail.value) {
  //     return;
  //   }
  //   this.selectedDate = event.detail.value;
  //   const chosenDate = new Date(this.selectedDate);
  //   this.loadDailySegments(chosenDate);
  // }

  // toggleDropdown() {
  //   this.showDropdown = !this.showDropdown;
  //   if (this.showDropdown) {
  //     this.searchText = '';
  //     this.filteredLocations = [];
  //   }
  // }

  // updateFilteredLocations(event: any) {
  //   this.searchText = event.detail.value;

  //   // If search text is too short, clear the list.
  //   if (this.searchText.length < 2) {
  //     this.filteredLocations = [];
  //     return;
  //   }

  //   const lowerSearch = this.searchText.toLowerCase();
  //   this.filteredLocations = this.cities.filter((city) =>
  //     city.name.toLowerCase().includes(lowerSearch)
  //   );
  // }

  // selectLocation(location: any) {
  //   this.selectedLocation = location;
  //   this.showDropdown = false;
  //   this.getSunriseForLocation(location);
  // }

  // async getSunriseForLocation(location: any) {
  //   if (!location || !location.coordinate) return;
  //   const today = new Date();
  //   const { lat, lng } = location.coordinate;
  //   const times = SunCalc.getTimes(today, lat, lng);
  //   this.currentSunrise = this.formatTime(times.sunrise);
  //   this.offsetMinutesCurrent = this.computeOffset(
  //     this.currentSunrise,
  //     '06:00:00'
  //   );
  //   this.loadDailySegments(
  //     new Date(this.selectedDate),
  //     lat,
  //     lng,
  //     location.timezone
  //   );
  // }

  // // ---------------- CURRENT TIME INFO TAB ----------------

  // /**
  //  * loadCurrentDaySegments() computes the cycle's sunrise and segments.
  //  * If the current time is before today's sunrise, it uses yesterday's sunrise.
  //  */
  // loadCurrentDaySegments() {
  //   if (!this.rawData.length) {
  //     return;
  //   }
  //   const now = new Date();
  //   const { lat, lng } = this.getLatLng();

  //   // Compute today's sunrise time using suncalc
  //   let today = new Date();
  //   let timesToday = SunCalc.getTimes(today, lat, lng);
  //   let sunriseDate = timesToday.sunrise;

  //   // If current time is before today's sunrise, then use yesterday's sunrise.
  //   if (now < sunriseDate) {
  //     let yesterday = new Date(today);
  //     yesterday.setDate(today.getDate() - 1);
  //     let timesYesterday = SunCalc.getTimes(yesterday, lat, lng);
  //     sunriseDate = timesYesterday.sunrise;
  //   }

  //   this.currentSunrise = this.formatTime(sunriseDate);
  //   this.offsetMinutesCurrent = this.computeOffset(
  //     this.currentSunrise,
  //     '06:00:00'
  //   );

  //   // Use the weekday of the cycle's sunrise (not necessarily today)
  //   const cycleWeekday = this.getWeekday(sunriseDate);
  //   const segments12h = this.rawData.filter(
  //     (rec) => rec.DayOfWeek === cycleWeekday
  //   );
  //   segments12h.sort((a, b) => this.compareTime(a.StartTime, b.StartTime));

  //   const firstHalf = segments12h.map((rec) => ({
  //     adjustedStart: this.addOffset(rec.StartTime, this.offsetMinutesCurrent),
  //     adjustedEnd: this.addOffset(rec.EndTime, this.offsetMinutesCurrent),
  //     Result: rec.Result,
  //     Status: rec.Status,
  //   }));
  //   const secondHalf = segments12h.map((rec) => ({
  //     adjustedStart: this.addOffset(
  //       rec.StartTime,
  //       this.offsetMinutesCurrent + 720
  //     ),
  //     adjustedEnd: this.addOffset(rec.EndTime, this.offsetMinutesCurrent + 720),
  //     Result: rec.Result,
  //     Status: rec.Status,
  //   }));
  //   this.adjustedSegmentsCurrent = [...firstHalf, ...secondHalf];
  //   this.computeCurrentSegment();
  // }

  // // ---------------- DAILY TABLE TAB ----------------

  // /**
  //  * loadDailySegments() calculates the sunrise for the chosen date and builds the segments.
  //  */
  // loadDailySegments(
  //   chosenDate: Date,
  //   lat?: number,
  //   lng?: number,
  //   timezone?: string
  // ) {
  //   if (!this.rawData.length) {
  //     return;
  //   }
  //   if (!lat || !lng) {
  //     ({ lat, lng } = this.getLatLng());
  //   }
  //   // Use suncalc to get the sunrise time for the chosen date.
  //   const times = SunCalc.getTimes(chosenDate, lat, lng);
  //   let sunriseDate = times.sunrise;
  //   let sunriseStr = this.formatTime(sunriseDate);
  //   let weekday = this.getWeekday(sunriseDate);
  //   if (timezone) {
  //     const result = this.convertToTimezone(sunriseDate.toString(), timezone);
  //     sunriseStr = result.timeOnly;
  //     weekday = result.weekday;
  //   }
  //   const offset = this.computeOffset(sunriseStr, '06:00:00');

  //   const segments12h = this.rawData.filter((rec) => rec.DayOfWeek === weekday);
  //   segments12h.sort((a, b) => this.compareTime(a.StartTime, b.StartTime));

  //   const firstHalf = segments12h.map((rec) => ({
  //     adjustedStart: this.addOffset(rec.StartTime, offset),
  //     adjustedEnd: this.addOffset(rec.EndTime, offset),
  //     Result: rec.Result,
  //     Status: rec.Status,
  //   }));
  //   const secondHalf = segments12h.map((rec) => ({
  //     adjustedStart: this.addOffset(rec.StartTime, offset + 720),
  //     adjustedEnd: this.addOffset(rec.EndTime, offset + 720),
  //     Result: rec.Result,
  //     Status: rec.Status,
  //   }));
  //   this.adjustedSegmentsDaily = [...firstHalf, ...secondHalf];
  // }

  // // ---------------- GELOCATION ----------------

  // async getUserLocation() {
  //   this.loading = true;
  //   const loading = await this.loadingController.create({
  //     message: 'Fetching location...',
  //     spinner: 'crescent',
  //   });
  //   await loading.present();
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       async (pos) => {
  //         const lat = pos.coords.latitude;
  //         const lng = pos.coords.longitude;
  //         this.locationString = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(
  //           4
  //         )}`;
  //         // After getting location, recalc segments for both tabs.
  //         this.loadCurrentDaySegments();
  //         this.loadDailySegments(new Date(this.selectedDate));
  //         await loading.dismiss();
  //         this.loading = false;
  //       },
  //       async (err) => {
  //         console.warn('Geolocation error:', err);
  //         this.locationString = 'Could not get location';
  //         await loading.dismiss();
  //         this.loading = false;
  //       }
  //     );
  //   } else {
  //     this.locationString = 'Geolocation not supported';
  //     await loading.dismiss();
  //     this.loading = false;
  //   }
  //   await this.loadingController.dismiss();
  // }

  // // Helper: extract lat/lng from locationString (or default to 0)
  // getLatLng(): { lat: number; lng: number } {
  //   if (
  //     this.locationString !== 'Unknown' &&
  //     this.locationString.indexOf('Lat:') > -1
  //   ) {
  //     const parts = this.locationString.split(',');
  //     const lat = Number(parts[0].replace('Lat:', '').trim());
  //     const lng = Number(parts[1].replace('Lng:', '').trim());
  //     return { lat, lng };
  //   }
  //   return { lat: 0, lng: 0 };
  // }

  // // ---------------- TIME UTILITIES ----------------

  // // Format a Date as "HH:mm:ss"
  // formatTime(dateObj: Date): string {
  //   const hh = this.pad(dateObj.getHours());
  //   const mm = this.pad(dateObj.getMinutes());
  //   const ss = this.pad(dateObj.getSeconds());
  //   return `${hh}:${mm}:${ss}`;
  // }

  // // Compute offset (in minutes) between actual sunrise and base "06:00:00"
  // computeOffset(actual: string, base: string): number {
  //   const actualMins = this.timeToMinutes(actual);
  //   const baseMins = this.timeToMinutes(base);
  //   return actualMins - baseMins;
  // }

  // timeToMinutes(time: string): number {
  //   const parts = time.split(':').map(Number);
  //   return parts[0] * 60 + parts[1];
  // }

  // // Add offset (in minutes) to a time string ("HH:mm:ss")
  // addOffset(time: string, offset: number): string {
  //   const total = this.timeToMinutes(time) + offset;
  //   const mod = total % (24 * 60);
  //   const hh = Math.floor(mod / 60);
  //   const mm = mod % 60;
  //   return `${this.pad(hh)}:${this.pad(mm)}:00`;
  // }

  // compareTime(t1: string, t2: string): number {
  //   return this.timeToMinutes(t1) - this.timeToMinutes(t2);
  // }

  // pad(num: number): string {
  //   return num < 10 ? '0' + num : num.toString();
  // }

  // // ---------------- CURRENT SEGMENT CALCULATION ----------------

  // computeCurrentSegment() {
  //   if (
  //     !this.adjustedSegmentsCurrent ||
  //     this.adjustedSegmentsCurrent.length === 0
  //   ) {
  //     this.currentSegment = null;
  //     this.minutesLeft = 0;
  //     return;
  //   }
  //   const now = new Date();
  //   // Use the cycle's sunrise (already computed in currentSunrise)
  //   const cycleSunrise = this.parseTime(this.currentSunrise);
  //   cycleSunrise.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
  //   // If now is before the cycle's sunrise, then current cycle is from yesterday
  //   if (now < cycleSunrise) {
  //     cycleSunrise.setDate(cycleSunrise.getDate() - 1);
  //   }
  //   // compute minutes since day start
  //   let diff = now.getHours() * 60 + now.getMinutes(); // minutes since cycle sunrise
  //   let found = null;
  //   for (const seg of this.adjustedSegmentsCurrent) {
  //     const segStart = this.timeToMinutes(seg.adjustedStart);
  //     const segEnd = this.timeToMinutes(seg.adjustedEnd);
  //     if (diff >= segStart && diff < segEnd) {
  //       found = seg;
  //       this.minutesLeft = Math.floor(segEnd - diff);
  //       break;
  //     }
  //   }
  //   this.currentSegment = found;
  //   if (!found) {
  //     this.minutesLeft = 0;
  //   }
  // }

  // parseTime(time: string): Date {
  //   const parts = time.split(':').map(Number);
  //   const d = new Date();
  //   d.setHours(parts[0], parts[1], parts[2], 0);
  //   return d;
  // }

  // // ---------------- HELPER: Get Weekday ----------------

  // getWeekday(date: Date): string {
  //   const options = { weekday: 'long' } as const;
  //   return date.toLocaleDateString('en-US', options);
  // }

  // convertToTimezone(
  //   dateStr: string,
  //   toTimezone: string
  // ): { timeOnly: string; weekday: string } {
  //   try {
  //     // Parse the input date
  //     const inputDate = moment.tz(
  //       dateStr,
  //       'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ',
  //       'Etc/GMT'
  //     );

  //     // Convert the date to the target timezone
  //     const convertedDate = inputDate.tz(toTimezone);

  //     // Return formatted date
  //     const timeOnly = convertedDate.format('HH:mm:ss');
  //     const weekday = convertedDate.format('dddd');
  //     return { timeOnly, weekday };
  //   } catch (error) {
  //     console.error('Error converting timezone:', error);
  //     return { timeOnly: 'Invalid Date', weekday: 'Invalid Date' };
  //   }
  // }

  constructor() {}
  ngOnInit() {}
}
