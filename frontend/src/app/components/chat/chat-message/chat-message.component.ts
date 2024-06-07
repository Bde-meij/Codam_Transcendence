import { Component, Input, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { Rooms } from '../../../models/rooms.class';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/sock/chat/chat.service';
import { NgIf, CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

export interface MessageInterface {
	sender: string,
	room: string,
	message: string
}

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [NgFor, FormsModule, NgIf, CommonModule, MatSelectModule, MatButtonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})

export class ChatMessageComponent implements AfterViewInit{
	@ViewChild('messageContainer') messageContainer!: ElementRef;
	@ViewChild('messageInput') messageInput!: ElementRef;
	@Input() room: any;
	selectedUser: any;
	
	message: string | undefined;
	// messages: string[] = [];

	constructor(private chatService: ChatService, private router: Router) {};
	
	ngOnInit() {
	}

	ngAfterViewInit() {
		this.scrollToBottom();
	}
	
	scrollToBottom() {
		try {
			const container = this.messageContainer.nativeElement;
			container.scrollTop = container.scrollHeight - container.clientHeight + 50;
		} catch(err) { }
	}

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message, this.room.name);
			this.scrollToBottom()
			this.messageInput.nativeElement.focus();
		}
		this.message = '';
		console.log("chat-message sendmessage: " + this.room.name);
	}

	leaveRoom(room: string, userid: string) {
		console.log("chat-message component leaveRoom: " + room + ", id: " + userid);
		this.chatService.leaveRoom(room, userid);
		// console.log("chat-message sendmessage: " + this.room.name);
	}

	battle(userid: string){
		// console.log("FIGHTING------FIGHTING");
		this.router.navigate(['/dashboard', 'game']);
	}

	time(created: Date | undefined){
		if (created){
		const hours = created.getHours().toString().padStart(2, '0');
		const minutes = created.getMinutes().toString().padStart(2, '0');
		const time = `${hours}:${minutes}`;
		const timeString = created.toLocaleTimeString();
    	console.log("Message time:", timeString);
		console.log("time: " + time);}
		else{
			console.log("Created date is undefined");
		}
		// return (time);
	}
}
