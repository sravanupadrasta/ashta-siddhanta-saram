import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

initializeApp();

export const sendDailyPanchanga = onSchedule({
  schedule: 'every day 05:00',
  timeZone: 'Asia/Kolkata'
}, async (event) => {
  const db = getFirestore();
  const snapshot = await db.collection('fcmTokens').get();
  const messaging = getMessaging();

  const tokensData = snapshot.docs.map(doc => ({
    id: doc.id,
    token: doc.data().token,
    failureCount: doc.data().failureCount || 0
  }));

  if (tokensData.length === 0) {
    console.log('No FCM tokens available.');
    return;
  }

  const tokens = tokensData.map(t => t.token);

  const results = await messaging.sendEachForMulticast({
    notification: {
      title: "🌙 Today's Panchang",
      body: "Dwadashi till 6:10AM\nAshwini till 9:15PM"
    },
    webpush: {
      headers: {
        TTL: '86400' // 24 hours TTL
      },
      notification: {
        icon: 'https://ashta-siddhanta-saram.web.app/assets/icons/icon-a-192x192.png',
        badge: 'https://ashta-siddhanta-saram.web.app/assets/icons/icon-a-192x192.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      },
    },
    tokens
  });

  console.log(`Successfully sent ${results.responses.filter(r => r.success).length} messages`);

  // Handle failures
  for (let i = 0; i < results.responses.length; i++) {
    const response = results.responses[i];
    const tokenInfo = tokensData[i];
    const tokenRef = db.collection('fcmTokens').doc(tokenInfo.id);

    if (!response.success) {
      const errorCode = response.error?.code || '';

      if (errorCode === 'messaging/registration-token-not-registered') {
        // Hard failure: Token is invalid
        if (tokenInfo.failureCount + 1 >= 3) {
          await tokenRef.delete();
          console.log(`Deleted token: ${tokenInfo.token} after 3 consecutive failures`);
        } else {
          await tokenRef.update({ failureCount: tokenInfo.failureCount + 1 });
          console.log(`Incremented failure count for token: ${tokenInfo.token} to ${tokenInfo.failureCount + 1}`);
        }
      } else {
        // Temporary error (device offline, server error, etc.): no failure count increment
        console.warn(`Temporary error for token: ${tokenInfo.token} - ${errorCode}`);
      }
    } else {
      // Success: Reset failure count if it was previously failing
      if (tokenInfo.failureCount > 0) {
        await tokenRef.update({ failureCount: 0 });
        console.log(`Reset failure count for token: ${tokenInfo.token}`);
      }
    }
  }
});


import { onRequest } from 'firebase-functions/v2/https';

export const triggerPanchangaManually = onRequest(async (req, res) => {
  const db = getFirestore();
  const snapshot = await db.collection('fcmTokens').get();
  const messaging = getMessaging();

  const tokensData = snapshot.docs.map(doc => ({
    id: doc.id,
    token: doc.data().token,
    failureCount: doc.data().failureCount || 0
  }));

  if (tokensData.length === 0) {
    console.log('No FCM tokens available.');
    res.send('No tokens available.');
    return;
  }

  const tokens = tokensData.map(t => t.token);

  const results = await messaging.sendEachForMulticast({
    notification: {
      title: "🌙 Today's Panchang (Manual Trigger)",
      body: "Dwadashi till 6:10AM\nAshwini till 9:15PM"
    },
    webpush: {
      headers: {
        TTL: '86400' // 24 hours TTL
      },
      notification: {
        icon: 'https://ashta-siddhanta-saram.web.app/assets/icons/icon-a-192x192.png',
        badge: 'https://ashta-siddhanta-saram.web.app/assets/icons/icon-a-192x192.png',
        requireInteraction: true,
        vibrate: [200, 100, 200],
      },
    },
    tokens
  });

  console.log(`Manually triggered: ${results.responses.filter(r => r.success).length} messages sent`);

  // Handle failures
  for (let i = 0; i < results.responses.length; i++) {
    const response = results.responses[i];
    const tokenInfo = tokensData[i];
    const tokenRef = db.collection('fcmTokens').doc(tokenInfo.id);

    if (!response.success) {
      const errorCode = response.error?.code || '';

      if (errorCode === 'messaging/registration-token-not-registered') {
        // Hard failure: Token is invalid
        if (tokenInfo.failureCount + 1 >= 3) {
          await tokenRef.delete();
          console.log(`Deleted token: ${tokenInfo.token} after 3 consecutive failures`);
        } else {
          await tokenRef.update({ failureCount: tokenInfo.failureCount + 1 });
          console.log(`Incremented failure count for token: ${tokenInfo.token} to ${tokenInfo.failureCount + 1}`);
        }
      } else {
        console.warn(`Temporary error for token: ${tokenInfo.token} - ${errorCode}`);
      }
    } else {
      // Success: Reset failure count if necessary
      if (tokenInfo.failureCount > 0) {
        await tokenRef.update({ failureCount: 0 });
        console.log(`Reset failure count for token: ${tokenInfo.token}`);
      }
    }
  }

  res.send(`Sent ${results.responses.filter(r => r.success).length} messages manually`);
});
