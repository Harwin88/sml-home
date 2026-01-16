import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { ConfigService } from './core/services/config.service';

export function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            routes,
            withInMemoryScrolling({
                scrollPositionRestoration: 'top',
                anchorScrolling: 'enabled'
            })
        ),
        provideHttpClient(),
        provideAnimations(),
        ConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [ConfigService],
            multi: true
        }
    ]
};
