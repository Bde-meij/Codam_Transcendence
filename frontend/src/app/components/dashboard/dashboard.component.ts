import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ChatService } from '../../services/chat/chat.service';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, LogoutComponent],
  providers: [ChatService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
	title = "Gary's basement";
}
