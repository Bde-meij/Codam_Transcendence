import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthGuard } from './shared/AuthGuard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';
import { FriendsComponent } from './components/friends/friends.component';
import { AccountComponent } from './components/account/account.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'welcome',
		pathMatch: "full"
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'settings',
				component: SettingsComponent,
			},
			{
				path: 'game',
				component: GameComponent,
			},
			{
				path: 'friends',
				component: FriendsComponent,
			},
			{
				path: 'account',
				component: AccountComponent,
			},
		],
	},
];


// export const routes: Routes = [
// 	{
// 		path: '',
// 		component: AppComponent,
// 		// redirectTo: '/welcome',
// 		// pathMatch: "full"
// 	},
// 	{
// 		path: 'welcome',
// 		component: WelcomeComponent,
// 	},
// 	{
// 		path: 'friends',
// 		component: FriendsComponent,
// 	},
// 	{
// 		path: 'game',
// 		component: GameComponent,
// 	},
// 	{
// 		path: 'settings',
// 		component: SettingsComponent,
// 	},
// ];
