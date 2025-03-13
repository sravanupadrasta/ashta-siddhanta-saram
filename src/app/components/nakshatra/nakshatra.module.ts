import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NakshatraComponent } from './nakshatra.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [NakshatraComponent],  // ✅ Declare component here
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [NakshatraComponent]  // ✅ Export it so other modules can use it
})
export class NakshatraModule {}
