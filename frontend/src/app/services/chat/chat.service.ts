import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
	private chatSocket = io('http://localhost:3000/api/chat-socket', {
		path: '/api/chat-socket/socket.io',
		timeout: 50000,
		ackTimeout: 10000
		// TO DO : add auth details (cookie or token)
		// auth: {
		// 	token: localStorage...
		// },
	});

	constructor() {
		this.chatSocket.onAny((event, ...args) => {
			console.log("CHAT-SOCK EVENT: ");
			console.log(event, args);
		});
		this.newUserRegister();
	}

	newUserRegister() : void {
		this.chatSocket.emit('message', "new chatSocket", (err: any) => {
			if (err) {
				console.log("chat-sock error: ");
				console.log(err.message);
			}
		})
	}

	sendMessage(message: string): void {
		this.chatSocket.emit('message', message, (err: any) => {
			if (err) {
				console.log("chat-sock error: ");
				console.log(err);
			}
		});
	}

	getMessages(): Observable<string> {
		return new Observable((observer) => {
			this.chatSocket.on('message', (message) => {
				observer.next(message);
			});
		});
	}
}
