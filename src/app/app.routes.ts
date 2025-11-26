import { Routes } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { LogInComponent } from './log-in-component/log-in-component';
import { SignUpComponent } from './sign-up-component/sign-up-component';
import { NotFoundComponent } from './not-found-component/not-found-component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LogInComponent},
    {path: 'signup', component: SignUpComponent},



    {path: '**', component: NotFoundComponent}
];
