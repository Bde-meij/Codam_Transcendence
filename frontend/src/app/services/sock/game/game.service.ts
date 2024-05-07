import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

export interface Positions {
	yPosP1: number;
	yPosP2: number;
}

@Injectable({
	providedIn: 'root'
})
export class GameService {
	private gameSocket = io('/api/game-socket', {
		path: '/api/game-socket/socket.io',
		timeout: 50000,
		ackTimeout: 10000
		// TO DO : add auth details (cookie or token)
		// auth: {
		// 	token: localStorage...
		// },
	});

	constructor() {
		// for debugging:
		this.gameSocket.onAny((event, ...args) => {
			console.log("GAME-SOCK EVENT: ");
			console.log(event, args);
		});
		this.newUserRegister();
	}

	// for debugging:
	newUserRegister() : void {
		this.gameSocket.emit('game', "new gameSocket", (err: any) => {
			if (err) {
				console.log("game-sock error: ");
				console.log(err.message);
			}
		})
	}

	// other functionality
}
