import { Routes } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
// import { WelcomeComponent } from '/src/app/components/welcome/welcome.component'

export const routes: Routes = [
	{
		path: 'settings',
		component: SettingsComponent,
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
	},
];
