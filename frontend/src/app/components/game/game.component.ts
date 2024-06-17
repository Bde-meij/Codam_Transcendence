import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/sock/game/game.service';
import{Actor,Engine,Color,Keys, Label, Font, ExcaliburGraphicsContext,Vector, Handler, Graphic, TextAlign}from "excalibur";
import{Player,Ball,addAfterImage}from "./gameActors";
import{makeLines,drawScore,leftScorePos,rightScorePos}from "./lineDrawing";
import { NgIf } from '@angular/common';
import {Router } from "@angular/router";
import { SockService } from '../../services/sock/sock.service';

@Component({
	selector: 'app-game',
	standalone: true,
	imports: [NgIf],
	templateUrl: './game.component.html',
	styleUrl: './game.component.scss'
})

export class GameComponent implements OnInit, OnDestroy
{
	title = "1v1 PONG";

	height = 600;
	width = this.height/3 * 4;
	lines = makeLines();
	leftPlayer = (new Player(this.width*0.1, this.height/2)).returnAct();
	rightPlayer = (new Player(this.width*0.9, this.height/2)).returnAct();
	squareBall = (new Ball(this.width/2, this.height/2).returnAct());
	ballShadows = addAfterImage(this.squareBall);
	hitXWall: boolean = false;
	hitYWall: boolean = false;
	hitPlayer: boolean = false;

	name:string = "none";
	playernum: number = 0;

	lScore: number = 0;
	rScore: number = 0;

	READY: boolean = false;
	router = new Router;

	game = new Engine(
	{
		width: this.width,
		height: this.height,
		backgroundColor: Color.Black,
	});

