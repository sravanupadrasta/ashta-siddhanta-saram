import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-anandadiyogam',
  templateUrl: './anandadiyogam.page.html',
  styleUrls: ['./anandadiyogam.page.scss'],
  standalone: true,
  imports: [IonContent, IonTitle, IonToolbar, IonHeader]
})
export class AnandadiyogamPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
