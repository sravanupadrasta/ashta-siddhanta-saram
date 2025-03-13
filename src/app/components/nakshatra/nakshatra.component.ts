import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NakshatraService, Panchanga } from 'src/app/services/nakshatra.service';

@Component({
  selector: 'app-nakshatra',
  templateUrl: './nakshatra.component.html',
  styleUrls: ['./nakshatra.component.scss'],
  standalone: false,
})
export class NakshatraComponent implements OnInit {
  panchanga: Panchanga;
  date: Date = new Date();

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
    this.panchanga = this.nakshatraService.determineNakshatraStartEnd(this.date);
  }
}
