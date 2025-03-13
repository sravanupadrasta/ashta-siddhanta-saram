// src/app/services/ashta-siddhanta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AshtaRecord {
  StartTime: string;
  EndTime: string;
  DayOfWeek: string;
  Result: string;
  Status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AshtaSiddhantaService {
  private dataUrl = 'assets/data/AshtaSiddhantaSara.json';

  constructor(private http: HttpClient) {}

  getData(): Observable<AshtaRecord[]> {
    return this.http.get<AshtaRecord[]>(this.dataUrl);
  }
}
