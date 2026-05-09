import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { api } from '../api/ApiClient';
import AuthService from '../api/AuthService';

@Component({
  selector: 'app-family-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './family-page.html',
  styleUrl: './family-page.css',
})
export class FamilyPage implements OnInit {
  profile: any = null;
  socioEconomic: any = null;
  housemates: any[] = [];
  loading = true;

  async ngOnInit() {
    this.loading = true;
    try {
      if (!AuthService.isLoggedIn()) {
        this.loading = false;
        return;
      }
      
      const [profileRes, socioRes, housematesRes] = await Promise.all([
        api.client.get('/profile'),
        api.client.get('/socio-economic'),
        api.client.get('/housemates')
      ]);

      this.profile = profileRes.data;
      this.socioEconomic = socioRes.data;
      this.housemates = housematesRes.data;
    } catch (err) {
      console.error('Error fetching family data', err);
    }
    this.loading = false;
  }

  get householdSize(): number {
    return 1 + (this.socioEconomic?.number_of_children || 0) + this.housemates.length;
  }

  get totalIncome(): number {
    const userIncome = this.socioEconomic?.gross_annual_income || 0;
    const housematesIncome = this.housemates.reduce((sum, h) => sum + (Number(h.income_annual) || 0), 0);
    return userIncome + housematesIncome;
  }
}
