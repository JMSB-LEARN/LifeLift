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
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    const { username, password } = this.loginForm.value;

    try {
      await AuthService.login(username, password);
      console.log('Login successful');
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Login failed', error);
      this.errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';
    }
  }
}