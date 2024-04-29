import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, AsyncPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
	message: string | undefined;
	messages: string[] = [];
	mes$: Observable<string> | undefined;

	constructor(private chatService: ChatService) {};
	
	ngOnInit() {
		this.mes$ = this.chatService.getMessages();

		this.chatService.getMessages().subscribe((message : string ) => {
			this.messages.push(message);
		})
	};

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message);
		}
		this.message = '';
	}
}
