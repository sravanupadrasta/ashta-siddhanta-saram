import { Injectable } from '@angular/core';
import { DBService } from '../db/db.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  
  profilesUpdated: BehaviorSubject<boolean> = new BehaviorSubject(false);
  profilesUpdated$ = this.profilesUpdated.asObservable();

  constructor(private dbService: DBService) { }

  async addProfile(profile: any) {
    const id = await this.dbService.addProfile(profile);
    if (!id) {
      throw new Error('Error adding profile');
    }
    this.profilesUpdated.next(true);
  }

  async getAllProfiles() {
    return this.dbService.getAllProfiles();
  }

  async removeProfile(id: number) {
    await this.dbService.removeProfile(id);
    this.profilesUpdated.next(true);
  }

}
