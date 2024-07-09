import { NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NbChatModule, NbSidebarModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.class';
import { Rooms } from '../../models/rooms.class';
import { NbThemeModule, NbLayoutModule} from '@nebular/theme';
import { UserDetailComponent } from '../user-detail/user-detail.component';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'app-chat-ui',
  standalone: true,
  imports: [NbChatModule, NgFor, NgIf, NbThemeModule, NbLayoutModule, UserDetailComponent, NbSidebarModule, NbEvaIconsModule],
  templateUrl: './chat-fran.component.html',
  styleUrl: './chat-fran.component.scss'
})
export class ChatUiComponent implements AfterViewInit{

	@ViewChild('messageContainer') messageContainer!: ElementRef;
	@ViewChild('messageInput') messageInput!: ElementRef;
	selectedUser: any;
	selectedUserID?: string;
	message: string | undefined;
  	user!: User;
	messages: string[] = [];

	roomsList: Record<string, Rooms> = {};
	userss: string[] | undefined;
	roomName: string | undefined;
	
	selectedRoom: Rooms | undefined;
	
	onSelect(room: Rooms): void {
		this.selectedRoom = room;
		//console.log(room.messages);
	};

	constructor(private chatService: ChatService, private userService :UserService, private sidebarService: NbSidebarService) {};

	ngOnInit() {
    this.userService.getUser(0).subscribe((userData) => (
			this.user = userData
		));
	
		this.chatService.getMessages().subscribe((newmessage: any ) => {
			if (this.roomsList[newmessage.room_name]?.messages) {
				
				this.userService.getAvatar(newmessage.senderId).subscribe((data) => (
					newmessage.sender_avatar = URL.createObjectURL(data)
				))
				this.roomsList[newmessage.room_name].messages?.push(newmessage);
				this.messages.push(newmessage.message);
			}
		});

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
			// ////console.log("getconnectedusers subscribe");
			this.userss = userList;
		})
    this.createRoom("Global", "public", "");
		// this.createRoom("temp",  "public", "");
		this.joinRoom("Global", "");
		// this.joinRoom("temp", "");
	};

	ngAfterViewInit() {
    console.log("afterviewcheckedINIT");
		if (!this.selectedRoom)
			this.chatService.updatePage();
	}
	

	sendMessage(event: any) {
		if (event.message) {
			this.chatService.sendMessage(event.message, this.selectedRoom!.name);
		}
		this.message = '';
		//console.log("room users: " + this.room.users);
		//console.log(this.room.users)

		////console.log("chat-message sendmessage: " + this.room.name);
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

	showUsers() {
		this.sidebarService.expand();
	}
}
