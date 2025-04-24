import { Injectable } from '@angular/core';
import {
  Body,
  MakeTime,
  Search,
  AstroTime,
  GeoVector,
  Ecliptic
} from 'astronomy-engine';

@Injectable({
  providedIn: 'root'
})
export class ThidhiService {

  private getDeltaDegrees(time: AstroTime): number {
    const sunVec = GeoVector(Body.Sun, time, true);
    const moonVec = GeoVector(Body.Moon, time, true);
    const sunLon = Ecliptic(sunVec).elon;
    const moonLon = Ecliptic(moonVec).elon;

    return (moonLon - sunLon + 360) % 360;
  }

  private findthidhiBoundary(start: AstroTime, direction: number, thidhiTargetDeg: number): Date {
    const result = Search(
      (t) => {
        let delta = this.getDeltaDegrees(t) - thidhiTargetDeg;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        return delta;
      },
      start,
      start.AddDays(direction * 2)
    );

    if (!result) {
      throw new Error(`thidhi boundary not found for target ${thidhiTargetDeg}°`);
    }

    return result.date;
  }

  getCurrentThidhi(date: Date = new Date()): Thidhi {
    const time = MakeTime(date);
    const delta = this.getDeltaDegrees(time);

    const thidhiIndex = Math.floor(delta / 12);
    const thidhiDegStart = thidhiIndex * 12;
    const thidhiDegEnd = (thidhiIndex + 1) * 12;

    const start = this.findthidhiBoundary(time.AddDays(-1), +1, thidhiDegStart);
    const end = this.findthidhiBoundary(time, +1, thidhiDegEnd);

    const thidhis = [
      'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashti',
      'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
      'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
    ];

    const phase = thidhiIndex < 15 ? 'Shukla' : 'Krishna';
    let thidhiName = thidhis[thidhiIndex % 15];

    if(phase === 'Krishna' && thidhiIndex % 15 === 29)
      thidhiName = 'Amavasya';
    else if(phase === 'Shukla' && thidhiIndex % 15 === 14)
      thidhiName = 'Purnima';

    return {
      thidhi: thidhiName,
      phase,
      start,
      end
    };
  }

  getCurrentAndNextThidhi(date: Date = new Date()): {
    current: Thidhi,
    next: Thidhi
  } {
    const time = MakeTime(date);
    const delta = this.getDeltaDegrees(time);
  
    const currentIndex = Math.floor(delta / 12);
    const nextIndex = (currentIndex + 1) % 30;
  
    const currentDegStart = currentIndex * 12;
    const currentDegEnd = (currentIndex + 1) * 12;
    const nextDegEnd = (nextIndex + 1) * 12;
  
    const currentStart = this.findthidhiBoundary(time.AddDays(-1), +1, currentDegStart);
    const currentEnd = this.findthidhiBoundary(time, +1, currentDegEnd);
    const nextEnd = this.findthidhiBoundary(MakeTime(currentEnd), +1, nextDegEnd);
  
    const thidhis = [
      'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashti',
      'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi',
      'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
    ];
  
    const currentPhase = currentIndex < 15 ? 'Shukla' : 'Krishna';
    const nextPhase = nextIndex < 15 ? 'Shukla' : 'Krishna';
  
    let currentName = thidhis[currentIndex % 15];
    let nextName = thidhis[nextIndex % 15];
  
    if (currentIndex === 29) currentName = 'Amavasya';
    else if (currentIndex === 14) currentName = 'Purnima';
  
    if (nextIndex === 29) nextName = 'Amavasya';
    else if (nextIndex === 14) nextName = 'Purnima';
  
    return {
      current: {
        thidhi: currentName,
        phase: currentPhase,
        start: currentStart,
        end: currentEnd
      },
      next: {
        thidhi: nextName,
        phase: nextPhase,
        start: currentEnd,
        end: nextEnd
      }
    };
  }
  
}




export interface Thidhi {
  thidhi: string,
  phase: string,
  start: Date,
  end: Date
}