	leftPNameText = new Label({
		color: Color.White,
		x: 200,
		y: 20,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 25,
		  }),
	})

	rightPNameText = new Label({
		color: Color.White,
		x: 600,
		y: 20,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 25,
		  }),
	})

	timerText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "3",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 80,
		  }),
	})

	waitText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		text: "Awaiting other player...",
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})

	winText = new Label({
		color: Color.White,
		x: 400,
		y: 250,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})

	abortText = new Label({
		color: Color.White,
		x: 400,
		y: 125,
		font: new Font({
			textAlign: TextAlign.Center,
			size: 40,
		  }),
	})
	gameSrv: any
	ngOnInit()
	{
		this.gameSrv = new GameService();
		// this.gameSrv.connect();
		console.log("NOTICE ME SENPAI");
		// setTimeout(() =>{{
		// }},1000);
		
		this.gameSrv.connectSignal().subscribe(() => 
		{
			this.game.add(this.waitText);
			this.game.add(this.leftPNameText);
			this.game.add(this.rightPNameText);
			this.game.start();
			this.gameSrv.joinGame();
		});

		this.gameSrv.abortGame().subscribe(() => 
		{
			console.log("join game called");
			this.game.remove(this.waitText);
			this.game.remove(this.leftPNameText);
			this.game.remove(this.rightPNameText);
			this.abortText.text = "game aborted";
			setTimeout(() =>{{this.ngOnDestroy();}},2000);
			this.game.add(this.abortText);
		});

		this.gameSrv.assignNumber().subscribe((playnum: number) => {
			console.log("number", playnum, "was assigned");
			this.playernum = playnum;
		});
		
		this.gameSrv.assignNames().subscribe((names: string[]) => {
			this.leftPNameText.text = names[0];
			this.rightPNameText.text = names[1];
			this.game.remove(this.waitText);
		});

		this.gameSrv.startSignal().subscribe(() => {
			this.game.add(this.timerText);
			setTimeout(() =>{{this.timerText.text = "2"}},1000);
			setTimeout(() =>{{this.timerText.text = "1"}},2000);
			setTimeout(() =>{{this.timerText.text = "GO!"}},3000);
			setTimeout(() =>{{
				this.game.remove(this.timerText);
				this.startGame();
			}},4000);
		});
	}

	startGame()
	{
		console.log("startGame called");
		var score = new Actor;
		score.graphics.onPreDraw = 
		(ctx: ExcaliburGraphicsContext) =>
		{
			drawScore(ctx, this.lScore, leftScorePos);
			drawScore(ctx, this.rScore, rightScorePos);
		}
		this.game.add(this.lines);
		this.game.add(this.leftPlayer);
		this.game.add(this.rightPlayer);
		this.game.add(this.squareBall);
		this.game.add(this.ballShadows[2]);
		this.game.add(this.ballShadows[1]);
		this.game.add(this.ballShadows[0]);
		this.game.add(score);

		console.log("frontend game initiated");

		this.game.on("postupdate", () => 
		{
			if (this.playernum == 1)
			{
				if (this.game.input.keyboard.isHeld(Keys.Up) && 
				this.leftPlayer.pos.y > this.leftPlayer.height / 2)
				{
					this.leftPlayer.pos.y -= this.height*0.025;
					this.gameSrv.emitYPos(this.leftPlayer.pos.y);
				}
				if (this.game.input.keyboard.isHeld(Keys.Down) && 
				this.leftPlayer.pos.y < this.height - this.leftPlayer.height / 2)
				{
					this.leftPlayer.pos.y += this.height*0.025;
					this.gameSrv.emitYPos(this.leftPlayer.pos.y);
				}
			}
			if (this.playernum == 2)
			{
				if (this.game.input.keyboard.isHeld(Keys.Up) && 
				this.rightPlayer.pos.y > this.rightPlayer.height / 2)
				{
					this.rightPlayer.pos.y -= this.height*0.025;
					this.gameSrv.emitYPos(this.rightPlayer.pos.y);
				}
				if (this.game.input.keyboard.isHeld(Keys.Down) && 
				this.rightPlayer.pos.y < this.height - this.rightPlayer.height / 2)
				{
					this.rightPlayer.pos.y += this.height*0.025;
					this.gameSrv.emitYPos(this.rightPlayer.pos.y);
				}
				// TESTBOT
				// this.rightPlayer.pos.y = this.squareBall.pos.y;
				// this.gameSrv.emitYPos(this.rightPlayer.pos.y);
			}
		});

		this.gameSrv.abortGame().subscribe(() => 
			{
				console.log("join game called");
				this.game.remove(this.waitText);
				this.game.remove(this.leftPNameText);
				this.game.remove(this.rightPNameText);
				this.abortText.text = "game aborted";
				setTimeout(() =>{{this.ngOnDestroy();}},2000);
				this.game.add(this.abortText);
			});

		this.gameSrv.getBallPos().subscribe((ballPos: number[]) =>
		{
			this.ballShadows[2].pos = this.ballShadows[1].pos;
			this.ballShadows[1].pos = this.ballShadows[0].pos;
			this.ballShadows[0].pos = this.squareBall.pos;
			this.squareBall.pos.x = ballPos[0];
			this.squareBall.pos.y = ballPos[1];
		})

		this.gameSrv.getPlayerPos().subscribe((ypos: number) => 
		{
			if (this.playernum == 1)
				this.rightPlayer.pos.y = ypos;
			if (this.playernum == 2)
				this.leftPlayer.pos.y = ypos;
		});
	
		this.gameSrv.getScores().subscribe((scores: number []) =>
		{
			this.lScore = scores[0];
			this.rScore = scores[1];
		});

		this.gameSrv.playerWin().subscribe((pName: string) => 
		{
			this.game.remove(this.lines);
			this.game.remove(this.leftPlayer);
			this.game.remove(this.rightPlayer);
			this.game.remove(this.squareBall);
			this.game.remove(this.ballShadows[2]);
			this.game.remove(this.ballShadows[1]);
			this.game.remove(this.ballShadows[0]);
			this.winText.text = pName+"\nis the winner!";
			setTimeout(() =>{{this.ngOnDestroy();}},2000);
			this.game.add(this.winText);
		});
	}

	ngOnDestroy() 
	{
		console.log("game is destroyed");
		this.game.stop();
		this.game.canvas.remove();
		this.gameSrv.disconnect();
		this.gameSrv.ngOnDestroy();
		this.router.navigate(['/dashboard/game-menu']);
	}
}
