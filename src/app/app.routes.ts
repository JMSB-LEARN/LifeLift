import { Routes } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { LogInComponent } from './log-in-component/log-in-component';
import { SignUpComponent } from './sign-up-component/sign-up-component';
import { MyProfilePage } from './my-profile-page/my-profile-page';
import { CentersPage } from './centers-page/centers-page';
import { FamilyPage } from './family-page/family-page';
import { SubsidesPage } from './subsides-page/subsides-page';
import { UnemploymentPage } from './unemployment-page/unemployment-page';
import { NotFoundComponent } from './not-found-component/not-found-component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: LogInComponent},
    {path: 'signup', component: SignUpComponent},
    {path: 'home', component: HomeComponent},
    {path: 'profile', component: MyProfilePage},
    {path: 'centers', component: CentersPage},
    {path: 'family', component: FamilyPage},
    {path: 'subsides', component: SubsidesPage},
    {path: 'unemployment', component: UnemploymentPage},
    {path: '**', component: NotFoundComponent}
];
