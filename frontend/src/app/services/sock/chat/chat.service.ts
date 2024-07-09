import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { SockService } from '../sock.service';
import { UserService } from '../../user/user.service';
import { User } from '../../../models/user.class';
import { skip } from 'rxjs/operators';
import { Rooms } from '../../../models/rooms.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService{
	count = 0;
	private chatSocket = io("/chat");
	private unread = false;
	user?: User;

	userss: string[] = [];
	rooms: Rooms[] = []; 
	roomss: Rooms[] = []; 

	constructor(sockService: SockService, private userService: UserService) {
		this.userService.getUser('0').subscribe((userData) => {
			this.user = userData;
			// console.log("User loaded in ChatService:", this.user);
		});

		this.chatSocket.onAny((event, ...args) => {
			console.log("CHAT-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("chatSocket");
	}
	ngOnInit(): void {
		console.log("dfd?");
		// this.user$ = this.userService.getUser(0);
	}

	// sendMessage(message: string): void {
	// 	// this.user$ = this.userService.getUser();
	// 	this.chatSocket.emit('message', message, (err: any) => {
	// 		if (err) {
	// 			console.log("chat-sock error: ");
	// 			console.log(err);
	// 			console.log(err.message);
	// 		}
	// 	});
	// }

	sendMessage(message: string, room: string): void {
		// this.user$ = this.userService.getUser(0);
		// const sender = this.user$;
		const messageObj = {
			message : message,
			sender : this.user?.nickname,
			sender_id: this.user?.id,
			room : room,
		}
		console.log("sending msg");
		this.chatSocket.emit('message', messageObj, (err: any) => {
			if (err) {
				// console.log("chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	createRoom(room_name: string, status: string, password: string): void {
		// console.log("createRoom called: " + room_name + ", status: " + status + ", password: " + password);
		this.chatSocket.emit('createRoom', { room_name, status, password}, (err: any) => {
			if (err) {
				// console.log("createRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	joinRoom(room_name: string, password: string): void {
		// console.log("joinRoom name: " + room_name + ", password: " + password);
		this.chatSocket.emit('joinRoom', {room_name, password}, (err: any) => {
			if (err) {
				// console.log("joinRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
		
	}
	
	leaveRoom(room: string, userid: string) {
		const num = Number(userid);
		this.chatSocket.emit('leaveRoom', {room, num}, (err: any) => {
			if (err) {
				// console.log("leaveRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	  }

	sendUserList(message: string): void {
		this.chatSocket.emit('getUserList', message, (err: any) => {
			if (err) {
				// console.log("chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	getMessages(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('message', (message) => {
				observer.next(message);
				// console.log("getmessage");
			});
		});
	}

	getUserList(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('userList', (message) => {
				observer.next(message);
			});
		});
	}

	getRooms(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getRooms', (message) => {
				// console.log("getRooms: " + message[message.length - 1]);
				observer.next(message[message.length - 1]);		
			});
		});
	}

	getRoomss(): Observable<Rooms[]> {
		return new Observable<Rooms[]>((observer) => {
		  this.chatSocket.on('getRoomss', (roomss: Rooms[]) => {
			// console.log("getRoomss: ", roomss);
			if (roomss.length > 0) {
			  observer.next(roomss); // Emit the array of rooms
			} else {
			  observer.error('No rooms available');
			}
		  });
		});
	  }
	
	  getRoomsss(): Observable<Record<string, Rooms>> {
		return new Observable<Record<string, Rooms>>((observer) => {
		  this.chatSocket.on('getRoomss', (chatRoomList: Record<string, Rooms>) => {
			observer.next(chatRoomList);
		  });
		});
	  }

	//   getUser(): Observable<any> {
	// 	return new Observable<any>((observer) => {
	// 	  this.chatSocket.on('getUser', (user: any) => {
	// 		user = user
	// 	  });
	// 	});
	//   }


	getConnectedUsers(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getConnectedUsers', (userss) => {
				// console.log("getConnectedUsers: " + userss);
				observer.next(userss);		
			});
		});
	}



	getAllRoomsExceptFirst(): Observable<string[]> {
		return new Observable<string[]>((observer) => {
		  this.chatSocket.on('getRooms', (rooms: string[]) => {
			// console.log("getAllRooms: ", rooms);
			observer.next(rooms);
		  });
		}).pipe(
		  skip(1) // Skip the first emitted value
		);
	  }

	getAllRooms(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getAllRooms', (message) => {
				// console.log("getAllRooms: " + message);
				observer.next(message);
			});
		});
	}

	muteUser(room: string, user: string){
		const userid = Number(user);
		this.chatSocket.emit('mute', {room, userid}, (err: any) => {
			if (err) {
				// console.log("leaveRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	banUser(room: string, user: string){
		const userid = Number(user);
		this.chatSocket.emit('ban', {room, userid}, (err: any) => {
			if (err) {
				// console.log("banUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	kickUser(room: string, user: string){
		const userid = Number(user);
		this.chatSocket.emit('kick', {room, userid}, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	battle(roomname: string, roomid: number, userid: number){
		const data = {
			roomid : roomid,
			room_name : roomname,
			userid: userid,
		}
		this.chatSocket.emit('inviteGame', data, (err: any) => {
			if (err) {
				// console.log("inviteGame chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	joinBattle(roomnum: string){
		const data = {
			numroom: roomnum
		}
		// if (this.user)
			// console.log("joinBAttle chatservice: " + this.user.id + ", data.roomnum: " + data.numroom);
		// else
			// console.log("joinbattle nouser")
		this.chatSocket.emit('joinBattle', data, (err: any) => {
			if (err) {
				// console.log("joinBattle chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	updatePage(){
		const data = {
			user_id : this.user?.id,
			user_name : this.user?.nickname,
		}
		console.log(`updateRoom`);
		this.chatSocket.emit('updateRoom', data, (err: any) => {
			if (err) {
				// console.log("updateRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	isUnread() {
		return this.unread;
	}
}
