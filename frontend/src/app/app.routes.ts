import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';
import { FriendsComponent } from './components/friends/friends.component';
import { AccountComponent } from './components/account/account.component';
import { AuthGuard } from './authguard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ChatComponent } from './components/chat/chat.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
	{
		path: '',
		title: "Gary's basement",
		redirectTo: 'dashboard',
		pathMatch: "full"
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
		data: { title: "Gary's basement" }
	},
	{
		path: 'register',
		component: RegisterComponent,
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'home',
				component: HomeComponent,
			},
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