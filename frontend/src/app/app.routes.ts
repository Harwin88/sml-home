import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './features/search/provider-search.component';
import { ProviderProfileComponent } from './features/search/provider-profile.component';
import { LandingPageComponent } from './features/landing/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'search', component: ProviderSearchComponent },
  { path: 'provider/:id', component: ProviderProfileComponent },
  { path: '**', redirectTo: '' }
];
