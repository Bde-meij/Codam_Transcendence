import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/sock/game/game.service';
import{Actor,Engine,Color,Keys,vec,ExcaliburGraphicsContext,Vector}from "excalibur";
import{Player,Ball,addAfterImage}from "./gameActors";
import{makeLines,drawScore,leftScorePos,rightScorePos}from "./lineDrawing";
import { NgIf } from '@angular/common';

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
	leftPlayer = (new Player(this.width*0.1, this.height/2)).returnAct();
	rightPlayer = (new Player(this.width*0.9, this.height/2)).returnAct();
	squareBall = (new Ball(this.width/2, this.height/2).returnAct());
	ballShadows = addAfterImage(this.squareBall);
	hitXWall: boolean = false;
	hitYWall: boolean = false;
	hitPlayer: boolean = false;

	winner:string = "none";
	playernum: number = 0;

	lScore: number = 0;
	rScore: number = 0;

	inviteKey: number = 0;

	READY: boolean = false;

	constructor(private gameSrv: GameService){};

	game = new Engine(
	{
		width: this.width,
		height: this.height,
		backgroundColor: Color.Black,
	});
	
	ngOnInit()
	{
		this.gameSrv.connect();

		// if (client invited someone, or is invited)
		// 	invitekey = unique number
		this.gameSrv.joinRoom(this.inviteKey);

		this.gameSrv.assignPlayer().subscribe((playnum) => {
			console.log(playnum);
			this.playernum = playnum;
		});
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
				this.gameSrv.updateBall();
			}
		});

		this.gameSrv.getBallPos().subscribe((ballPos) =>
		{
			this.ballShadows[2].pos = this.ballShadows[1].pos;
			this.ballShadows[1].pos = this.ballShadows[0].pos;
			this.ballShadows[0].pos = this.squareBall.pos;
			this.squareBall.pos.x = ballPos[0];
			this.squareBall.pos.y = ballPos[1];
		})

		this.gameSrv.getPlayerPos().subscribe((ypos) => 
		{
			if (this.playernum == 1)
				this.rightPlayer.pos.y = ypos;
			if (this.playernum == 2)
				this.leftPlayer.pos.y = ypos;
		});

		
		this.leftPlayer.on("collisionstart", () => 
		{
			if ((this.playernum == 1) && (!this.hitPlayer))
				{
				this.hitPlayer = true;
				if (this.game.input.keyboard.isHeld(Keys.ArrowUp))
					this.gameSrv.emitPlayerBounce(-2);
				else if (this.game.input.keyboard.isHeld(Keys.ArrowDown))
					this.gameSrv.emitPlayerBounce(2);
				else
					this.gameSrv.emitPlayerBounce(0);
				setTimeout(()=>{this.hitPlayer = false;},500);
			}
		});
		
		this.rightPlayer.on("collisionstart", () => 
		{
			if ((this.playernum == 2) && (!this.hitPlayer))
				{
					this.hitPlayer = true;
				if (this.game.input.keyboard.isHeld(Keys.ArrowUp))
					this.gameSrv.emitPlayerBounce(-2);
				else if (this.game.input.keyboard.isHeld(Keys.ArrowDown))
					this.gameSrv.emitPlayerBounce(2);
				else
					this.gameSrv.emitPlayerBounce(0);
				setTimeout(()=>{this.hitPlayer = false;},500);
			}
		});
	
		this.gameSrv.getScores().subscribe((scores) =>
		{
			this.lScore = scores[0];
			this.rScore = scores[1];
		});

		this.gameSrv.playerWin().subscribe((pName: string) => 
		{
			this.winner = pName;
			alert(pName+" is the winner!");
			this.ngOnDestroy();
		});
			
		var score = new Actor;
		score.graphics.onPostDraw = 
		(ctx: ExcaliburGraphicsContext) =>
		{
			drawScore(ctx, this.lScore, leftScorePos);
			drawScore(ctx, this.rScore, rightScorePos);
		}
		
		this.game.add(makeLines());
		this.game.add(this.leftPlayer);
		this.game.add(this.rightPlayer);
		this.game.add(this.squareBall);
		this.game.add(this.ballShadows[2]);
		this.game.add(this.ballShadows[1]);
		this.game.add(this.ballShadows[0]);
		this.game.add(score);
		this.game.start();
	}

	ngOnDestroy() 
	{
		this.game?.stop();
		this.game?.canvas.remove();
		// delete this.game;
		this.gameSrv.disconnect();
	}
}
