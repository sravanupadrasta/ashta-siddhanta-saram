import { Injectable } from '@angular/core';
import { AstroTime, EclipticGeoMoon } from 'astronomy-engine';

@Injectable({
  providedIn: 'root'
})
export class NakshatraService {
  nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
    "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
    "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
  ];

  // Computes Julian Day for a given date (the original algorithm you provided)
  jd(d: number, m: number, y: number) { 
      var a, j, l; 
      var b; 
      if (m < 3) { 
          m += 12; 
          y--; 
      }
      a = y / 100; 
      b = 30.6 * (m + 1); 
      l = parseInt(b.toString()); 
      j = 365 * y + y / 4 + l + 2 - a + a / 4 + d; 
      return j; 
  }

  calculateB6(d: any, m: any, y: any) { 
      var h, mt, s, h6, b6, timeZone; 
      h = 12; 
      mt = 0; 
      s = 0; 
      timeZone = 5.5; 
      h6 = (h + mt / 60 + s / 3600 - (12 + timeZone)) / 24; 
      b6 = (this.jd(d, m, y) - 694025 + h6) / 36525; 
      return b6; 
  }

  lahiriAyan(dd: any, mm: any, yy: any) { 
      return 22.460148 + 1.396042 * this.calculateB6(dd, mm, yy) + 3.08E-4 * this.calculateB6(dd, mm, yy) * this.calculateB6(dd, mm, yy); 
  }

  // Computes the Moon's geocentric ecliptic longitude using Astronomy Engine
  computeMoonEclipticLongitude(date: Date): number {
    const dt = new Date(date);
    const time = new AstroTime(dt);
    const ecliptic = EclipticGeoMoon(time);
    return ecliptic.lon;
  }

  // Returns the Moon's sidereal longitude (ecliptic longitude minus the Lahiri ayanamsa)
  computeSiderealLongitude(date: Date): number {
    // Note: date.getMonth() returns 0 for January, so add 1
    const dt = new Date(date);
    const moonLongitude = this.computeMoonEclipticLongitude(dt);
    const ayan = this.lahiriAyan(dt.getDate(), dt.getMonth() + 1, dt.getFullYear());
    const sidereal = (moonLongitude - ayan + 360) % 360;
    return sidereal;
  }

  // Binary search for the time when the Moon's sidereal longitude reaches a target value.
  // The search is performed between startDate and endDate.
  binarySearchSidereal(target: number, startDate: Date, endDate: Date): Date {
    const tolerance = 0.001; // degrees tolerance
    let start = startDate.getTime();
    let end = endDate.getTime();
    let mid: number;
    let midDate: Date;
    while (end - start > 1000) { // continue until the time window is less than 1 second
      mid = (start + end) / 2;
      midDate = new Date(mid);
      let currentSidereal = this.computeSiderealLongitude(midDate);
      let diff = currentSidereal - target;
      // Adjust diff to be within -180° to 180° to avoid wrap-around issues
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      if (Math.abs(diff) < tolerance) {
        return midDate;
      }
      // Since the Moon’s sidereal longitude increases with time, if diff is negative,
      // midDate is before the target.
      if (diff < 0) {
        start = mid;
      } else {
        end = mid;
      }
    }
    return new Date((start + end) / 2);
  }

  // Returns the name of the current nakshatra based on the provided date.
  determineNakshatra(date: Date): string {
    const siderealLongitude = this.computeSiderealLongitude(date);
    const interval = 360 / 27; // Each nakshatra spans ≈13.3333°
    const nakshatraIndex = Math.floor(siderealLongitude / interval);
    return this.nakshatras[nakshatraIndex];
  }

  // Determines the start and end Date/Time of the current nakshatra.
  determineNakshatraStartEnd(date: Date): Panchanga {
    const dt = new Date(date);
    const siderealLongitude = this.computeSiderealLongitude(date);
    const interval = 360 / 27; 
    const nakshatraIndex = Math.floor(siderealLongitude / interval);
    const nakshatra = this.nakshatras[nakshatraIndex];

    // Boundaries for the current nakshatra:
    const startBoundary = nakshatraIndex * interval;
    const endBoundary = startBoundary + interval;

    // Find nakshatra start: search backward up to 24 hours from the given date.
    const startSearchDate = new Date(dt.getTime() - 24 * 3600 * 1000);
    const nakshatraStart = this.binarySearchSidereal(startBoundary, startSearchDate, dt);

    // Find nakshatra end: search forward up to 24 hours from the given date.
    const endSearchDate = new Date(dt.getTime() + 24 * 3600 * 1000);
    const nakshatraEnd = this.binarySearchSidereal(endBoundary, dt, endSearchDate);
    
    const nextNakshatra = this.determineNextNakshatra(date);

    return {
      nakshatra: {
        name: nakshatra,
        start: nakshatraStart,
        end: nakshatraEnd
      },
      nextNakshatra: nextNakshatra
    };
  }

  determineNextNakshatra(date: Date): Nakshatra {
    const dt = new Date(date);
    const siderealLongitude = this.computeSiderealLongitude(date);
    const interval = 360 / 27; 
    const nakshatraIndex = Math.floor(siderealLongitude / interval);
    const nextNakshatraIndex = (nakshatraIndex + 1) % 27;
    const nextNakshatra = this.nakshatras[nextNakshatraIndex];

    // Boundaries for the next nakshatra:
    const startBoundary = nextNakshatraIndex * interval;
    const endBoundary = startBoundary + interval;

    // Find next nakshatra start: search forward up to 24 hours from the given date.
    const startSearchDate = new Date(dt.getTime());
    const nakshatraStart = this.binarySearchSidereal(startBoundary, startSearchDate, new Date(dt.getTime() + 30 * 3600 * 1000));

    // Find next nakshatra end: search forward up to 24 hours from the start of the next nakshatra.
    const endSearchDate = new Date(nakshatraStart.getTime() + 30 * 3600 * 1000);
    const nakshatraEnd = this.binarySearchSidereal(endBoundary, nakshatraStart, endSearchDate);

    return {
      name: nextNakshatra,
      start: nakshatraStart,
      end: nakshatraEnd
    };
  }

}

export interface Nakshatra{
  name: string;
  start: Date;
  end: Date;
}

export interface Panchanga {
  nakshatra: Nakshatra;
  nextNakshatra: Nakshatra;
}
