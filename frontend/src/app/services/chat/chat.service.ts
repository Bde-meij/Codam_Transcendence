import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
	private socket = io('/api/chat')

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

	// sendMessage(message: String) {
	// 	this.socket.emit('new-message', message);
	// };


	// getMessages() {
	// 	let observable = new Observable<{ message: string }>(observer => {
	// 	  this.socket.on('new-message', (data) => {
	// 		observer.next(data);
	// 	  });
	// 	  return () => { this.socket.disconnect(); };  
	// 	});
	// 	return observable;
	//   }
	
	// getMessages() {
	// 	let observable = new Observable<{user: String, message: String}>(observer => {
	// 		this.socket.on('new-message', (data) => {
	// 			observer.next(data);
	// 		});
	// 		return () => { this.socket.disconnect(); };
	// 	});
	// 	return observable;
	// };
}
