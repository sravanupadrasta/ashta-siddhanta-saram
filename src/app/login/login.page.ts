import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  isPasswordReset = false;

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loader = await this.loadingCtrl.create({
      message: 'Signing in...',
      spinner: 'circles',
    });
    await loader.present();

    const { email, password } = this.loginForm.getRawValue();
    this.auth.login(email, password).subscribe(async (user) => {
      await loader.dismiss();
      if (!user) {
        const alert = await this.alertCtrl.create({
          header: 'Login failed',
          message: 'Invalid email or password. Use the credentials shared by your administrator.',
          buttons: ['OK'],
        });
        await alert.present();
        return;
      }
      await this.router.navigate(['/tabs']);
    });
  }

  toggleMode(): void {
    this.isPasswordReset = !this.isPasswordReset;
  }

  async onForgotPassword(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const loader = await this.loadingCtrl.create({
      message: 'Generating password...',
      spinner: 'lines',
    });
    await loader.present();

    const { email } = this.forgotForm.getRawValue();
    this.auth.forgotPassword(email).subscribe(async (password) => {
      await loader.dismiss();
      const alert = await this.alertCtrl.create({
        header: password ? 'Password reset' : 'Account not found',
        message: password
          ? `A temporary password has been generated: <strong>${password}</strong>. Use it to sign in and update your credentials.`
          : 'No account is registered with the provided email address.',
        buttons: ['OK'],
      });
      await alert.present();
      if (password) {
        this.isPasswordReset = false;
        this.loginForm.patchValue({ email, password });
      }
    });
  }
}
