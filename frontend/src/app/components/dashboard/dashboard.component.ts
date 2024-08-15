import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/sock/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [RouterLink, RouterOutlet, LogoutComponent, AsyncPipe, JsonPipe, NgIf],
	providers: [],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
	title = '';
	unread = this.chatService.isUnread();

	constructor(private chatService: ChatService, private router: Router, route: ActivatedRoute) {
		route.data.subscribe(data =>
			this.title = data['title']
		)
	};

	isNotHomeRoute() {
		return (!(this.router.url === '/dashboard/home'));
	}
}
