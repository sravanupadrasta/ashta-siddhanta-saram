import { Injectable } from '@angular/core';
import { DBService, LocationRecord } from '../db/db.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  locationString: string = 'Unknown';
  lat: number = 0;
  lng: number = 0;
  locationFetchedAt: Date | null = null;

  constructor(private dbService: DBService) { }

  async requestUserLocation(successCallback: () => void, errorCallback: (err: string) => void) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          await this.dbService.saveLocation(lat, lng);
          this.locationString = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          this.locationFetchedAt = new Date();
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
