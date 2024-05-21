import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SockService } from '../sock.service';

@Injectable({
  providedIn: 'root'
})
export class GameService{
	private gameSocket = io("/game");

	private unread = false;

	constructor(sockService: SockService) {
		this.gameSocket.onAny((event, ...args) => {
			console.log("game-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("gameSocket");
	}

	sendMessage(message: string): void {
		this.gameSocket.emit('message', message, (err: any) => {
			if (err) {
				console.log("game-sock error: ");
				console.log(err);
			}
		});
	}

	getMessages(): Observable<string> {
		return new Observable((observer) => {
			this.gameSocket.on('message', (message) => {
				observer.next(message);
			});
		});
	}
	 
	isUnread() {
		return this.unread;
	}
}
