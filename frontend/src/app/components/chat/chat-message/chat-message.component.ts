import { Component, Input, ViewChild, ElementRef, AfterViewInit  } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { User } from '../../../models/user.class';
import { Rooms } from '../../../models/rooms.class';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/sock/chat/chat.service';
import { NgIf, CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';

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
	@Input() user!: User;
	selectedUser: any;
	selectedUserID: any;
	
	message: string | undefined;
	// messages: string[] = [];

	constructor(private chatService: ChatService, private router: Router, private userService :UserService) {};
	
	ngOnInit() {
		console.log("user message:")
		console.log(this.user)
		// this.user.avatar = 
		// this.userService.getAvatar(this.senderID).subscribe((data) => (
		// 	this.user.avatar = URL.createObjectURL(data)
		// ))
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
		console.log("room users: " + this.room.users);
		console.log(this.room.users)

		//console.log("chat-message sendmessage: " + this.room.name);
	}

	leaveRoom(room: string, userid: string) {
		//console.log("chat-message component leaveRoom: " + room + ", id: " + userid);
		this.chatService.leaveRoom(room, userid);
		// //console.log("chat-message sendmessage: " + this.room.name);
	}

	battle(userid: number){
		// //console.log("FIGHTING------FIGHTING");
		console.log("chat-message.component userid: " + userid + ", room name: " + this.room.name);
		this.chatService.battle(this.room.name, this.room.id, userid)
		this.router.navigate(['/dashboard', 'game']);
	}
	joinBattle(roomnum: string){
		console.log(`chat-message.component ${roomnum}`)
		this.chatService.joinBattle(roomnum);
		this.router.navigate(['/dashboard', 'game']);
	}

	mute(userid: string){
		// //console.log("FIGHTING------FIGHTING");
		this.chatService.muteUser(this.room.id, userid);
	}

	ban(userid: string){
		// //console.log("FIGHTING------FIGHTING");
		this.chatService.banUser(this.room.id, userid);
	}

	kick(userid: string){
		// //console.log("FIGHTING------FIGHTING");
		this.chatService.kickUser(this.room.id, userid);
	}

	time(created: Date | undefined){
		if (created){
			const hours = created.getHours().toString().padStart(2, '0');
			const minutes = created.getMinutes().toString().padStart(2, '0');
			const time = `${hours}:${minutes}`;
			const timeString = created.toLocaleTimeString();
			//console.log("Message time:", timeString);
			//console.log("time: " + time);
		}
		else{
			console.log("Created date is undefined");
		}
		// return (time);
	}

	isEven(senderId: number): boolean {
		return senderId % 2 === 0;
	}

	
}
