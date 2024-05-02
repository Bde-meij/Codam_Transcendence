import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';
import { Observable } from 'rxjs';
import { UserInterface } from '../../models/user.class';
import { UserService } from '../../services/user/user.service';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LogoutComponent, AsyncPipe, JsonPipe],
  providers: [ChatService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
	title = "Gary's basement";

	user$ : Observable<UserInterface> | undefined;

	constructor(private userService: UserService) {
		this.user$ = userService.getUser();
	};
}
