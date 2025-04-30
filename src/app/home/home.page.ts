import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonLabel,
  IonIcon, IonTabs, IonTabBar, IonTabButton, ModalController, AlertController } from '@ionic/angular/standalone';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonTabButton, IonTabBar, IonTabs, IonIcon, IonLabel, CommonModule ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(private swUpdate: SwUpdate,
              private alertCtrl: AlertController) {
                this.checkForUpdates();
              }

  ngOnInit() {
    setInterval(() => {
      this.swUpdate.checkForUpdate().then((x) => {
        console.log('Checking for updates...');
        if (x) {
          console.log('Update available');
        } else {
          console.log('No update available');
        }
      });
    }, 6 * 60 * 60 * 1000);
  }

  async checkForUpdates() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(async (event) => {
        if (event.type === 'VERSION_READY') {
          const alert = await this.alertCtrl.create({
            header: 'New Version Available',
            message: 'A new version of Ashta Siddhanta Saram is ready. Would you like to update now?',
            buttons: [
              {
                text: 'Later',
                role: 'cancel',
                handler: () => {
                  // User chose not to update now
                }
              },
              {
                text: 'Update Now',
                handler: async () => {
                  await this.swUpdate.activateUpdate();
                  document.location.reload();
                }
              }
            ],
            backdropDismiss: false, // force decision
            cssClass: 'update-alert' // (optional) for custom styling
          });
          await alert.present();
        }
      });
    }
  }
}
