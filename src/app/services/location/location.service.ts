import { Injectable } from '@angular/core';
import { DBService, LocationRecord } from '../db/db.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Helper } from 'src/app/utils/helper';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  locationString: string = 'Unknown';
  lat: number = 0;
  lng: number = 0;
  locationFetchedAt: Date | null = null;
  private locationUpdatedSubject = new BehaviorSubject<LocationRecord | null>(null);
  locationUpdated$ = this.locationUpdatedSubject.asObservable();

  constructor(private dbService: DBService) { }

  async requestUserLocation(successCallback: () => void, errorCallback: (err: string) => void) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          this.lat = pos.coords.latitude;
          this.lng = pos.coords.longitude;
          await this.dbService.saveLocation(this.lat, this.lng);
          this.locationString = `Lat: ${this.lat.toFixed(4)}, Lng: ${this.lng.toFixed(4)}`;
          this.locationFetchedAt = new Date();
          this.locationUpdatedSubject.next({ lat: this.lat, lng: this.lng, fetchedAt: this.locationFetchedAt.toString() });
          successCallback();
        },
        async (err) => {
          console.warn('Location access denied', err);
          errorCallback('Location access denied');
        }
      );
    } else {
      errorCallback('Geolocation not supported on this device.');
    }
  }

  async getLocation() {
    const location = await this.dbService.getLocation();
    if (location && this.lat !== location.lat && this.lng !== location.lng) {
      this.lat = location.lat;
      this.lng = location.lng;
      this.locationFetchedAt = new Date(location.fetchedAt);
      this.locationString = `Lat: ${this.lat.toFixed(4)}, Lng: ${this.lng.toFixed(4)}`;
      this.locationUpdatedSubject.next({ lat: this.lat, lng: this.lng, fetchedAt: this.locationFetchedAt.toString() });
    }
    return location;
  }

  async getLocationString() {
    if(this.locationString === 'Unknown') {
      await this.getLocation();
    }
    return this.locationString;
  }
}
