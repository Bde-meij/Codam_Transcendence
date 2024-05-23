import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { SockService } from '../sock.service';
import { Observable } from 'rxjs';

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

	// https://rxjs.dev/guide/observable

	assignPlayer(): Observable<number>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on('assignPlayer', (playNum: number) =>
			{
				console.log("player assigned with", playNum);
				observ.next(playNum);
			});
		});
	}

	getPlayerPos(): Observable<number>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on('updatePlayerPos', (yPos: number) =>
			{
				console.log("player assigned with", yPos);
				observ.next(yPos);
			});
		});
	}

	getBallPos(): Observable<number[]>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on('updateBallPos', (ballPos: number[]) =>
			{
				observ.next(ballPos);
			});
		});
	}

	updateBall()
	{
		this.gameSocket.emit("updateBall");
	}

	emitPYPos(playerPos :number)
	{
		this.gameSocket.emit("updatePlayer", playerPos);
	}

	emitPlayerBounce(effect :number)
	{
		this.gameSocket.emit("playerbounce", effect);
	}

	emitWallBounce()
	{
		this.gameSocket.emit("wallbounce");
	}

	emitResetBall(direction: number)
	{
		this.gameSocket.emit("resetball", direction);
	}


}
