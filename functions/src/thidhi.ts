// thidhi.ts
import {
  Body,
  MakeTime,
  Search,
  AstroTime,
  GeoVector,
  Ecliptic
} from 'astronomy-engine';

/** Shukla & Krishna fortnight labels */
export type Paksha = 'Shukla' | 'Krishna';

/** One lunar day (thidhi) */
export interface Thidhi {
  /** e.g. "Dvitiya", "Purnima" or "Amavasya" */
  name: string;
  paksha: Paksha;
  start: Date;
  end: Date;
}

/** Base names for the 1st–15th thidhi */
const BASE_NAMES = [
  'Pratipada', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
];

/** Returns Δ = (moon longitude – sun longitude) mod 360° */
function getMoonSunDelta(time: AstroTime): number {
  const sunEcl = Ecliptic(GeoVector(Body.Sun, time, true)).elon;
  const moonEcl = Ecliptic(GeoVector(Body.Moon, time, true)).elon;
  return (moonEcl - sunEcl + 360) % 360;
}

/**
 * Finds the exact moment Δ crosses targetDeg.
 * Searches within ±searchDays days of the startTime.
 */
function findTransition(
  startTime: AstroTime,
  targetDeg: number,
  searchDays = 2
): Date {
  const result = Search(
    t => {
      let delta = getMoonSunDelta(t) - targetDeg;
      // normalize into [-180, +180]
      if (delta > 180)  delta -= 360;
      if (delta < -180) delta += 360;
      return delta;
    },
    startTime,
    startTime.AddDays(searchDays)
  );
  if (!result) throw new Error(`No transition found for ${targetDeg}°`);
  return result.date;
}

/**
 * Computes both “current” and “next” thidhi for the given date.
 */
export function getThidhiNow(date: Date = new Date()): {
  current: Thidhi;
  next:    Thidhi;
} {
  const time    = MakeTime(date);
  const delta   = getMoonSunDelta(time);       // 0–360°
  const index   = Math.floor(delta / 12);      // 0–29
  const nextIdx = (index + 1) % 30;

  // Boundaries in degrees
  const startDegCurr = index * 12;
  const endDegCurr   = (index + 1) * 12;
  const endDegNext   = (nextIdx + 1) * 12;

  // Find exact boundary times
  const startCurr = findTransition(time.AddDays(-1), startDegCurr);
  const endCurr   = findTransition(time,            endDegCurr);
  const endNext   = findTransition(MakeTime(endCurr), endDegNext);

  // Helper to build a Thidhi object
  const build = (i: number, st: Date, en: Date): Thidhi => {
    const paksha = i < 15 ? 'Shukla' : 'Krishna';
    // map 0–14 → BASE_NAMES; override 14 in Krishna to "Amavasya"
    const baseIdx = i % 15;
    const name    = (
      paksha === 'Krishna' && baseIdx === 14
        ? 'Amavasya'
        : BASE_NAMES[baseIdx]
    );
    return { name, paksha, start: st, end: en };
  };

  return {
    current: build(index,     startCurr, endCurr),
    next:    build(nextIdx, endCurr,     endNext)
  };
}
