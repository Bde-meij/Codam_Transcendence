import { Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';
import { BossGameComponent } from './components/bossGame/bossGame.component';
import { FriendsComponent } from './components/friends/friends.component';
import { AccountComponent } from './components/account/account.component';
import { AuthGuard } from './authguard';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ChatComponent } from './components/chat/chat.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { GameMenuComponent } from './components/game-menu/game-menu.component';
import { TwofaComponent } from './components/twofa/twofa.component';
import { constTitle } from './models/title.const';
import { ChatUiComponent } from './components/chat-fran/chat-fran.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'dashboard',
		pathMatch: "full"
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
		// data: { title: "Gary's basement" }
		data: {title: constTitle}
	},
	{
		path: 'register',
		component: RegisterComponent,
	},
	{
		path: 'twofa',
		component: TwofaComponent,
	},
	{
		path: 'dashboard',
		component: DashboardComponent,
		data: { title: constTitle },
		canActivate: [AuthGuard],
		children: [
			{
				path: 'home',
				component: HomeComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'settings',
				component: SettingsComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'game',
				component: GameComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'bossPong',
				component: BossGameComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'game-menu',
				component: GameMenuComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'friends',
				component: FriendsComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'account',
				component: AccountComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'chat',
				component: ChatComponent,
				canActivate: [AuthGuard],
			},
			{
				path: 'franchat',
				component: ChatUiComponent,
				canActivate: [AuthGuard],
			},
		],
	},
	{
		path: '**',
		pathMatch: "full",
		component: PageNotFoundComponent,
	},
];