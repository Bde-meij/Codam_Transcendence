import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SockService } from '../sock.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService{
	private chatSocket = io("/chat");

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
