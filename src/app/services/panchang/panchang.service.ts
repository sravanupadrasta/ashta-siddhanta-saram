// panchang.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface PersonNakshatra {
  name: string;
  nakshatra: string;
}

@Injectable({ providedIn: 'root' })
export class PanchangService {
  private allNakshatras = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
    'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
    'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
    'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
  ];

  constructor(private firestore: Firestore) {}

  getPeopleNakshatras(): Observable<PersonNakshatra[]> {
    const col = collection(this.firestore, 'users/demo/nakshatras');
    return collectionData(col, { idField: 'id' }) as Observable<PersonNakshatra[]>;
  }

  savePerson(data: PersonNakshatra) {
    const col = collection(this.firestore, 'users/demo/nakshatras');
    return addDoc(col, data);
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
