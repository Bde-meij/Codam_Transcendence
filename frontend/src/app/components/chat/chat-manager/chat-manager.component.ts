// import { Component, OnInit } from '@angular/core';
// import { AsyncPipe, NgFor } from '@angular/common';

// import { FormsModule } from '@angular/forms';
// import { ChatService } from '../../../services/sock/chat/chat.service';

// export interface MessageInterface {
// 	sender: string,
// 	message: string
// }

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [NgFor, FormsModule, AsyncPipe],
//   templateUrl: './chat.component.html',
//   styleUrl: './chat.component.scss'
// })
// export class ChatComponent implements OnInit {
// 	message: string | undefined;
// 	messages: string[] = [];
// 	rooms: string | undefined;
// 	userList: string | undefined;
// 	roomName: string | undefined;
// 	constructor(private chatService: ChatService) {};
	
// 	ngOnInit() {
// 		this.chatService.getMessages().subscribe((newmessage ) => {
// 			this.messages.push(newmessage);
// 		})
// 		this.chatService.getRooms().subscribe((roomList) => {
// 			this.rooms = roomList;
// 			//console.log("getRooms frontend");
// 		})
// 		this.chatService.getUserList().subscribe((userList) => {
// 			this.userList = userList;
// 		})
// 	};

// 	sendMessage() {
// 		if (this.message) {
// 			this.chatService.sendMessage(this.message);
// 			this.messages.push(this.message);
// 		}
// 		this.message = '';
// 	}

// 	createRoom(roomName: string) {
// 		if (roomName) {
// 		  this.chatService.createRoom(roomName);
// 		  this.roomName = '';
// 		}
// 	}

// 	getRooms() {
// 		this.chatService.getRooms();
// 	}

// 	joinRoom(data: string) {
// 		//console.log("joinroom component: " + data);
// 		this.chatService.joinRoom(data);
// 	}

// 	sendUserList(data: string) {
// 		//console.log("sendUserList: " + data);
// 		this.chatService.sendUserList(data);
// 	}
// }
