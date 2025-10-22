import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdminPanelPageRoutingModule } from './admin-panel-routing.module';
import { AdminPanelPage } from './admin-panel.page';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, AdminPanelPageRoutingModule],
  declarations: [AdminPanelPage],
})
export class AdminPanelPageModule {}
