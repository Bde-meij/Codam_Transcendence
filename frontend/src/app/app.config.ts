import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './services/auth/auth.service';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorInterceptor } from './interceptors/jwtToken.interceptor';
import { NbChatModule, NbLayoutModule, NbSidebarService, NbThemeModule, NbCardModule, NbDialogModule } from '@nebular/theme';
import { PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';

export const appConfig: ApplicationConfig = {
	providers: [
		importProvidersFrom(
			NbThemeModule.forRoot({ name: 'default' }),
			NbLayoutModule,
			NbChatModule.forRoot(),
			NbCardModule,
			NbDialogModule.forRoot(),
		  ),
		provideRouter(routes, withComponentInputBinding(), withRouterConfig({
			onSameUrlNavigation: 'reload',
		})),
		provideHttpClient(withInterceptorsFromDi()),
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
		{ provide: PRECONNECT_CHECK_BLOCKLIST, useValue: window.location.hostname },
		{ provide: AuthService },
		provideAnimationsAsync(),
	]
};
