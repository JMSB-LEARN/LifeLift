import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterModule} from '@angular/router';
import { HeaderComponent } from "./header-component/header-component";
import { FooterComponent } from "./footer-component/footer-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent,RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('LifeLift');
}
