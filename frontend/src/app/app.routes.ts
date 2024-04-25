import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';
import { FriendsComponent } from './components/friends/friends.component';
import { AccountComponent } from './components/account/account.component';
import { AuthGuard } from './authguard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CallbackComponent } from './components/callback/callback.component';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: "full"
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
	},
	{
		path: 'callback',
		component: CallbackComponent,
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
			{
				path: 'chat',
				component: ChatComponent,
			},
		],
	},
	{
		path: '**',
		pathMatch: "full",
		component: PageNotFoundComponent,
	},
];