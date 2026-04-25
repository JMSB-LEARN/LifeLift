import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import AuthService from '../api/AuthService';
import type { User } from '../api/AuthService';

@Component({
  selector: 'app-home-component',
  imports: [RouterModule, CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;

  ngOnInit(): void {
    this.currentUser = AuthService.getCurrentUser();
    this.isLoggedIn = AuthService.isLoggedIn();
  }
}
