import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
	providedIn: 'root'
})
export class SockService {
	private mainSocket = io ({
		path: '/sock',
		timeout: 50000,
		ackTimeout: 10000
		// TO DO : add auth details (cookie or token)
		// auth: {
		// 	token: localStorage...
		// },
	})

	constructor() {
		this.mainSocket.onAny((event, ...args) => {
			console.log("MAIN-SOCK EVENT: ");
			console.log(event, args);
		});
		this.newSocketRegister("mainSocket");
	}

	newSocketRegister(socketName: string) : void {
		this.mainSocket.emit('message', "new " + socketName, (err: any) => {
			if (err) {
				console.log("main-sock error: ");
				console.log(err.message);
			}
		})
	}
}
