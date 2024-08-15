import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { NbCardModule, NbChatModule, NbDialogConfig, NbDialogService, NbUserModule } from '@nebular/theme';
import { ChatService } from '../../services/sock/chat/chat.service';
import { UserService } from '../../services/user/user.service';
import { BlockService } from '../../services/block/block.service';
import { User } from '../../models/user.class';
import { Blocks, ErrorMessage, getAllUsersInRoomDTO, MessageInterface, Rooms } from '../../models/rooms.class';
import { NbThemeModule, NbLayoutModule} from '@nebular/theme';
import { UserDetailComponent } from '../user-detail/user-detail.component';	
import { createChatRoom } from './createChatRoom/createChatRoom.component';
import { Observable, of, map, catchError } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forbiddenNameValidator } from '../../services/validator/name-validator.service';
import { Router } from '@angular/router';
import { settingsChat } from './settingsChat/settingsChat.component';
import { protectedChat } from './protectedChat/protectedChat.component';
// import { ErrorService } from '../../services/sock/chat/error.service';

let subbed = false;
let pw = '';
let joined = 0;

@Component({
	selector: 'fran-chat-ui',
	standalone: true,
	imports: [
		CommonModule,
		NbChatModule,
		NbUserModule,
		NgFor,
		NgIf,
		NbLayoutModule,
		UserDetailComponent,
		NbCardModule,
		ReactiveFormsModule
	],
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
	userMap: Map<number, string>;
	userss: string[] | undefined;
	
	roomName: string | undefined;
	selectedRoom: Rooms | undefined;
	userNameForm!: FormGroup;
	userNotFound: boolean = false;
	blockbool: boolean = false;
	blockedList?: Blocks[];

	async onSelect(room: Rooms): Promise<any> {
		pw = '';
		joined = 1;
		console.log(room);
		this.selectedRoom = room;
		this.chatService.room = this.selectedRoom!
		this.last_open_room();
		this.change_sender_avatar(room.name);
		if (this.selectedRoom.password && !this.selectedRoom.users.includes(Number(this.user.id))){
			var test = await this.passwordPopup(room);
			this.joinRoom(room.name, pw);
			if (!this.selectedRoom.users.includes(Number(this.user.id)))
				joined = 0;
		}else {
			setTimeout(() => {
				this.joinRoom(room.name, pw);
				this.selectedRoom = room;
			}, 120);
		}	
		this.selectedRoom = room;
		if (joined === 0){
			this.selectedRoom = undefined;
		}
		joined = 0;
	};

	constructor(
		private chatService: ChatService, 
		private userService: UserService, 
		private blockService: BlockService,
		private dialogService: NbDialogService,
		private router: Router,
		// private errorService: ErrorService,
	) 
	{
		this.userMap = new Map<number, string>();
	};

	ngOnInit() {
		this.getLists();
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
		this.userService.getUser('current').subscribe((userData: User) => {
			this.user = userData;
			if (this.user){
				this.updateName();
			}
		});
		
		if (!subbed) {
			this.chatService.getMessages().subscribe((newmessage: any ) => {
				console.log("getmessage:", this.roomsList);
				if (this.roomsList[newmessage.room_name]?.messages) {
					// console.log("New message");
					this.blockedList?.forEach(block => {
						if (block.target.id == newmessage.senderId)
							// console.log("already blocked?");
							this.blockbool = true;
							return;	
					});
					if (newmessage.senderId > 0){
						newmessage.sender_avatar = this.get_avatar(newmessage.senderId);
						// if (!newmessage.sender_avatar){
						this.userService.getAvatar(newmessage.senderId).subscribe((data) => (
							newmessage.sender_avatar = URL.createObjectURL(data)
						))
						// }
					}
					if (!this.blockbool){
						// console.log("blockblool = faslse", this.blockbool);
						this.roomsList[newmessage.room_name].messages?.push(newmessage);
					}
					else
						this.blockbool = false;
					
				}
				this.blockbool = false;
			});

			this.chatService.update_client_room().subscribe((update_room: Rooms) => {
				console.log(`update_client_room: ${update_room.name}`);
				console.log(update_room);
				this.roomsList[update_room.name] = update_room;
				if (this.selectedRoom){
					if (this.selectedRoom.name == update_room.name){
						console.log("updated selected room");
						this.change_sender_avatar(this.selectedRoom.name);
						this.selectedRoom = update_room;
					}
				}
			})

			this.chatService.error_message().subscribe((msg: ErrorMessage) => {
				// this.errorService.showError(msg);
				let room_id = 0;
				let room_name = 'Global';
				
				if (!msg.msg)
					msg.msg = "Undefined error";
				if (this.selectedRoom){
					room_id = this.selectedRoom?.id;
					room_name = this.selectedRoom?.name;
				} else if (msg.room){
					room_id = this.roomsList[msg.room].id;
					room_name = msg.room;
				}
				const message : MessageInterface = {
					message: msg.msg,
					roomId: room_id,
					room_name: room_name,
					senderId: -1,
					sender_name: "System messager",
					sender_avatar: '',
					type: 'text',
					created: new Date(),
				}
				console.log(`error_message received ${message.message} - to ${message.room_name} - ${this.selectedRoom?.name}`);
				if (!this.roomsList[message.room_name])
					this.roomsList[message.room_name];
				this.roomsList[message.room_name].messages?.push(message);
			})

			this.blockService.getBlocked().subscribe((blocked: any) => {
				// console.log("blockedlist:", blocked);
				this.blockedList = blocked
			})
		 
			this.chatService.update_all_users().subscribe((users: any) => {
				console.log("update all user");
				console.log(users);
			})

			this.chatService.selectRoom().subscribe((room: string) => {
				// setTimeout(() => {
				// 	this.onSelect(this.roomsList[room]);
				// }, 300);
				this.selectedRoom = this.roomsList[room];
			})

			this.chatService.update_single_user().subscribe((users: any) => {
				console.log("update single user");
				console.log(users);
			})


			subbed = true;
		}
		

		this.chatService.getRoomsss().subscribe((chatRoomList: Record<string, Rooms>) => {
			console.log("gettrooms: ", chatRoomList)
			this.roomsList = chatRoomList;
		});

		this.chatService.getConnectedUsers().subscribe((userList: any) => {
			console.log("getConnectedUsers: ", userList)
			this.userss = userList;
		})

		this.chatService.update_public().subscribe((update_room: Rooms) => {
			console.log(`update_public: ${update_room.name}`);
			// console.log(update_room);
			

			if (update_room.messages){
				for (let i = update_room.messages.length - 1; i >= 0; i--) {
					const msg = update_room.messages[i];
					const isBlocked = this.blockedList?.some(block => Number(block.target.id) === msg.senderId);
					if (isBlocked){
						update_room.messages.splice(i, 1);
					}
				}
			}
			
			this.roomsList[update_room.name] = update_room;
			this.change_sender_avatar(update_room.name);
		})

		this.chatService.delete_room().subscribe((room: string) => {
			console.log(`delete_room: ${room}`);
			delete this.roomsList[room];
		})
	};

	ngAfterViewInit() {
		console.log("afterviewcheckedINIT");
		
		if (!this.selectedRoom){
			console.log("updating page");
			setTimeout(() => {
				this.chatService.updatePage();
			}, 200);
		}
		Object.values(this.roomsList).forEach(room => {
			this.change_sender_avatar(room.name);
		});
		
	}

	sendMessage(event: any) {
		if (event.message) {
			console.log("avatar: ", this.user.avatar)
			this.chatService.sendMessage(event.message, this.selectedRoom!.name, this.user!.avatar);
		}
		this.message = '';
	}

	makenum(str: string){
		return Number(str);
	}

	createRoom(roomName: string, status: string, password: string, userid: number) {
		if (roomName) {
		  this.chatService.createRoom(roomName, status, password, userid);
		  this.roomName = '';
		}
	}

	userCreatesRoom() {
		this.dialogService.open(createChatRoom, {
			context: {}
		  }).onClose.subscribe((input: any) => {
			if (input) {
				console.log(input);

				this.chatService.createRoom(input.roomName, input.roomType, input.password, +this.user.id);
				setTimeout(() => {
					if (this.roomsList[input.roomName])
						this.onSelect(this.roomsList[input.roomName])
				}, 300);
			}
		  });
	}

	settingsChat(room: Rooms) {
		this.chatService.giveUsernames(this.selectedRoom!.name)
		setTimeout(() => {
			this.dialogService.open(settingsChat, {context:{selectedRoom: this.selectedRoom, users: this.chatService.usernames}
			}).onClose.subscribe((input: any) => {
				if (input) {
					console.log(input);
					console.log(input.roomName);
					this.chatService.settingsChat(input);
					setTimeout(() => {
						this.onSelect(this.roomsList[input.roomName])
					}, 300);
				}
			  });
		}, 300);
	}

	passwordPopup(room: Rooms): Promise<void>  {
		return new Promise((resolve) => {
			this.chatService.room = this.selectedRoom!;
			setTimeout(() => {
				this.dialogService.open(protectedChat, {context:{selectedRoom: this.selectedRoom}
				}).onClose.subscribe((input: any) => {
					if (input) {
						pw = input.password;
						this.chatService.checkPassword(input);
					}
					resolve();
				});
			}, 250);
		
		})
	}

	getRooms() {
		this.chatService.getRooms();
	}

	getRoomss() {
		this.chatService.getRoomss();
	}

	joinRoom(data: string, password: string) {
		this.chatService.joinRoom(data, password);
	}

	leaveRoom() {
		this.chatService.leaveRoom(this.selectedRoom!.id, this.selectedRoom!.name, this.user.nickname, this.user.id);
	}

	getConnectedUsers() {
		this.chatService.getConnectedUsers();
	}
	
	sendUserList(data: string) {
		this.chatService.sendUserList(data);
	}

	getRoomNames(): string[] {
		return Object.keys(this.roomsList);
	}

	isChannelOwner(): boolean {
		return +this.user.id === +this.selectedRoom!.owner;
	}

	isChannelAdmin(): boolean {
		const userIdToNbr = +this.user.id;
		return this.selectedRoom!.admins.includes(userIdToNbr);
	}

	battle() {
		this.chatService.battle(this.selectedRoom!.name, +this.selectedRoom!.id, +this.user.id, this.user.nickname, this.user.avatar);
		this.router.navigate(['/dashboard/game']);
	}
	
	// joinBattle(roomkey: number) {
	// 	console.log("IT HEREE---------------------------");
	// 	this.chatService.joinBattle(roomkey, this.selectedRoom!.name, this.user.avatar);
	// 	this.router.navigate(['/dashboard', 'game']);
	// }	
	joinBattle(msg: any) {
		console.log("IT HEREE1---------------------------", msg);
		console.log("IT HEREE2---------------------------", msg.customMessageData);
		console.log("IT HEREE3---------------------------", msg.customMessageData.roomkey);
		this.chatService.joinBattle(msg.customMessageData.roomkey, this.selectedRoom!.name, this.user.avatar);
		this.router.navigate(['/dashboard', 'game']);
	}

	mute() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.muteUser(this.selectedRoom!.name, this.userNameForm.value.userName, this.user.avatar);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	ban() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.banUser(this.selectedRoom!.name, this.userNameForm.value.userName, this.user.avatar);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	kick() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				this.chatService.kickUser(this.selectedRoom!.name, this.userNameForm.value.userName);
				this.userNotFound = false;
			}
			else
				this.userNotFound = true;
		})
	}

	invite() {
		this.chatService.invite(this.selectedRoom!.name, this.userNameForm.value.userName);
	}

	deleteRoom(){
		this.chatService.deleteRoom(Number(this.selectedRoom!.id), this.selectedRoom!.name, this.user.id);
	}

	block(){
		this.chatService.blockUser(this.userNameForm.value.userName, this.selectedRoom!.name);
	}

	unblock(){
		this.chatService.unblockUser(this.userNameForm.value.userName, this.selectedRoom!.name);
	}

	updateName(){
		this.chatService.updateName(this.user.nickname);
	}

	last_open_room(){
		if (this.selectedRoom)
			this.chatService.last_open_room(this.selectedRoom.name);
	}

	setAdmin() {
		this.userInRoom(this.userNameForm.value.userName).subscribe((userIsInRoom) => {
			if (userIsInRoom) {
				////console.log("chat-message component leaveRoom: " + room + ", id: " + userid);
				this.chatService.setAdmin(this.selectedRoom!.id, this.userNameForm.value.userName);
				// ////console.log("chat-message sendmessage: " + this.room.name);
			}
		});
	}

	get_avatar(userid: number){
		var newAvatar = this.userMap.get(userid);
		if (!newAvatar){
			this.storeUser(userid);
			newAvatar = this.userMap.get(userid);
		}	
		return newAvatar;
	}

	storeUser(userid: number): Observable<void> {
		console.log("storeUser");
		return this.userService.getAvatar(userid.toString()).pipe(
		  map((data) => {
			this.userMap.set(userid, URL.createObjectURL(data));
		  })
		);
	  }
	
	async change_sender_avatar(room_name: string) {
		const room = this.roomsList[room_name];
		if (room && room.messages) {
			for (const message of room.messages) {
				if (message.senderId > 0){
					let newAvatar = this.userMap.get(message.senderId);
					if (!newAvatar) {
						await this.storeUser(message.senderId).toPromise();
						newAvatar = this.userMap.get(message.senderId);
					}
					if (newAvatar) {
						message.sender_avatar = newAvatar;
					}
				}
			}
		}
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

	getLists(){
		this.blockService.getBlocked().subscribe({
			next: (data) => (
				this.blockedList = data,
				console.log("all blocked ", data)
			),
			error: (e) => (
				console.error("all blocked error: " + e))
		});
	}
}
