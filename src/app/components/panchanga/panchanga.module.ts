import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanchangaComponent } from './panchanga.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PanchangaComponent],  // ✅ Declare component here
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [PanchangaComponent]  // ✅ Export it so other modules can use it
})
export class PanchangaModule {}
