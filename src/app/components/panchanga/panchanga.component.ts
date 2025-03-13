import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NakshatraService, Panchanga } from 'src/app/services/nakshatra.service';

@Component({
  selector: 'app-panchanga',
  templateUrl: './panchanga.component.html',
  styleUrls: ['./panchanga.component.scss'],
  standalone: false
})
export class PanchangaComponent  implements OnInit {

  panchanga: Panchanga;
  date: string = new Date(Date.now()).toISOString();
  showCalendar: boolean = false;

  constructor(private nakshatraService: NakshatraService) {
    this.panchanga = {
      nakshatra: {
        name: '',
        start: new Date(),
        end: new Date()
      },
      nextNakshatra: {
        name: '',
        start: new Date(),
        end: new Date()
      }
    };
  }

  ngOnInit(): void {
    this.getPanchanga();
  }

  getPanchanga(): void {
    this.panchanga = this.nakshatraService.determineNakshatraStartEnd(new Date(this.date));
  }

  onDateChange(event: any): void {
    this.date = event.detail.value;
    this.getPanchanga();
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

}
