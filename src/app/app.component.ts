import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { airplaneOutline, arrowDown, calendarOutline, homeOutline, locationOutline, personOutline, planetOutline, todayOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonApp, ]
})
export class AppComponent {
  constructor() {
    addIcons({
      'home-outline': homeOutline,
      'person-outline': personOutline,
      'today-outline': todayOutline,
      'calendar-outline': calendarOutline,
      'airplane-outline': airplaneOutline,
      'planet-outline': planetOutline,
      'arrow-down': arrowDown,
      'location-outline': locationOutline
    });
  }
}
