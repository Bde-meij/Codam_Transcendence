import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
	private socket = io('/api/chat-socket', {
		path: '/api/chat-socket/socket.io'
	});

	constructor() { };

	sendMessage(message: string): void {
		this.socket.emit('message', message);
	}

	getMessages(): Observable<string> {
		return new Observable((observer) => {
			this.socket.on('message', (message) => {
				observer.next(message);
			});
		});
	}
}
