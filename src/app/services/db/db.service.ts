import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';

export interface PersonProfile {
  id?: number;
  name: string;
  nakshatra: string;
}

export interface FcmTokenRecord {
  id?: number;
  token: string;
}

export interface LocationRecord {
  id?: number;
  lat: number;
  lng: number;
  fetchedAt: string; // timestamp
}

export interface NotificationStatus {
  id?: number;
  enabled: boolean;
  updatedAt: string; // timestamp
}



@Injectable({ providedIn: 'root' })
export class DBService extends Dexie {
  profiles!: Table<PersonProfile>;
  fcmTokens!: Table<FcmTokenRecord>;
  locationData!: Table<LocationRecord>;
  notificationStatus!: Table<NotificationStatus>;

  constructor() {
    super('PanchangaDB');
    this.version(2).stores({
      profiles: '++id,name,nakshatra',
      fcmTokens: '++id,token',
      locationData: '++id',
      notificationStatus: '++id'
    });
  }

  // --- Profiles Methods ---
  async getAllProfiles(): Promise<PersonProfile[]> {
    return this.profiles.toArray();
  }

  async addProfile(profile: PersonProfile): Promise<number> {
    return this.profiles.add(profile);
  }

  async removeProfile(id: number): Promise<void> {
    return this.profiles.delete(id);
  }

  async clearAllProfiles(): Promise<void> {
    return this.profiles.clear();
  }

  // --- FCM Tokens Methods ---
  async getAllFcmTokens(): Promise<FcmTokenRecord[]> {
    return this.fcmTokens.toArray();
  }

  async addFcmToken(record: FcmTokenRecord): Promise<number> {
    return this.fcmTokens.add(record);
  }

  async findFcmToken(token: string): Promise<FcmTokenRecord | undefined> {
    return this.fcmTokens.where('token').equals(token).first();
  }

  async clearAllFcmTokens(): Promise<void> {
    return this.fcmTokens.clear();
  }

  async saveLocation(lat: number, lng: number): Promise<number> {
    await this.locationData.clear();
    return this.locationData.add({ lat, lng, fetchedAt: new Date().toISOString() });
  }

  async getLocation(): Promise<LocationRecord | undefined> {
    return this.locationData.toCollection().first();
  }

  async clearLocation(): Promise<void> {
    return this.locationData.clear();
  }

  async saveNotificationStatus(enabled: boolean): Promise<number> {
    await this.notificationStatus.clear();
    return this.notificationStatus.add({
      enabled,
      updatedAt: new Date().toISOString()
    });
  }

  async getNotificationStatus(): Promise<NotificationStatus | undefined> {
    return this.notificationStatus.toCollection().first();
  }

  async clearNotificationStatus(): Promise<void> {
    return this.notificationStatus.clear();
  }
}
