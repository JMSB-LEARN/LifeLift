import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import AuthService from '../api/AuthService';

@Component({
  selector: 'app-sign-up-component',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sign-up-component.html',
  styleUrl: './sign-up-component.css',
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  signUpForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  get username(): AbstractControl | null {
    return this.signUpForm.get('username');
  }

  get email(): AbstractControl | null {
    return this.signUpForm.get('email');
  }

  get password(): AbstractControl | null {
    return this.signUpForm.get('password');
  }

  get passwordConfirm(): AbstractControl | null {
    return this.signUpForm.get('passwordConfirm');
  }

  get firstName(): AbstractControl | null {
    return this.signUpForm.get('firstName');
  }

  get surname(): AbstractControl | null {
    return this.signUpForm.get('surname');
  }

  get secondSurname(): AbstractControl | null {
    return this.signUpForm.get('secondSurname');
  }

  constructor() {
    this.signUpForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required],
        firstName: ['', Validators.required],
        surname: ['', Validators.required],
        secondSurname: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const passwordConfirm = control.get('passwordConfirm');

    if (password && passwordConfirm && password.value !== passwordConfirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSignUp(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.signUpForm.valid) {
      this.signUpForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.isLoading = true;

    try {
      const { username, email, password, firstName, surname, secondSurname } = this.signUpForm.value;

      await AuthService.register({
        username,
        email,
        password,
        first_name: firstName,
        surname,
        second_surname: secondSurname || null,
      });

      this.successMessage = 'Account created successfully! Redirecting to login...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      console.error('Sign up failed', error);
      this.errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Sign up failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
