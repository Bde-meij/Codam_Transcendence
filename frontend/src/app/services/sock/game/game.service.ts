import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { SockService } from '../sock.service';

@Injectable({
  providedIn: 'root'
})
export class GameService{
	private gameSocket = io("/game", {
		autoConnect: false
	});

	constructor(sockService: SockService) {
		// for debugging:
		this.gameSocket.on("connect", () => {
			console.log(this.gameSocket.connected); // true
		});

		this.gameSocket.on("disconnect", () => {
			console.log(this.gameSocket.connected); // false
		});

		this.gameSocket.onAny((event, ...args) => {
			console.log("GAME-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("gameSocket");
	}

	// other functionality
	connect() {
		return this.gameSocket.connect();
	}
	
	disconnect() {
		return this.gameSocket.disconnect();
	}
}
