import { onSchedule }  from 'firebase-functions/v2/scheduler';
import { onRequest }   from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore }  from 'firebase-admin/firestore';
import { getMessaging }  from 'firebase-admin/messaging';
import { getThidhiNow }  from './thidhi';
import { getNakshatrasNow } from './nakshatra';

initializeApp();

interface TokenData {
  id:           string;
  token:        string;
  failureCount: number;
  timezone:     string;
}

// Helper: load all tokens + metadata
async function loadTokens(db: ReturnType<typeof getFirestore>): Promise<TokenData[]> {
  const snap = await db.collection('fcmTokens').get();
  return snap.docs.map(doc => {
    const d = doc.data() as any;
    return {
      id:           doc.id,
      token:        d.token,
      failureCount: d.failureCount || 0,
      timezone:     d.location?.timezone  // make sure you stored it!
    };
  });
}

// Helper: send one bucket of tokens with identical body
async function sendBucket(
  messaging: ReturnType<typeof getMessaging>,
  db:        ReturnType<typeof getFirestore>,
  tokens:    string[],
  body:      string,
  tokenInfos: TokenData[]
) {
  const res = await messaging.sendEachForMulticast({
    notification: { title: "🌙 Today's Panchang", body },
    webpush: {
      headers: { TTL: '86400' },
      notification: {
        icon:  'https://panchangam.web.app/assets/icons/icon-a-192x192.png',
        badge: 'https://panchangam.web.app/assets/icons/icon-a-192x192.png',
        requireInteraction: true,
        vibrate: [200,100,200]
      }
    },
    tokens
  });

  // failureCount logic
  for (let i = 0; i < res.responses.length; i++) {
    const r = res.responses[i];
    const info = tokenInfos[i];
    const docRef = db.collection('fcmTokens').doc(info.id);

    if (!r.success) {
      const code = r.error?.code || '';
      if (code === 'messaging/registration-token-not-registered') {
        // hard failure
        if (info.failureCount + 1 >= 3) {
          await docRef.delete();
          console.log(`Deleted token ${info.token} after 3 failures`);
        } else {
          await docRef.update({ failureCount: info.failureCount + 1 });
          console.log(`Incremented failureCount for ${info.token} to ${info.failureCount + 1}`);
        }
      } else {
        console.warn(`Temporary error for ${info.token}: ${code}`);
      }
    } else if (info.failureCount > 0) {
      // reset on success
      await docRef.update({ failureCount: 0 });
      console.log(`Reset failureCount for ${info.token}`);
    }
  }

  console.log(`Sent ${res.responses.filter(r => r.success).length}/${tokens.length}`);
}

function formatTimeWithAmPm(date: Date, timezone: string): string {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: timezone
  });
}

function getTodayOrTomorrow(now: Date, target: Date, timezone: string): 'today' | 'tomorrow' | 'later' {
  const nowDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  const targetDate = new Date(target.toLocaleString('en-US', { timeZone: timezone }));

  const nowDay = nowDate.getDate();
  const targetDay = targetDate.getDate();

  if (targetDay === nowDay) {
    return 'today';
  } else if (targetDay === nowDay + 1 || (nowDay === getDaysInMonth(nowDate) && targetDay === 1)) {
    return 'tomorrow';
  } else {
    return 'later';
  }
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// NEW FUNCTION: build the final body
function buildPanchangaBody(localNow: Date, timezone: string): string {
  const { current: th, next: nextTh } = getThidhiNow(localNow);
  const { current: nk, next: nextNk } = getNakshatrasNow(localNow);

  const thEndTime = formatTimeWithAmPm(th.end, timezone);
  const thDayTag  = getTodayOrTomorrow(localNow, th.end, timezone);

  const nkEndTime = formatTimeWithAmPm(nk.end, timezone);
  const nkDayTag  = getTodayOrTomorrow(localNow, nk.end, timezone);

  let body = `${th.paksha} ${th.name} until ${thEndTime} (${thDayTag})\n` +
             `${nk.name} until ${nkEndTime} (${nkDayTag})`;

  if (thDayTag === 'today' && nextTh) {
    const nextThEndTime = formatTimeWithAmPm(nextTh.end, timezone);
    const nextThDayTag = getTodayOrTomorrow(localNow, nextTh.end, timezone);
    body += `\nNext: ${nextTh.paksha} ${nextTh.name} until ${nextThEndTime} (${nextThDayTag})`;
  }

  if (nkDayTag === 'today' && nextNk) {
    const nextNkEndTime = formatTimeWithAmPm(nextNk.end, timezone);
    const nextNkDayTag = getTodayOrTomorrow(localNow, nextNk.end, timezone);
    body += `\nNext: ${nextNk.name} until ${nextNkEndTime} (${nextNkDayTag})`;
  }

  return body;
}



// Scheduled: every UTC hour, but only notify those whose local hour===5
export const sendDailyPanchanga = onSchedule(
  { schedule: '0 * * * *', timeZone: 'UTC' },
  async () => {
    const nowUtc   = new Date();
    const db       = getFirestore();
    const messaging = getMessaging();
    const allTokens = await loadTokens(db);

    // bucket by message body
    const buckets = new Map<string, { tokens: string[]; infos: TokenData[] }>();

    const uniqueInfos = Array.from(new Map(allTokens.map(info=> [info.token, info])).values());

    for (const info of uniqueInfos) {
      if (!info.timezone) continue; // skip if no tz

      // convert to their local time
      const localStr = nowUtc.toLocaleString('en-US', { timeZone: info.timezone });
      const localNow = new Date(localStr);
      if (localNow.getHours() !== 5) continue;

      // compute their Panchanga
      const body = buildPanchangaBody(localNow, info.timezone);
        
      // accumulate
      const bucket = buckets.get(body) ?? { tokens: [], infos: [] };
      bucket.tokens.push(info.token);
      bucket.infos.push(info);
      buckets.set(body, bucket);
    }

    // send each bucket
    for (const { tokens, infos } of buckets.values()) {
      await sendBucket(messaging, db, tokens, [...buckets.entries()]
        .find(([,v]) => v.tokens === tokens)![0], infos);
    }
  }
);

// Manual trigger: send for *all* users immediately (no hour filter)
export const triggerPanchangaManually = onRequest(
  async (_req, res) => {
    const nowUtc    = new Date();
    const db        = getFirestore();
    const messaging = getMessaging();
    const allTokens = await loadTokens(db);

    // bucket by message body
    const buckets = new Map<string, { tokens: string[]; infos: TokenData[] }>();

    const uniqueInfos = Array.from(new Map(allTokens.map(info=> [info.token, info])).values());

    for (const info of uniqueInfos) {
      if (!info.timezone) continue;

      const localStr = nowUtc.toLocaleString('en-US', { timeZone: info.timezone });
      const localNow = new Date(localStr);

      const body = buildPanchangaBody(localNow, info.timezone);

      const bucket = buckets.get(body) ?? { tokens: [], infos: [] };
      bucket.tokens.push(info.token);
      bucket.infos.push(info);
      buckets.set(body, bucket);
    }

    for (const { tokens, infos } of buckets.values()) {
      await sendBucket(messaging, db, tokens, [...buckets.entries()]
        .find(([,v]) => v.tokens === tokens)![0], infos);
    }

    res.send(`Manually sent Panchanga to ${allTokens.length} users`);
  }
);
