import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './features/search/provider-search.component';
import { ProviderProfileComponent } from './features/search/provider-profile.component';

export const routes: Routes = [
  { path: '', component: ProviderSearchComponent },
  { path: 'provider/:id', component: ProviderProfileComponent },
  { path: '**', redirectTo: '' }
];
