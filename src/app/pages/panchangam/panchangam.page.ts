import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonBadge,
  IonText,
  IonDatetime,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { PersonProfile } from 'src/app/services/db/db.service';
import { NakshatraService, Panchanga } from 'src/app/services/nakshatra/nakshatra.service';
import { PanchangService, PersonTarabalam } from 'src/app/services/panchang/panchang.service';
import { ThidhiService } from 'src/app/services/thidhi/thidhi.service';

@Component({
  selector: 'app-panchangam',
  templateUrl: './panchangam.page.html',
  styleUrls: ['./panchangam.page.scss'],
  standalone: true,
  imports: [
    IonDatetime,
    IonText,
    IonBadge,
    IonButton,
    IonLabel,
    IonItem,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonTitle,
    IonToolbar,
    IonHeader,
    CommonModule,
    FormsModule,
  ],
})
export class PanchangamPage implements OnInit {
  panchanga: Panchanga;
  date: string = new Date(Date.now()).toISOString();
  showCalendar: boolean = false;

  currentTithiName = '';
  currentTithiStart = '';
  currentTithiEnd = '';
  nextTithiName = '';
  nextTithiEnd = '';
  people: PersonProfile[] = [];
  tarabalam: PersonTarabalam[] = [];
  newPerson: PersonProfile = { name: '', nakshatra: '' };
  nakshatras: string[] = [];
  todayNakshatra = '';

  constructor(
    private nakshatraService: NakshatraService,
    private thidhiService: ThidhiService,
    public panchangService: PanchangService
  ) {
    this.panchanga = {
      nakshatra: {
        name: '',
        start: new Date(),
        end: new Date(),
      },
      nextNakshatra: {
        name: '',
        start: new Date(),
        end: new Date(),
      },
    };
  }

  async ngOnInit() {
    this.getPanchanga();
    this.nakshatras = this.panchangService.getAllNakshatras();
    this.people = await this.panchangService.getPeopleNakshatras();
    this.getTarabalam();
  }

  getPanchanga(): void {
    this.panchanga = this.nakshatraService.determineNakshatraStartEnd(
      new Date(this.date)
    );
    const { current, next } = this.thidhiService.getCurrentAndNextThidhi(
      new Date(this.date)
    );

    this.currentTithiName = `${current.phase} Paksha - ${current.thidhi}`;
    this.currentTithiStart = current.start.toLocaleString();
    this.currentTithiEnd = current.end.toLocaleString();

    this.nextTithiName = `${next.phase} Paksha - ${next.thidhi}`;
    this.nextTithiEnd = next.end.toLocaleString();
  }

  getTarabalam(): void {
    this.people.forEach((person) => {
      const tara = this.panchangService.getTarabalam(
        this.panchanga.nakshatra.name,
        person.nakshatra
      );
      this.tarabalam.push({
        tara: tara.tara,
        status: tara.status,
        personName: person.name,
      });
    });
  }

  onDateChange(event: any): void {
    this.date = event.detail.value;
    this.getPanchanga();
  }

  toggleCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  savePerson() {
    if (!this.newPerson.name || !this.newPerson.nakshatra) return;
    this.panchangService.savePerson(this.newPerson).then((x) => {
      console.log('Saved:', x);
      this.newPerson = { name: '', nakshatra: '' };
    });
  }
}
