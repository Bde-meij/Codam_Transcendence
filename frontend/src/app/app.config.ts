import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideHttpClient(),
		provideAuth0({
			domain: '{YOUR_AUTH0_DOMAIN}',
			clientId: '{YOUR_AUTH0_CLIENT_ID}',
			authorizationParams: {
				redirect_uri: window.location.origin
			}
		}),
	]
};
