import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { SockService } from '../sock.service';

@Injectable({
  providedIn: 'root'
})
export class GameService{
	private gameSocket = io("/game");

	constructor(sockService: SockService) {
		// for debugging:
		this.gameSocket.onAny((event, ...args) => {
			console.log("GAME-SOCK EVENT: ");
			console.log(event, args);
		});
		sockService.newSocketRegister("gameSocket");
	}

	// other functionality
}
