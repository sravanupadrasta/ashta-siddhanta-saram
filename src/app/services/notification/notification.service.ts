import { Injectable } from '@angular/core';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { FcmTokenService } from '../fcm-token/fcm-token.service';
import { LocationService } from '../location/location.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messaging = getMessaging();
  private vapidKey = environment.messagingVAPIDKey;

  constructor(private fcmTokenService: FcmTokenService,
              private locationService: LocationService
  ) {}

  async requestPermissionAndGetToken(): Promise<string | null> {
    const supported = await isSupported();
    if (!supported) {
      console.warn('FCM not supported on this browser.');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Permission not granted for notifications');
        return null;
      }
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey
      });
      if (!token) {
        console.warn('No registration token available. Request permission to generate one.');
        return null;
      }

      console.log('FCM token:', token);
      if (token) {
        const userLocation = await this.locationService.getLocation();
        await this.fcmTokenService.saveToken(token, userLocation, Intl.DateTimeFormat().resolvedOptions().timeZone);
      }
      return token;
    } catch (err) {
      console.error('Error getting FCM token:', err);
      return null;
    }
  }
} 
