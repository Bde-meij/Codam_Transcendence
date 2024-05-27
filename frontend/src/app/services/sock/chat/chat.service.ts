import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SockService } from '../sock.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService{
	private chatSocket = io("/chat");

	private unread = false;

	constructor(sockService: SockService) {
		this.chatSocket.onAny((event, ...args) => {
			console.log("CHAT-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("chatSocket");
	}

	sendMessage(message: string): void {
		this.chatSocket.emit('message', message, (err: any) => {
			if (err) {
				console.log("chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	createRoom(message: string): void {
		console.log("createRoom called");

		this.chatSocket.emit('createRoom', {
			roomId: message,
			password: "",}, (err: any) => {
			if (err) {
				console.log("createRoom chat-sock error: ");
				console.log(err);
				console.log(err.message);
			}
		});
	}

	joinRoom(message: string): void {
		this.chatSocket.emit('joinRoom', {
			roomId: message,
			password: "",}, (err: any) => {
			console.log("connecting: " + message);
			if (err) {
				console.log("joinRoom chat-sock error: ");
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

	getRooms(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('getRooms', (message) => {
				console.log("getRooms: " + message);
				observer.next(message);
			});
		});
	}

	

	isUnread() {
		return this.unread;
	}

}
