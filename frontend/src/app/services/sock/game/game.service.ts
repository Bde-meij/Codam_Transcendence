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

	connect() {
		return this.gameSocket.connect();
	}
	
	disconnect() {
		return this.gameSocket.disconnect();
	}

	assignNumber(): Observable<number>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on('assignNumber', (playNum: number) =>
			{
				console.log("player assigned with", playNum);
				observ.next(playNum);
			});
		});
	}
	assignNames(): Observable<string[]>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on('assignNames', (playNames: string[]) =>
			{
				console.log("player assigned with", playNames);
				observ.next(playNames);
			});
		});
	}

	getPlayerPos(): Observable<number>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("updatePlayerPos", (yPos: number) =>
			{
				console.log("receive playerpos");
				observ.next(yPos);
			});
		});
	}

	getScores(): Observable<number[]>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("updateScore", (scores: number[]) =>
			{
				observ.next(scores);
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

	startSignal()
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("startSignal", () =>
			{
				observ.next();
			});
		});
	}

	playerWin(): Observable<string>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("playerwin", (playerName: string) =>
			{
				observ.next(playerName);
			});
		});
	}

	joinRoom()
	{
		this.gameSocket.emit("joinRoom");
	}

	emitYPos(playerPos :number)
	{
		this.gameSocket.emit("updatePlayer", playerPos);
	}
}