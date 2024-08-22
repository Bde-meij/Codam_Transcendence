import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class GameService{
	gameSocket : Socket;

	constructor() {
		this.gameSocket = io("/game");
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
				observ.next(yPos);
			});
		});
	}

	flappyGravity(): Observable<number[]>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("flappyGravity", (yPos: number[]) =>
			{
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

	connectSignal()
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("connectSignal", () =>
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

	abortGame(): Observable<string>
	{
		return new Observable((observ) => 
		{
			this.gameSocket.on("abortGame", (playerName: string) =>
			{
				observ.next(playerName);
			});
		});
	}

	joinGame()
	{
		this.gameSocket.emit("joinGame");
	}

	emitYPos(playerPos :number)
	{
		this.gameSocket.emit("updatePlayer", playerPos);
	}
}