import { Injectable } from '@angular/core';
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
export class ChatService {
	private chatSocket = io("/chat");
	private unread = true;
	user$ : Observable<User> | undefined;
	userId?: number;
	userss: string[] = [];
	rooms: Rooms[] = []; 
	roomss: Rooms[] = []; 

	constructor(sockService: SockService, private userService: UserService) {
		
		this.chatSocket.onAny((event, ...args) => {
			console.log("CHAT-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("chatSocket");
	}
	ngOnInit(): void {
		this.user$ = this.userService.getUser();
		this.user$.subscribe(user => {
			this.userId = user.id; // Assuming 'id' is the user ID field
		});
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
		this.user$ = this.userService.getUser();
		console.log("sender: " + this.userId + "sendmessage sender ID hardcoded");
		const messageObj = {
			message : message,
			sender : "senderID",
			room : room,
		}
		this.chatSocket.emit('message', messageObj, (err: any) => {
			if (err) {
				console.log("chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	createRoom(message: string): void {
		// console.log("createRoom called: " + message);
		const id = message;
		const password = "";
		const user = this.user$;
		console.log("createRoom called: " + message + ", user: " + this.user$);
		this.chatSocket.emit('createRoom', { id, password}, (err: any) => {
			if (err) {
				console.log("createRoom chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	joinRoom(message: string): void {
		const id = message;
		const password = "";
		console.log("joinRoom: " + message + ", password: " + password);
		this.chatSocket.emit('joinRoom', {id, password}, (err: any) => {
			if (err) {
				console.log("joinRoom chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
		
	}
	
	leaveRoom(room: string, userid: string) {
		this.chatSocket.emit('leaveRoom', {room, userid}, (err: any) => {
			if (err) {
				console.log("leaveRoom chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	  }

	sendUserList(message: string): void {
		this.chatSocket.emit('getUserList', message, (err: any) => {
			if (err) {
				console.log("chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	getMessages(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('message', (message) => {
				observer.next(message);
				console.log("getmessage");
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
				console.log("getRooms: " + message[message.length - 1]);
				observer.next(message[message.length - 1]);		
			});
		});
	}

	getRoomss(): Observable<Rooms[]> {
		return new Observable<Rooms[]>((observer) => {
		  this.chatSocket.on('getRoomss', (roomss: Rooms[]) => {
			console.log("getRoomss: ", roomss);
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

	getConnectedUsers(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getConnectedUsers', (userss) => {
				console.log("getConnectedUsers: " + userss);
				observer.next(userss);		
			});
		});
	}



	getAllRoomsExceptFirst(): Observable<string[]> {
		return new Observable<string[]>((observer) => {
		  this.chatSocket.on('getRooms', (rooms: string[]) => {
			console.log("getAllRooms: ", rooms);
			observer.next(rooms);
		  });
		}).pipe(
		  skip(1) // Skip the first emitted value
		);
	  }

	getAllRooms(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getAllRooms', (message) => {
				console.log("getAllRooms: " + message);
				observer.next(message);
			});
		});
	}

	muteUser(room: string, userid: string){
		this.chatSocket.emit('mute', {room, userid}, (err: any) => {
			if (err) {
				console.log("leaveRoom chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	banUser(room: string, userid: string){
		this.chatSocket.emit('ban', {room, userid}, (err: any) => {
			if (err) {
				console.log("banUser chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}


	isUnread() {
		return this.unread;
	}

}
