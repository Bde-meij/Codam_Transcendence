import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NbAutocompleteModule, NbButtonModule, NbCardModule, NbChatModule, NbDialogService, NbOptionModule, NbUserModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.class';
import { Rooms } from '../../models/rooms.class';
import { NbThemeModule, NbLayoutModule} from '@nebular/theme';
import { UserDetailComponent } from '../user-detail/user-detail.component';	
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FormsModule } from '@angular/forms';
import { createChatRoom } from '../createChatRoom/createChatRoom.component';
import { Observable, of } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';

@Component({
  selector: 'fran-chat-ui',
  standalone: true,
  imports: [CommonModule, FormsModule, NbChatModule, NbUserModule, NgFor, NgIf, NbThemeModule, NbLayoutModule, UserDetailComponent, NbEvaIconsModule, NbCardModule, NbOptionModule, ReactiveFormsModule],
  templateUrl: './chat-fran.component.html',
  styleUrl: './chat-fran.component.scss',
})
export class FranChatUiComponent implements AfterViewInit{

	@ViewChild('messageContainer') messageContainer!: ElementRef;
	@ViewChild('messageInput') messageInput!: ElementRef;
	@ViewChild('autoInput') input!: any;
	selectedUser: any;
	selectedUserID?: string;
	message: string | undefined;
  	user!: User;
	messages: string[] = [];

	roomsList: Record<string, Rooms> = {};
	userss: string[] | undefined;
	roomName: string | undefined;
	filteredOptions$!: Observable<string[]>;

	selectedRoom: Rooms | undefined;

	userNameForm = new FormGroup({
		userName: new FormControl('', {
			validators: [
				Validators.required,
				forbiddenNameValidator(/gary/),
				forbiddenNameValidator(/Gary/),
			],
			updateOn: 'change',
		}),
	});
	
	onSelect(room: Rooms): void {
		this.selectedRoom = room;
		//console.log(room.messages);
	};

	constructor(private chatService: ChatService, private userService: UserService, private dialogService: NbDialogService) {};

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
			}
		});

		this.chatService.getRoomsss().subscribe((chatRoomList: Record<string, Rooms>) => {
			// ////console.log("getRoomss record");
			this.roomsList = chatRoomList;
			if (!this.selectedRoom && Object.keys(this.roomsList).length > 0) {
				const firstRoomName = Object.keys(this.roomsList)[0];
				// ////console.log("getrooms select")
				////console.log(this.roomsList[firstRoomName]);
			  }
			////console.log(this.roomsList);
		});

		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			// ////console.log("getconnectedusers subscribe");
			this.userss = userList;
		})
		this.filteredOptions$ = of(this.userss || []);
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

	userCreatesRoom() {
		this.dialogService.open(createChatRoom, {
			context: {
			}
		  }).onClose.subscribe((input: any) => {
			if (input) {
				this.chatService.createRoom(input.roomName, '', input.password);
			}
		  });
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

	test() {}

	isChannelOwner(): boolean {
		return +this.user.id === +this.selectedRoom!.owner;
	}
}
