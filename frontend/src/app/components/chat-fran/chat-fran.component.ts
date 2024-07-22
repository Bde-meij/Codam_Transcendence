import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NbCardModule, NbChatModule, NbDialogService, NbUserModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user.class';
import { Rooms } from '../../models/rooms.class';
import { NbLayoutModule} from '@nebular/theme';
import { UserDetailComponent } from '../user-detail/user-detail.component';	
import { createChatRoom } from './createChatRoom/createChatRoom.component';
import { Observable, of, map, catchError } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { Router } from '@angular/router';

let subbed = false;

@Component({
  selector: 'fran-chat-ui',
  standalone: true,
  imports: [CommonModule, NbChatModule, NbUserModule, NgFor, NgIf, NbLayoutModule, UserDetailComponent, NbCardModule, ReactiveFormsModule],
  templateUrl: './chat-fran.component.html',
  styleUrl: './chat-fran.component.scss',
})
export class FranChatUiComponent implements AfterViewInit{

	@ViewChild('messageContainer') messageContainer!: ElementRef;
	@ViewChild('messageInput') messageInput!: ElementRef;
	selectedUser: any;
	selectedUserID?: number;
	message: string | undefined;
  	user!: User;
	messages: string[] = [];

	roomsList: Record<string, Rooms> = {};
	userss: string[] | undefined;
	roomName: string | undefined;

	selectedRoom: Rooms | undefined;

	userNameForm!: FormGroup;

	userNotFound: boolean = false;
	
	onSelect(room: Rooms): void {
		this.selectedRoom = room;
		this.joinRoom(room.name, '');
		//console.log(room.messages);
	};

	constructor(private chatService: ChatService, private userService: UserService, private dialogService: NbDialogService, private router: Router) {};

	ngOnInit() {
		this.userNameForm = new FormGroup({
			userName: new FormControl('', {
				validators: [
					Validators.required,
					forbiddenNameValidator(/gary/),
					forbiddenNameValidator(/Gary/),
				],
				updateOn: 'change',
			}),
		});
    	this.userService.getUser('current').subscribe((userData) => (
			this.user = userData
		));
		
		if (!subbed) {
			this.chatService.getMessages().subscribe((newmessage: any ) => {
				if (this.roomsList[newmessage.room_name]?.messages) {
					
					this.userService.getAvatar(newmessage.senderId).subscribe((data) => (
						newmessage.sender_avatar = URL.createObjectURL(data)
					))
					this.roomsList[newmessage.room_name].messages?.push(newmessage);
					this.messages.push(newmessage.message);
				}
			});
			subbed = true;
		}

		this.chatService.getRoomsss().subscribe((chatRoomList: Record<string, Rooms>) => {
			// ////console.log("getRoomsss record");
			this.roomsList = chatRoomList;
		});

		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			// ////console.log("getconnectedusers subscribe");
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
	};

	ngAfterViewInit() {
    console.log("afterviewcheckedINIT");
		if (!this.selectedRoom)
			this.chatService.updatePage();
	}

	sendMessage(event: any) {
		if (event.message) {
			// this.get_all_rooms();
			this.chatService.sendMessage(event.message, this.selectedRoom!.name, this.user!.avatar);
		}
		this.message = '';
		//console.log("room users: " + this.room.users);
		//console.log(this.room.users)

		////console.log("chat-message sendmessage: " + this.room.name);
	}

	makenum(str: string){
		return Number(str);
	}

	createRoom(roomName: string, status: string, password: string, users: number[]) {
		if (roomName) {
		  this.chatService.createRoom(roomName, status, password, users);
		  this.roomName = '';
		}
	}

	userCreatesRoom() {
		this.dialogService.open(createChatRoom, {
			context: {}
		  }).onClose.subscribe((input: any) => {
			if (input) {
				this.chatService.createRoom(input.roomName, input.roomType, input.password, input.users);
				this.joinRoom(input.roomName, input.password);
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

	leaveRoom(roomName: string) {
		this.chatService.leaveRoom(+this.roomsList[roomName].id, roomName, this.user.id);
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

	isChannelAdmin(): boolean {
		const userIdToNbr = +this.user.id;
		return this.selectedRoom!.admins.includes(userIdToNbr);
	}

	battle() {
		this.router.navigate(['/dashboard/game']);
		this.chatService.battle(this.selectedRoom!.name, +this.selectedRoom!.id, +this.user.id, this.user.nickname, this.user.avatar);
	}

	joinBattle() {
		this.chatService.joinBattle(this.selectedRoom!.id, this.selectedRoom!.name, this.user.avatar);
	}

	mute() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.muteUser(this.selectedRoom!.name, this.selectedUserID!, this.user.avatar);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	ban() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.banUser(this.selectedRoom!.name, this.selectedUserID!, this.user.avatar);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	kick() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.kickUser(this.selectedRoom!.name, this.selectedUserID!);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	private userInRoom(userName: string): Observable<boolean> {
		return this.userService.getUserIdByName(userName).pipe(
			map((data: any) => {
			  this.selectedUserID = data;
			  return this.selectedRoom!.users.includes(this.selectedUserID!);
			}),
			catchError((error) => {
			  console.error('Error fetching user ID:', error);
			  return of(false); // Return false or handle error as needed
			})
		  );
	}

	get_all_rooms(){
		this.chatService.get_all_rooms();
	}

	onAvatarClick(msg: any) {
		console.log("Avatar clicked on!");
	}
}
