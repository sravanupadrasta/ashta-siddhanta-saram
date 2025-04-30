// nakshatra.ts
import {
  AstroTime,
  Search,
  MakeTime,
  EclipticGeoMoon
} from "astronomy-engine";

export interface Nakshatra {
  name:  string;
  start: Date;
  end:   Date;
}

const NAMES = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashirsha","Ardra","Punarvasu",
  "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada",
  "Uttara Bhadrapada","Revati"
];

/** Julian day approximation from year, month, day */
function julianDay(d: number, m: number, y: number): number {
  if (m < 3) { m += 12; y--; }
  const a = Math.floor(y/100);
  const b = Math.floor(30.6*(m+1));
  return 365*y + Math.floor(y/4) + b + 2 - a + Math.floor(a/4) + d;
}

/** Auxiliary B6 term for Lahiri ayanāmsa */
function calcB6(d: number, m: number, y: number): number {
  const h = 12, mt = 0, s = 0, tz = 5.5;
  const h6 = (h + mt/60 + s/3600 - (12 + tz)) / 24;
  return (julianDay(d,m,y) - 694025 + h6) / 36525;
}

/** Lahiri ayanāmsa in degrees */
function lahiriAyan(d: Date): number {
  const y = d.getFullYear(), m = d.getMonth()+1, day = d.getDate();
  const b6 = calcB6(day, m, y);
  return 22.460148
       + 1.396042 * b6
       + 0.000308   * b6 * b6;
}

/** Sidereal Moon longitude = ecliptic lon − ayanāmsa */
function siderealMoonLon(t: AstroTime): number {
  const e = EclipticGeoMoon(t).lon;
  const aya = lahiriAyan(t.date);
  return (e - aya + 360) % 360;
}

/**
 * Finds the exact moment the sidereal moon longitude crosses `targetDeg`.
 * Searches ±`searchDays` around the given start time.
 */
function findBoundary(
  startTime: AstroTime,
  targetDeg: number,
  searchDays = 1
): Date {
  const res = Search(
    t => {
      let diff = siderealMoonLon(t) - targetDeg;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      return diff;
    },
    startTime.AddDays(-searchDays),
    startTime.AddDays(+searchDays)
  );
  if (!res) throw new Error(`Nakshatra boundary not found for ${targetDeg}°`);
  return res.date;
}

/**
 * Compute the current & next nakshatra for the given date.
 */
export function getNakshatrasNow(date: Date = new Date()): {
  current: Nakshatra;
  next:    Nakshatra;
} {
  const nowTime = MakeTime(date);
  const lon = siderealMoonLon(nowTime);        // 0–360
  const span = 360 / 27;                       // ≈13.3333
  const idx = Math.floor(lon / span);          // 0–26
  const nextIdx = (idx + 1) % 27;

  const startDeg = idx * span;
  const endDeg   = startDeg + span;
  const endNext  = (nextIdx + 1) * span;

  // boundary times
  const start = findBoundary(nowTime, startDeg);
  const end   = findBoundary(nowTime, endDeg);
  const nextEnd = findBoundary(MakeTime(end), endNext);

  const build = (i: number, st: Date, en: Date): Nakshatra => ({
    name:  NAMES[i],
    start: st,
    end:   en
  });

  return {
    current: build(idx,     start,   end),
    next:    build(nextIdx,  end, nextEnd)
  };
}
