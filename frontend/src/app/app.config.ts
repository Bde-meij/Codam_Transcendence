import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './services/auth/auth.service';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ErrorInterceptor } from './interceptors/jwtToken.interceptor';
import { NbChatModule, NbIconModule, NbLayoutModule, NbSidebarModule, NbSidebarService, NbThemeModule } from '@nebular/theme';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(routes),
		importProvidersFrom(
			NbThemeModule.forRoot({ name: 'default' }),
			NbLayoutModule,
			NbChatModule.forRoot(),
			NbIconModule,
			NbSidebarModule.forRoot(),
		  ),
		  NbSidebarService,
		provideRouter(routes, withRouterConfig({
			onSameUrlNavigation: 'reload'
		})),
		provideHttpClient(withInterceptorsFromDi()),
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
		{ provide: AuthService },
		{ provide: CookieService },
		provideAnimationsAsync(), provideAnimationsAsync(),
	]
};
