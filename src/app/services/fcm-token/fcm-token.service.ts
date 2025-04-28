import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { DBService, LocationRecord } from '../db/db.service';

@Injectable({ providedIn: 'root' })
export class FcmTokenService {
  constructor(
    private firestore: Firestore,
    private dbService: DBService
  ) {}

  async saveToken(token: string, userLocation: LocationRecord | null = null, timezone: string | null = null) {
    try {
      // Check if token already exists locally
      const existing = await this.dbService.findFcmToken(token);

      if (existing) {
        console.log('Token already saved locally, not saving again.');
        return; // Do nothing if already saved locally
      }

      // Save to Firestore
      const colRef = collection(this.firestore, 'fcmTokens');
      await addDoc(colRef, {
        token,
        created: new Date().toISOString(),
        platform: 'web',
        failureCount: 0,
        location: { lat: userLocation?.lat, lng: userLocation?.lng, timezone: timezone },
      });
      await this.dbService.addFcmToken({ token });
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }
}
