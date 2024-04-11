import { Routes } from '@angular/router';
import { SettingsComponent } from './components/settings/settings.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { FriendsComponent } from './components/friends/friends.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/welcome',
		pathMatch: "full"
	},
	{
		path: 'settings',
		component: SettingsComponent,
	},
	{
		path: 'welcome',
		component: WelcomeComponent,
	},
	{
		path: 'friends',
		component: FriendsComponent,
	},
	{
		path: 'game',
		component: GameComponent,
	},
];
