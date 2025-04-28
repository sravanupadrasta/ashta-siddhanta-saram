import { Injectable } from '@angular/core';
import { Helper } from 'src/app/utils/helper';
import * as SunCalc from 'suncalc';

export interface SunriseData {
  sunriseDate: Date;
  sunriseDateString: string;
  sunriseTimeString: string;
  offset: number;
  sunriseWeekday: string;
}

@Injectable({
  providedIn: 'root',
})
export class SunriseService {
  private baseTime: string = '06:00:00'; // Base time for offset calculation
  constructor() {}

  async getSunrise(date: Date, location: any): Promise<Date> {
    if (!location || !location.coordinate) throw new Error('Location not found');
    const { lat, lng } = location.coordinate;
    const times = SunCalc.getTimes(date, lat, lng);
    return times.sunrise;
  }

  async getSunriseAll(date: Date, location: any) {
    const sunriseDate = await this.getSunrise(date, location);
    const sunriseDateString = sunriseDate.toString();
    const sunriseTimeString = Helper.formatTime(sunriseDate);
    const offset = Helper.computeOffset(sunriseTimeString, this.baseTime);

    const sunriseData: SunriseData = {
      sunriseDate: sunriseDate,
      sunriseDateString: sunriseDateString,
      sunriseTimeString: sunriseTimeString,
      offset: offset,
      sunriseWeekday: Helper.getWeekday(sunriseDate),
    };
    return sunriseData;
  }

  async getSunriseOffsetMinutes(sunriseDate: Date) {
    const sunriseTime = Helper.formatTime(sunriseDate);
    return Helper.computeOffset(sunriseTime, this.baseTime);
  }
}
