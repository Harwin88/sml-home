import { Routes } from '@angular/router';
import { ProviderSearchComponent } from './features/search/provider-search.component';
import { ProviderProfileComponent } from './features/search/provider-profile.component';
import { LandingPageComponent } from './features/landing/landing-page.component';
import { TermsComponent } from './features/legal/terms.component';
import { PrivacyComponent } from './features/legal/privacy.component';
import { CookiesComponent } from './features/legal/cookies.component';
import { NoticeComponent } from './features/legal/notice.component';
import { HelpComponent } from './features/support/help.component';
import { ContactComponent } from './features/support/contact.component';
import { UserProfileComponent } from './features/profile/user-profile.component';
import { FavoritesComponent } from './features/profile/favorites.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'search', component: ProviderSearchComponent },
  { path: 'provider/:id', component: ProviderProfileComponent },
  { path: 'help', component: HelpComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'legal/terms', component: TermsComponent },
  { path: 'legal/privacy', component: PrivacyComponent },
  { path: 'legal/cookies', component: CookiesComponent },
  { path: 'legal/notice', component: NoticeComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'profile/favorites', component: FavoritesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
