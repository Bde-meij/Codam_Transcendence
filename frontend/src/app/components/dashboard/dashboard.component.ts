import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/sock/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';
import { Observable } from 'rxjs';
// import { UserInterface } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { SockService } from '../../services/sock/sock.service';
import { User } from '../../models/user.class';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LogoutComponent, AsyncPipe, JsonPipe, NgIf],
  providers: [SockService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
	title = "Gary's basement";

	user$ : Observable<User> | undefined;

	unread = this.chatService.isUnread();

	constructor(private userService: UserService, private chatService: ChatService, private router: Router) {
	};

	ngOnInit(): void {
		this.user$ = this.userService.getUser();
		// this.user$.subscribe((user: UserInterface) => {
		// 	this.title = "Gary's basement with: " + user.nickname;
		// 	// console.log(user.nickname);
		//   });
	}

	isNotHomeRoute() {
		return (!(this.router.url === '/dashboard/home'));
	}

	// testvalue = window.Cookies
}
