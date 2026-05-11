import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import AuthService from '../api/AuthService';

@Component({
  selector: 'app-header-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.css',
})
export class HeaderComponent {

  get isLoggedIn(): boolean {
    return AuthService.isLoggedIn();
  }

  async logout() {
    await AuthService.logout();
    window.location.reload();
    window.location.href = '/';
  }

}
