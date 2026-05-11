import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-page.html',
  styleUrls: ['./about-page.css']
})
export class AboutPage {
}
