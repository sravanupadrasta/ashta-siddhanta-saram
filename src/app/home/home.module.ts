import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { NakshatraComponent } from '../components/nakshatra/nakshatra.component';
import { NakshatraModule } from '../components/nakshatra/nakshatra.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    HomePage,
    NakshatraModule
  ],
  declarations: [ ]
})
export class HomePageModule {}
