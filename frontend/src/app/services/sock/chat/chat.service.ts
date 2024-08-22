import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { UserService } from '../../user/user.service';
import { User } from '../../../models/user.class';
import { skip } from 'rxjs/operators';
import { ErrorMessage, getAllUsersInRoomDTO, MessageInterface, Rooms } from '../../../models/rooms.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService{
	count = 0;
	chatSocket : Socket;
	private unread = false;
	user!: User;

	userss: string[] = [];
	usernames: { user: string; username: string }[] = [];

	rooms: Rooms[] = []; 
	roomss: Rooms[] = []; 
	selectedRoom?: Rooms;
	constructor( private userService: UserService) {
		// TO DO : handle when userservice returns an httperror 
		this.userService.getUser('current').subscribe((userData) => {
			this.user = userData;
		});
		this.chatSocket = io("/chat");
		this.get_users_names().subscribe((usernames_list: any) => {
			this.usernames = usernames_list;
			console.log(this.usernames);
		})
	}

	sendMessage(message: string, room: string, avatar: string): void {
		// this.user$ = this.userService.getUser(0);
		// const sender = this.user$;
		const messageObj = {
			message: message,
			sender_name: this.user?.nickname,
			sender_id: this.user?.id,
			sender_avatar: this.user?.avatar,
			room: room,
			type: 'text',
		}
		// console.log("sending msg");
		// this.get_all_rooms();
		this.chatSocket.emit('message', messageObj, (err: any) => {
			if (err) {
				// console.log("chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	createRoom(room_name: string, status: string, password: string, userid: number): void {
		console.log("createRoom called: " + room_name + ", status: " + status + ", password: " + password);

		this.chatSocket.emit('createRoom', { room_name: room_name, status: status, password: password, userid: userid, password_bool: (password.length > 0)}, (err: any) => {
			if (err) {
				// console.log("createRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	giveUsernames(room: string): void {
		// console.log("settingsChat called: " + room_name + ", status: " + status + ", password: " + password + ", admins: " + admins);
		this.chatSocket.emit('give_usernames', room, (err: any) => {
			if (err) {
				// console.log("createRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	settingsChat(input: any): void {
		// console.log("settingsChat called: " + room_name + ", status: " + status + ", password: " + password + ", admins: " + admins);
		this.chatSocket.emit('settingsChat', input, (err: any) => {
			if (err) {
				// console.log("createRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	checkPassword(input: any): void {
		this.chatSocket.emit('checkPassword', input, (err: any) => {
		if (err) {
				// console.log("createRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	joinRoom(room_name: string, password: string): void {
		// console.log("joinRoom name: " + room_name + ", password: " + password);
		this.chatSocket.emit('joinRoom', {room_name: room_name, user_id: this.user!.id, password: (password.length > 0)? password : undefined, avatar: this.user!.avatar}, (err: any) => {
			if (err) {
				// console.log("joinRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
		
	}
	
	leaveRoom(roomid: number, room: string, username: string, useridStr: string) {
		const userid = Number(useridStr);
		this.chatSocket.emit('leaveRoom', {roomid: roomid, room: room, userid: userid, username: username}, (err: any) => {
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

	getMessages(): Observable<MessageInterface> {
		return new Observable((observer) => {
			this.chatSocket.on('message', (message) => {
				console.log("IN CHAT SERVICE", message);
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

	getConnectedUsers(): Observable<string[]> {
		return new Observable((observer) => {
			this.chatSocket.on('getConnectedUsers', (userss) => {
				// console.log("getConnectedUsers: " + userss);
				observer.next(userss);
			});
		});
	}

	update_public(): Observable<Rooms> {
		return new Observable((observer) => {
			this.chatSocket.on('update_public', (room: Rooms) => {
				observer.next(room);
			});
		});
	}

	update_all_users(): Observable<{ users: getAllUsersInRoomDTO[], roomid: string }> {
		return new Observable((observer) => {
			this.chatSocket.on('all-users', (users: getAllUsersInRoomDTO[], roomid: string) => {
				observer.next({ users, roomid });
			});
		});
	}

	update_single_user(): Observable<{users: getAllUsersInRoomDTO, roomid: string}> {
		return new Observable((observer) => {
			this.chatSocket.on('add-one', (users: getAllUsersInRoomDTO, roomid: string) => {
				observer.next({ users, roomid });
			});
		});
	}
	
	selectRoom(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('select', (room) => {
				observer.next(room);
			});
		});
	}

	error_message(): Observable<ErrorMessage> {
		return new Observable((observer) => {
			this.chatSocket.on("error_message", (message) => {
				observer.next(message);
			});
		});
	}

	get_all_blocked(): Observable<any> {
		return new Observable((observer) => {
			this.chatSocket.on("blocked", (message) => {
				observer.next(message);
			});
		});
	}
	
	get_users_names(): Observable<any> {
		return new Observable((observer) => {
			this.chatSocket.on("usernames", (message) => {
				observer.next(message);
			});
		});
	}

	update_client_room(): Observable<Rooms> {
		return new Observable((observer) => {
			this.chatSocket.on('update_client_room', (room: Rooms) => {
				observer.next(room);
			});
		});
	}

	delete_room(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('delete_room', (room: string) => {
				observer.next(room);
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

	muteUser(room: string, user: string, avatar: string){
		const data = {
			room: room,
			username: user,
			avatar: avatar
		}
		console.log("muting?");
		this.chatSocket.emit('mute', data, (err: any) => {
			if (err) {
				// console.log("leaveRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	banUser(room: string, username: string, avatar: string){
		console.log(`param check ban ${username}`);
		const data = {
			room: room,
			username: username,
			avatar: avatar
		}
		this.chatSocket.emit('ban', data, (err: any) => {
			if (err) {
				// console.log("banUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	kickUser(room: string, user: string){
		console.log(`param check kickuser ${user}`);
		const data = {
			room: room,
			username: user,
		}
		this.chatSocket.emit('kick', data, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	invite(room: string, user: string){
		console.log(`param check invite() invite-to-chat ${user}`);
		const data = {
			roomName: room,
			roomId: Number(this.selectedRoom?.id),
			user: user,

		}
		this.chatSocket.emit('invite-to-chat', data, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	inviteChat(user: string){
		const userid = Number(user);
		console.log(`param check inviteChat`);
		const p = { user: userid}
		console.log(`param check invite ${user}`);
		this.chatSocket.emit('inviteChat', p, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}


	deleteRoom(roomid: number, room: string, user: string) {
		const userid = Number(user);
		this.chatSocket.emit('deleteRoom', {roomid, room, userid}, (err: any) => {
			if (err) {
				// console.log("deleteRoom chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	setAdmin(room: number, userid: string){
		console.log(`param check setadmin ${userid}`);
		const data = {
			room: room,
			userid: (Number(userid)),
		}
		this.chatSocket.emit('setadmin', data, (err: any) => {
			if (err) {
				// console.log("setAdmin chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	get_all_rooms(){
		this.chatSocket.emit('all_rooms', {}, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	blockUser(user: string, room: string){
		this.chatSocket.emit('block', {username: user, room: room}, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	unblockUser(user: string, room: string){
		this.chatSocket.emit('unblock', {username: user, room: room}, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	updateName(user: string){
		const data = {
			sender_name: user
		}
		this.chatSocket.emit('updateName', data, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	last_open_room(room_name: string){
		this.chatSocket.emit('last_open_room', {name: room_name}, (err: any) => {
			if (err) {
				// console.log("kickUser chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}


	battle(roomname: string, roomid: number, userid: number, userName: string, avatar: string){
		const data = {
			roomid : roomid,
			room_name : roomname,
			userid: userid,
			userName: userName,
			avatar: avatar,
		}
		this.chatSocket.emit('inviteGame', data, (err: any) => {
			if (err) {
				// console.log("inviteGame chat-sock error: ");
				// console.log(err);
				// console.log(err.message);
			}
		});
	}

	joinBattle(roomnum: number, room: string, avatar: string){
		const data = {
			numroom: roomnum,
			room: room,
			avatar: avatar,
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
		// console.log(`updateRoom`);
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

	set room(room: Rooms) {
		this.selectedRoom = room;
	}

	get room(): Rooms | undefined {
		console.log(this.selectedRoom);
		return this.selectedRoom;
	}

	get username_list(): { user: string; username: string }[]{
		return this.usernames;
	}

	getSelected(){
		return this.selectedRoom;
	}
}
