import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonIcon,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonDatetime,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import {
  AshtaRecord,
  AshtaSiddhantaService,
} from 'src/app/services/ashta-siddhanta/ashta-siddhanta.service';
import * as SunCalc from 'suncalc';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Helper } from 'src/app/utils/helper';
import { LocationService } from 'src/app/services/location/location.service';
import { SunriseService } from 'src/app/services/sunrise/sunrise.service';
import { GeodataService } from 'src/app/services/geodata/geodata.service';

@Component({
  selector: 'app-day-table',
  templateUrl: './day-table.page.html',
  styleUrls: ['./day-table.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonDatetime,
    IonButton,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonList,
    IonIcon,
    IonSearchbar,
    IonLabel,
    IonItem,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
})
export class DayTablePage implements OnInit {
  rawData: AshtaRecord[] = [];
  currentSunrise: string = '';
  offsetMinutesCurrent: number = 0;
  cities: any[] = [];
  adjustedSegmentsDaily: any[] = [];
  filteredLocations: any[] = [];
  selectedLocation: any = null;
  selectedDate: string = new Date().toISOString();
  showCalendar: boolean = false;
  showDropdown = false;
  searchText = '';

  constructor(
    private ashtaService: AshtaSiddhantaService,
    private locationService: LocationService,
    private sunriseService: SunriseService,
    private geodataService: GeodataService,
    private http: HttpClient
  ) {}

  async ngOnInit() {
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
    });
    await this.loadCities();


    this.locationService.locationUpdated$.subscribe(async (location) => {
      if (location) {
        const nearest = await this.geodataService.nearest(location.lat, location.lng);
        if(nearest) {
          this.selectedLocation = this.cities.find((city) => city.name === nearest.name);
          if (this.selectedLocation) {
            this.selectedDate = new Date().toISOString();
            await this.loadDailySegments(new Date(this.selectedDate), location.lat, location.lng);
          } else {
            console.error('No matching city found for nearest location');
          }
        }
      }
    });
  }

  async loadCities() {
    try {
      this.cities = await firstValueFrom(
        this.http.get<any[]>('assets/static-data/geodata.min.json')
      );
    } catch (error) {
      console.error('Error loading cities data:', error);
    }
  }

  async loadDailySegments(
    chosenDate: Date,
    lat?: number,
    lng?: number,
    timezone?: string
  ) {
    if (!this.rawData.length) {
      return;
    }
    if (!lat || !lng) {
      lat = this.locationService.lat;
      lng = this.locationService.lng;
    }

    const sunriseData = await this.sunriseService.getSunriseAll(
      chosenDate, { coordinate: { lat, lng } }
    );
    let sunriseStr = sunriseData.sunriseTimeString;
    let weekday = sunriseData.sunriseWeekday;
    if (timezone) {
      const result = Helper.convertToTimezone(sunriseData.sunriseDateString, timezone);
      sunriseStr = result.timeOnly;
      weekday = result.weekday;
    }
    const offset = Helper.computeOffset(sunriseStr, '06:00:00');

    const segments12h = this.rawData.filter((rec) => rec.DayOfWeek === weekday);
    segments12h.sort((a, b) => Helper.compareTime(a.StartTime, b.StartTime));

    const firstHalf = segments12h.map((rec) => ({
      adjustedStart: Helper.addOffset(rec.StartTime, offset),
      adjustedEnd: Helper.addOffset(rec.EndTime, offset),
      Result: rec.Result,
      Status: rec.Status,
    }));
    const secondHalf = segments12h.map((rec) => ({
      adjustedStart: Helper.addOffset(rec.StartTime, offset + 720),
      adjustedEnd: Helper.addOffset(rec.EndTime, offset + 720),
      Result: rec.Result,
      Status: rec.Status,
    }));
    this.adjustedSegmentsDaily = [...firstHalf, ...secondHalf];
  }

  onDateChange(event: any) {
    if (!event.detail.value) {
      return;
    }
    this.selectedDate = event.detail.value;
    const chosenDate = new Date(this.selectedDate);
    this.loadDailySegments(chosenDate);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.searchText = '';
      this.filteredLocations = [];
    }
  }

  updateFilteredLocations(event: any) {
    this.searchText = event.detail.value;

    // If search text is too short, clear the list.
    if (this.searchText.length < 2) {
      this.filteredLocations = [];
      return;
    }

    const lowerSearch = this.searchText.toLowerCase();
    this.filteredLocations = this.cities.filter((city) =>
      city.name.toLowerCase().includes(lowerSearch)
    );
  }

  async selectLocation(location: any) {
    this.selectedLocation = location;
    this.showDropdown = false;
    const { lat, lng } = location.coordinate;
    await this.loadDailySegments(
      new Date(this.selectedDate),
      lat,
      lng,
      location.timezone
    );
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }
}
