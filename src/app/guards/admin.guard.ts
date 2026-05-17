import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import AuthService from '../api/AuthService';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    if (AuthService.isAdmin()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
