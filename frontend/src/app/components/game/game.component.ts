import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/sock/game/game.service';
import{Actor,Engine,Color,Keys, ExcaliburGraphicsContext,Vector, Handler, Graphic, TextAlign}from "excalibur";
import{Player,Ball,addAfterImage}from "./gameActors";
import{makeLines,drawScore,leftScorePos,rightScorePos}from "./lineDrawing";
import {leftPNameText, rightPNameText, timerText, waitText, winText, abortText} from './texts';
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
	router = new Router;

	hitXWall: boolean = false;
	hitYWall: boolean = false;
	hitPlayer: boolean = false;
	READY: boolean = false;

	playernum: number = 0;
	lScore: number = 0;
	rScore: number = 0;

	game = new Engine(
	{
		width: this.width,
		height: this.height,
		backgroundColor: Color.Black,
	});

	gameSrv: any
	ngOnInit()
	{
		this.gameSrv = new GameService();
		
		this.gameSrv.connectSignal().subscribe(() => 
		{
			this.game.add(waitText);
			this.game.add(leftPNameText);
			this.game.add(rightPNameText);
			this.game.start();
			this.gameSrv.joinGame();
		});

		this.checkEarlyDisconnect();

		this.gameSrv.assignNumber().subscribe((playnum: number) => {
			console.log("number", playnum, "was assigned");
			this.playernum = playnum;
		});
		
		this.gameSrv.assignNames().subscribe((names: string[]) => {
			leftPNameText.text = names[0];
			rightPNameText.text = names[1];
			this.game.remove(waitText);
		});

		this.gameSrv.startSignal().subscribe(() => {
			this.game.add(timerText);
			timerText.text = "3"
			setTimeout(() =>{{timerText.text = "2"}},1000);
			setTimeout(() =>{{timerText.text = "1"}},2000);
			setTimeout(() =>{{timerText.text = "GO!"}},3000);
			setTimeout(() =>{{
				this.game.remove(timerText);
				this.startGame();
			}},4000);
		});
	}

	startGame()
	{
		// console.log("startGame called");
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

		this.game.on("postupdate", () => 
		{
			// TESTBOT
			// this.rightPlayer.pos.y = this.squareBall.pos.y;
			// this.gameSrv.emitYPos(this.rightPlayer.pos.y);
			if (this.playernum == 1)
				this.playerMovement(this.leftPlayer);
			if (this.playernum == 2)
				this.playerMovement(this.rightPlayer);
			if (this.playernum == 3)
				this.flappyMovement(this.leftPlayer);
			if (this.playernum == 4)
				this.flappyMovement(this.rightPlayer);
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
			if ((this.playernum == 1) || (this.playernum == 3))
				this.rightPlayer.pos.y = ypos;
			if ((this.playernum == 2) || (this.playernum == 4))
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
			winText.text = pName+"\nis the winner!";
			setTimeout(() =>{{this.ngOnDestroy();}},2000);
			this.game.add(winText);
		});
	}

	playerMovement(player: Actor)
	{
		if (this.game.input.keyboard.isHeld(Keys.Up) && 
		player.pos.y > player.height / 2)
		{
			player.pos.y -= this.height*0.025;
			this.gameSrv.emitYPos(player.pos.y);
		}
		if (this.game.input.keyboard.isHeld(Keys.Down) && 
		player.pos.y < this.height - player.height / 2)
		{
			player.pos.y += this.height*0.025;
			this.gameSrv.emitYPos(player.pos.y);
		}
	}

	flappyMovement(player: Actor)
	{
		if (this.game.input.keyboard.wasPressed(Keys.Space) && 
		player.pos.y > player.height / 2)
		{
			player.pos.y -= this.height*0.175;
			this.gameSrv.emitYPos(player.pos.y);
		}
		else if (player.pos.y < this.height - player.height / 2)
		{
			player.pos.y += this.height*0.0125;
			this.gameSrv.emitYPos(player.pos.y);
		}
	}

	checkEarlyDisconnect()
	{
		this.gameSrv.abortGame().subscribe(() => 
		{
			this.game.remove(waitText);
			this.game.remove(leftPNameText);
			this.game.remove(rightPNameText);
			abortText.text = "game aborted";
			setTimeout(() =>{{this.ngOnDestroy();}},2000);
			this.game.add(abortText);
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
