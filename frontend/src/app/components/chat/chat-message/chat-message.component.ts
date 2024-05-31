import { Component, Input } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { Rooms } from '../../../models/rooms.class';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/sock/chat/chat.service';
import { NgIf, CommonModule } from '@angular/common';

export interface MessageInterface {
	sender: string,
	room: string,
	message: string
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [NgFor, FormsModule, AsyncPipe, NgIf, CommonModule ],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})

export class ChatMessageComponent {
	@Input() room: any;
	
	message: string | undefined;
	messages: string[] = [];

	constructor(private chatService: ChatService) {};
	
	ngOnInit() {
		this.chatService.getMessages().subscribe((newmessage: any ) => {
			this.messages.push(newmessage.message);
		})
	}

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message, this.room);
			// this.messages.push(this.message);
		}
		this.message = '';
		console.log("sendmessage: " + this.room);
	}
}
