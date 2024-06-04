import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { ChatService } from '../../services/sock/chat/chat.service';
import { FormsModule } from '@angular/forms';
import { Rooms } from '../../models/rooms.class';
import { ChatMessageComponent } from './chat-message/chat-message.component';

export interface MessageInterface {
	sender: string,
	message: string
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, AsyncPipe, ChatMessageComponent, NgIf, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})

export class ChatComponent implements OnInit {
	message: string | undefined;
	messages: string[] = [];
	rooms: Rooms[] = []; 
	roomss: Rooms[] = []; 

	userList: string[] | undefined;
	userss: string[] | undefined;
	roomName: string | undefined;
	test: string[] | undefined;
	
	selectedRoom?: Rooms;
	
	onSelect(room: Rooms): void {
		this.selectedRoom = room;
		console.log(room);
  	};

	constructor(private chatService: ChatService) {};
	
	ngOnInit() {
		this.chatService.getMessages().subscribe((newmessage: any ) => {
			this.messages.push(newmessage.message);
		})
		this.chatService.getRooms().subscribe((roomList: any) => {
			this.rooms.push(roomList);
			console.log("getRooms frontend");
		})
		this.chatService.getRoomss().subscribe((roomList: any) => {
			this.roomss.push(roomList);
			console.log("getRoomss frontend");
			console.log(this.roomss);

		})
		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			this.userss = userList;
		})
		this.createRoom("Global Chats");
		this.createRoom("test2");
		this.joinRoom("Global Chat");
		this.joinRoom("test1");
		console.log("rooms: " + this.rooms);
		
	};

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message, "sendmessageall");
			// this.messages.push(this.message);
		}
		this.message = '';
	}

	createRoom(roomName: string) {
		if (roomName) {
		  this.chatService.createRoom(roomName);
		  this.roomName = '';
		}
	}

	getRooms() {
		this.chatService.getRooms();
	}

	getRoomss() {
		this.chatService.getRoomss();
	}
	
	joinRoom(data: string) {
		console.log("joinroom component: " + data);
		this.chatService.joinRoom(data);
	}

	getConnectedUsers() {
		this.chatService.getConnectedUsers();
	}
	
	sendUserList(data: string) {
		console.log("sendUserList: " + data);
		this.chatService.sendUserList(data);
	}
}


// import { Component, OnInit } from '@angular/core';
// import { AsyncPipe, NgFor } from '@angular/common';
// import { ChatService } from '../../services/sock/chat/chat.service';
// import { FormsModule } from '@angular/forms';
// import { ChatRoomComponent } from './chat-room/chat-room.component';

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
// 			console.log("getRooms frontend");
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
// 		console.log("joinroom component: " + data);
// 		this.chatService.joinRoom(data);
// 	}

// 	sendUserList(data: string) {
// 		console.log("sendUserList: " + data);
// 		this.chatService.sendUserList(data);
// 	}
// }
