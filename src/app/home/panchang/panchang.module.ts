import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PanchangPageRoutingModule } from './panchang-routing.module';

import { PanchangPage } from './panchang.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PanchangPageRoutingModule
  ],
  declarations: [PanchangPage]
})
export class PanchangPageModule {}
