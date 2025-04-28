import * as moment from 'moment-timezone';

export class Helper {
  static getLatLng(locationString: string): { lat: number; lng: number } {
    if (locationString !== 'Unknown' && locationString.indexOf('Lat:') > -1) {
      const parts = locationString.split(',');
      const lat = Number(parts[0].replace('Lat:', '').trim());
      const lng = Number(parts[1].replace('Lng:', '').trim());
      return { lat, lng };
    }
    return { lat: 0, lng: 0 };
  }

  // ---------------- TIME UTILITIES ----------------

  // Format a Date as "HH:mm:ss"
  static formatTime(dateObj: Date): string {
    const hh = this.pad(dateObj.getHours());
    const mm = this.pad(dateObj.getMinutes());
    const ss = this.pad(dateObj.getSeconds());
    return `${hh}:${mm}:${ss}`;
  }

  // Compute offset (in minutes) between actual sunrise and base "06:00:00"
  static computeOffset(actual: string, base: string): number {
    const actualMins = this.timeToMinutes(actual);
    const baseMins = this.timeToMinutes(base);
    return actualMins - baseMins;
  }

  static timeToMinutes(time: string): number {
    const parts = time.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  }

  // Add offset (in minutes) to a time string ("HH:mm:ss")
  static addOffset(time: string, offset: number): string {
    const total = this.timeToMinutes(time) + offset;
    const mod = total % (24 * 60);
    const hh = Math.floor(mod / 60);
    const mm = mod % 60;
    return `${this.pad(hh)}:${this.pad(mm)}:00`;
  }

  static compareTime(t1: string, t2: string): number {
    return this.timeToMinutes(t1) - this.timeToMinutes(t2);
  }

  static pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  static parseTime(time: string): Date {
    const parts = time.split(':').map(Number);
    const d = new Date();
    d.setHours(parts[0], parts[1], parts[2], 0);
    return d;
  }

  // ---------------- HELPER: Get Weekday ----------------

  static getWeekday(date: Date): string {
    const options = { weekday: 'long' } as const;
    return date.toLocaleDateString('en-US', options);
  }

  static convertToTimezone(
    dateStr: string,
    toTimezone: string
  ): { timeOnly: string; weekday: string } {
    try {
      // Parse the input date
      const inputDate = moment.tz(
        dateStr,
        'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ',
        'Etc/GMT'
      );

      // Convert the date to the target timezone
      const convertedDate = inputDate.tz(toTimezone);

      // Return formatted date
      const timeOnly = convertedDate.format('HH:mm:ss');
      const weekday = convertedDate.format('dddd');
      return { timeOnly, weekday };
    } catch (error) {
      console.error('Error converting timezone:', error);
      return { timeOnly: 'Invalid Date', weekday: 'Invalid Date' };
    }
  }
}
