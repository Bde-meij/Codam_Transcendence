import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, CommonModule } from '@angular/common';
import { ChatService } from '../../services/sock/chat/chat.service';
import { UserService } from '../../services/user/user.service';
import { FormsModule } from '@angular/forms';
import { Rooms } from '../../models/rooms.class';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { User } from '../../models/user.class';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { AfterViewInit, AfterViewChecked } from '@angular/core';
import { ViewChild } from '@angular/core';

export interface MessageInterface {
	sender: string,
	message: string
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, FormsModule, AsyncPipe, ChatMessageComponent, NgIf, CommonModule, UserDetailComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})

export class ChatComponent implements OnInit, AfterViewInit {
	user!: User;
	message: string | undefined;
	messages: string[] = [];

	roomsList: Record<string, Rooms> = {};
	userss: string[] | undefined;
	roomName: string | undefined;
	
	selectedRoom: Rooms | undefined;
	
	onSelect(room: Rooms): void {
		this.selectedRoom = room;
		//console.log(room.messages);
	};

	constructor(private chatService: ChatService, private userService: UserService) {};
	
	ngOnInit() {
		this.userService.getUser('current').subscribe((userData) => (
			this.user = userData
		));
	
		this.chatService.getMessages().subscribe((newmessage: any ) => {
			if (this.roomsList[newmessage.room_name]?.messages) {
				
				this.userService.getAvatar(newmessage.senderId).subscribe((data) => (
					newmessage.sender_avatar = URL.createObjectURL(data)
				))
				this.roomsList[newmessage.room_name].messages?.push(newmessage);
				this.messages.push(newmessage.message);
				
				// console.log("Room: " + newmessage.roomId + ", got a new message");
				// console.log(newmessage);
			} else {
				//console.error("Room or messages array not found:", newmessage.roomId);
			}
		});

		// this.chatService.getRooms().subscribe((roomList: any) => {
		// 	this.rooms.push(roomList);
		// 	// ////console.log("getRooms frontend");
		// })

		// this.chatService.getUser().subscribe((roomList: any) => {
		// 	this.rooms.push(roomList);
		// 	// ////console.log("getRooms frontend");
		// })

		this.chatService.getRoomsss().subscribe((chatRoomList: Record<string, Rooms>) => {
			// ////console.log("getRoomss record");
			this.roomsList = chatRoomList;
			if (!this.selectedRoom && Object.keys(this.roomsList).length > 0) {
				const firstRoomName = Object.keys(this.roomsList)[0];
				// ////console.log("getrooms select")
				////console.log(this.roomsList[firstRoomName]);
				this.onSelect(this.roomsList[firstRoomName]);
			  }
			////console.log(this.roomsList);
		});

		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			// console.log("getconnectedusers subscribe");
			this.userss = userList;
		})

		this.chatService.update_client_room().subscribe((update_room: Rooms) => {
			console.log(`update_cllient_room: ${update_room}`);
			this.roomsList[update_room.name] = update_room;
		})

		// this.chatService.fetch_client_room().subscribe((update_room: Rooms) => {
		// 	console.log(`update_cllient_room: ${update_room}`);
		// 	this.roomsList[update_room.name] = update_room;
		// })

		this.createRoom("Global", "public", "");
		// this.createRoom("temp",  "public", "");
		this.joinRoom("Global", "");
		// this.joinRoom("temp", "");

	};

	@ViewChild(ChatMessageComponent) viewChild!: ChatMessageComponent;

	ngAfterViewInit() {
		console.log(`afterviewcheckedInit Room: ${this.selectedRoom}`);
		if (!this.selectedRoom){
			this.chatService.updatePage();
			if (Object.keys(this.roomsList).length > 0) {
				const firstRoomName = Object.keys(this.roomsList)[0];
				this.selectedRoom = this.roomsList[0];
				this.onSelect(this.roomsList[firstRoomName]);
				console.log(`empty selectedroom, selected: ${this.roomsList[firstRoomName]}`);
			}
		}
	}

	// ngAfterViewChecked() {
	// 	console.log(`afterviewchecked ${this.selectedRoom?.name}`);
	// 	if (!this.selectedRoom){
	// 		console.log(`WORKS?k`);
	// 		this.chatService.updatePage();
	// 	}
	// }

	sendMessage() {
		if (this.message) {
			this.chatService.sendMessage(this.message, "sendmessageall");
			// this.messages.push(this.message);
		}
		this.message = '';
	}

	makenum(str: string){
		return Number(str);
	}

	createRoom(roomName: string, status: string, password: string) {
		if (roomName) {
		  this.chatService.createRoom(roomName, status, password);
		  this.roomName = '';
		}
	}

	getRooms() {
		this.chatService.getRooms();
	}

	getRoomss() {
		this.chatService.getRoomss();
	}

	joinRoom(data: string, password: string) {
		////console.log("joinroom component: " + data);
		this.chatService.joinRoom(data, password);
	}

	getConnectedUsers() {
		this.chatService.getConnectedUsers();
	}
	
	sendUserList(data: string) {
		////console.log("sendUserList: " + data);
		this.chatService.sendUserList(data);
	}

	getRoomNames(): string[] {
		return Object.keys(this.roomsList);
	}

	updatePage(){
		this.chatService.updatePage();
	}
}
