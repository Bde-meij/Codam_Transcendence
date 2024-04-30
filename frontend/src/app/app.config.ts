import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
// import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './services/chat/chat.service';
// import { provideAuth0 } from '@auth0/auth0-angular';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		// provideHttpClient(),
		{ provide: ChatService },
	]
};
