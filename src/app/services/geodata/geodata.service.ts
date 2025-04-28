import { Injectable } from '@angular/core';
import KDBush from 'kdbush';              // 3.x
import { around } from 'geokdbush';       // 1.1.x  (typed)
import { BehaviorSubject } from 'rxjs';

export interface GeoPoint {
  name: string;
  coordinate: { lng: number; lat: number };
  country: string;
  timezone: string;
}

@Injectable({ providedIn: 'root' })
export class GeodataService {
  private points: GeoPoint[] = [];
  private index!: KDBush<GeoPoint>;       // generic from @types/kdbush
  ready$ = new BehaviorSubject(false);

  constructor() {
    this.init().then(() => {
      this.ready$.next(true);
    });
  }

  async init() {
    this.points = await fetch('assets/static-data/geodata.min.json')
                         .then(r => r.json());

    /* four-arg ctor that matches kdbush 3.x */
    this.index = new KDBush<GeoPoint>(
      this.points,
      p => p.coordinate.lng,
      p => p.coordinate.lat,
      16
    );
  }

  /** closest single location */
  async nearest(lat: number, lng: number): Promise<GeoPoint | null> {
    if (!this.index) {                         // ⇦ guard
      console.warn('GeoDataService not initialised yet');
      return null;
    }
    const [pt] = around(this.index, lng, lat, 1);   // GeoPoint[] | []
    return pt ?? null;
  }

  /** N closest within optional distance (km) */
  async nearestN(lat: number, lng: number,
           N = 5, maxKm = 50): Promise<GeoPoint[]> {
            if (!this.index) return [];
    return around(this.index, lng, lat, N, maxKm);  // GeoPoint[]
  }
}
