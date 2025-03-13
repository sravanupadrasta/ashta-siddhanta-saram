// src/app/services/sunrise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SunriseResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: string;
    // Other fields can be added if needed
  };
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class SunriseService {
  private apiUrl = 'https://api.sunrise-sunset.org/json';

  constructor(private http: HttpClient) {}

  getSunrise(lat: number, lng: number, date: string = 'today'): Observable<SunriseResponse> {
    // Use formatted=0 to get ISO8601 times
    const url = `${this.apiUrl}?lat=${lat}&lng=${lng}&date=${date}&formatted=0`;
    return this.http.get<SunriseResponse>(url);
  }
}
