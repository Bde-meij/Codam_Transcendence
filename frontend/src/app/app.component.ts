import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatService } from './services/chat/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
	constructor(private chatService : ChatService) {};

	ngOnInit() {
		this.chatService.newUserRegister();
	}

	title = "Gary's basement";
}
