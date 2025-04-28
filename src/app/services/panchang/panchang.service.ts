// panchang.service.ts
import { Injectable } from '@angular/core';
import { DBService, PersonProfile } from '../db/db.service';
import { NakshatraService } from '../nakshatra/nakshatra.service';

export interface PersonTarabalam {
  tara: string;
  status: 'good' | 'bad';
  personName: string;
}

@Injectable({ providedIn: 'root' })
export class PanchangService {
  private allNakshatras: string[] = [];

  
  // 'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  // 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  // 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  // 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  // 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'

  constructor(private dbService: DBService,
              private nakshatraService: NakshatraService,
  ) {
    this.allNakshatras = this.nakshatraService.getAllNakshatras();
  }

  async getPeopleNakshatras(): Promise<PersonProfile[]> {
    return await this.dbService.getAllProfiles();
  }

  async savePerson(data: PersonProfile): Promise<number> {
    return await this.dbService.addProfile(data);
  }

  getTarabalam(todayNakshatra: string, birthNakshatra: string): { tara: string; status: 'good' | 'bad' } {
    const todayIndex = this.allNakshatras.indexOf(todayNakshatra);
    const birthIndex = this.allNakshatras.indexOf(birthNakshatra);
    if (todayIndex === -1 || birthIndex === -1) return { tara: 'Unknown', status: 'bad' };

    const distance = (todayIndex - birthIndex + 27) % 27;
    const cycle = distance % 9;
    const taraNames = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhana', 'Naidhana', 'Mitra', 'Parama Mitra'];
    const tara = taraNames[cycle];
    const goodTaras = ['Sampat', 'Kshema', 'Sadhana', 'Mitra', 'Parama Mitra'];

    return {
      tara,
      status: goodTaras.includes(tara) ? 'good' : 'bad'
    };
  }

  getAllNakshatras() {
    return this.allNakshatras;
  }
}
