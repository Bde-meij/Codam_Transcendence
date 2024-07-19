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
import { HttpClient } from '@angular/common/http';

export interface MessageInterface {
	sender: string,
	message: string
}

let subbed = false;

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
	blocked_list: any | undefined;
	selectedRoom: Rooms | undefined;
	
	onSelect(room: Rooms): void {
		console.log(`onselect ${room.name}`);
		console.log(room);
		this.selectedRoom = room;
		console.log(room.messages);
	};

	constructor(private chatService: ChatService, private userService: UserService, private http: HttpClient) {};
	
	ngOnInit() {
		this.userService.getUser('current').subscribe((userData) => (
			this.user = userData
		));
		
		if (!subbed) {
			this.chatService.getMessages().subscribe((newmessage: any ) => {
				if (this.roomsList[newmessage.room_name]?.messages) {
					this.roomsList[newmessage.room_name].messages!.push(newmessage);
				} else {
					//console.error("Room or messages array not found:", newmessage.roomId);
				}
			});
			subbed = true;
		}

		this.chatService.getRoomsss().subscribe((chatRoomList: Record<string, Rooms>) => {
			// ////console.log("getRoomsss record");
			this.roomsList = chatRoomList;
		});

		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			// console.log("getconnectedusers subscribe");
			this.userss = userList;
		})

		this.chatService.update_public().subscribe((update_room: Rooms) => {
			console.log(`update_public: ${update_room.name}`);
			console.log(update_room);
			this.roomsList[update_room.name] = update_room;
		})

		this.chatService.update_client_room().subscribe((update_room: Rooms) => {
			console.log(`update_client_room: ${update_room.name}`);
			console.log(update_room);
			this.roomsList[update_room.name] = update_room;
		})

		this.chatService.delete_room().subscribe((room: string) => {
			console.log(`delete_room: ${room}`);
			delete this.roomsList[room];
		})

		this.chatService.personal_listen().subscribe((rooms: Record<string, Rooms>) => {
			console.log(`personal_listen ${rooms}`);
			this.roomsList = rooms;
		})


		// this.createRoom("Global", "public", "");
		// this.joinRoom("Global", "");
	};

	@ViewChild(ChatMessageComponent) viewChild!: ChatMessageComponent;

	ngAfterViewInit() {
		console.log(`afterviewcheckedInit Room: ${this.selectedRoom}`);
		if (!this.selectedRoom){
			this.chatService.updatePage();
			console.log("selectinged room empty");
			console.log(this.roomsList);
			// if (Object.keys(this.roomsList).length > 0) {
			// 	console.log(Object.keys(this.roomsList).length);
			// 	const firstRoomName = Object.keys(this.roomsList)[0];
			// 	this.selectedRoom = this.roomsList[0];
			// 	this.onSelect(this.roomsList[firstRoomName]);
			// 	console.log(`empty selectedroom, selected: ${this.roomsList[firstRoomName]}`);
			// }
		}
	}

	// ngAfterViewChecked() {
	// 	console.log(`afterviewchecked ${this.selectedRoom?.name}`);
	// 	if (!this.selectedRoom){
	// 		console.log(`WORKS?k`);
	// 		this.chatService.updatePage();
	// 	}
	// }

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
		// this.onSelect(this.roomsList[data]);
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
