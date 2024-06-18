import { Injectable, OnDestroy } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { SockService } from '../sock.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})

export class GameService implements OnDestroy{
	gameSocket = io("/game");
	
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
				// console.log("player assigned with", playNum);
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
				// console.log("player assigned with", playNames);
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
				// console.log("receive playerpos");
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
				console.log("abortGame service called");
				observ.next(playerName);
			});
		});
	}

	joinGame()
	{
		console.log("joining gaime");
		this.gameSocket.emit("joinGame");
	}

	emitYPos(playerPos :number)
	{
		this.gameSocket.emit("updatePlayer", playerPos);
	}

	ngOnDestroy() 
	{
	}
}