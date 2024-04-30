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

	constructor(private chatService: ChatService) {};
	
	ngOnInit() {
		this.chatService.getMessages().subscribe((newmessage ) => {
			this.messages.push(newmessage);
		})
	};

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message);
			this.messages.push(this.message);
		}
		this.message = '';
	}
}