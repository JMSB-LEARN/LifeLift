import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import AuthService from '../api/AuthService';

@Component({
  selector: 'app-log-in-component',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './log-in-component.html',
  styleUrls: ['./log-in-component.css'],
})
export class LogInComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loginForm: FormGroup;
  errorMessage = '';

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onLogin() {
    this.errorMessage = '';

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Por favor complete todos los campos.';
      return;
    }

    const { username, password } = this.loginForm.value;

    try {
      await AuthService.login(username, password);
      console.log('Inicio de sesión exitoso');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Inicio de sesión fallido', error);
      this.errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
    }
  }
}