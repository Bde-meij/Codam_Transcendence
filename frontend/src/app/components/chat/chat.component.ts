import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit {
	message: string | undefined;
	messages: string[] = [];

	constructor(private chatService: ChatService) {};
	
	ngOnInit() {
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

	// sendMessage() {
	// 	this.chatService.sendMessage(this.message);
	// 	this.message = '';
	// }

}
