import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		provideHttpClient(),
		// provideAuth0({
		// 	domain: 'http://api.intra.42.fr/v2/oauth',
		// 	clientId: 'u-s4t2ud-7ae181090888396e717cc9cdec0e0ff9a312c655e22ea37b1cc2e426536847cb',
		// 	authorizationParams: {
		// 		redirect_uri: window.location.origin,
		// 		scope: 'public',
		// 		responseType: 'code',
		// 	},
		// }),
	]
};
