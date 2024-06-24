import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/sock/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { SockService } from '../../services/sock/sock.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LogoutComponent, AsyncPipe, JsonPipe, NgIf],
  providers: [SockService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
	title = '';
	unread = this.chatService.isUnread();

	constructor(private chatService: ChatService, private router: Router, route: ActivatedRoute) {
		route.data.subscribe(data =>
			this.title = data['title']
		)
	};

	ngOnInit(): void {
	}

	isNotHomeRoute() {
		return (!(this.router.url === '/dashboard/home'));
	}
}
