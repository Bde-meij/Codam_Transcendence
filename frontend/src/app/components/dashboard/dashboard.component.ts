import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/sock/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';
import { Observable } from 'rxjs';
import { UserInterface } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { SockService } from '../../services/sock/sock.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LogoutComponent, AsyncPipe, JsonPipe],
  providers: [SockService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
	title = "Gary's basement";

	user$ : Observable<UserInterface> | undefined;

	constructor(private userService: UserService, private chatService: ChatService) {
	};

	ngOnInit(): void {
		this.user$ = this.userService.getUser();
	}
}
