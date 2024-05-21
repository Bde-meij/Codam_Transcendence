import { Component, OnDestroy, OnInit } from '@angular/core';
import{Actor,Engine,Color,Keys,vec,ExcaliburGraphicsContext,Vector}from "excalibur";
import{Player,Ball,addAfterImage}from "./gameActors";
import{makeLines,drawScore,leftScorePos,rightScorePos}from "./lineDrawing";

import { GameService } from '../../services/sock/game/game.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
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
	playernum: number = 0;
	lScore: number = 0;
	rScore: number = 0;


	// constructor(private gameSrv: GameService){};

	game = new Engine(
	{
		width: this.width,
		height: this.height,
		backgroundColor: Color.Black,
	});
	
	// constructor(sockService: SockService) {
	// this.gameSrv.onAny((event, ...args) => {
	// 		console.log("CHAT-SOCK EVENT: ");
	// 		console.log(event, args);
	// 	});
	// 	sockService.newSocketRegister("gameSrv");
	// }
	ngOnInit()
	{
		console.log("frontend game initiated");
		

		this.gameSrv.on('assignPlayer', (playNum: number) =>
		{
			console.log("player assigned with", playNum);
			this.playernum = playNum;
		})
		
		this.game.on("postupdate", () => 
		{
			if (this.playernum == 1)
			{
				if (this.game.input.keyboard.isHeld(Keys.Up) && 
				this.leftPlayer.pos.y > this.leftPlayer.height / 2)
					this.leftPlayer.pos.y -= this.height*0.025;
				if (this.game.input.keyboard.isHeld(Keys.Down) && 
				this.leftPlayer.pos.y < this.height - this.leftPlayer.height / 2)
					this.leftPlayer.pos.y += this.height*0.025;
		
				this.gameSrv.emit("updatePlayer", this.leftPlayer.pos.y);
			}
			if (this.playernum == 2)
			{
				if (this.game.input.keyboard.isHeld(Keys.Up) && 
				this.rightPlayer.pos.y > this.rightPlayer.height / 2)
					this.rightPlayer.pos.y -= this.height*0.025;
				if (this.game.input.keyboard.isHeld(Keys.Down) && 
				this.rightPlayer.pos.y < this.height - this.rightPlayer.height / 2)
					this.rightPlayer.pos.y += this.height*0.025;
		
				this.gameSrv.emit("updatePlayer", this.rightPlayer.pos.y);
				this.gameSrv.emit("updateBall");
			}
		});

		this.gameSrv.on('updateBallPos', (newPosition: number[]) =>
			{
				this.ballShadows[2].pos = this.ballShadows[1].pos;
				this.ballShadows[1].pos = this.ballShadows[0].pos;
				this.ballShadows[0].pos = this.squareBall.pos;
				this.squareBall.pos.x = newPosition[0];
				this.squareBall.pos.y = newPosition[1];
			})
			
			this.gameSrv.on('updatePlayerPos', (ypos: number) =>
			{
				if (this.playernum == 1)
					this.rightPlayer.pos.y = ypos;
				if (this.playernum == 2)
					this.leftPlayer.pos.y = ypos;
			})
			
			this.leftPlayer.on("collisionstart", () => 
			{
				if ((this.playernum == 1) && (!this.hitPlayer))
				{
					this.hitPlayer = true;
					if (this.game.input.keyboard.isHeld(Keys.ArrowUp))
						this.gameSrv.emit("playerbounce", -2);
					else if (this.game.input.keyboard.isHeld(Keys.ArrowDown))
						this.gameSrv.emit("playerbounce", 2);
					else
						this.gameSrv.emit("playerbounce", 0);
					setTimeout(()=>{this.hitPlayer = false;},500);
				}
			});
			
			this.rightPlayer.on("collisionstart", () => 
			{
				if ((this.playernum == 2) && (!this.hitPlayer))
				{
					if (this.game.input.keyboard.isHeld(Keys.ArrowUp))
						this.gameSrv.emit("playerbounce", -2);
					else if (this.game.input.keyboard.isHeld(Keys.ArrowDown))
						this.gameSrv.emit("playerbounce", 2);
					else
						this.gameSrv.emit("playerbounce", 0);
					setTimeout(()=>{this.hitPlayer = false;},500);
				}
			});
			
			this.squareBall.on("preupdate", () =>
			{
				checkScoring();
				wallBounce();
			});
				
			const wallBounce = () =>
			{
				if ((this.squareBall.pos.y < 5 || this.squareBall.pos.y > this.height-5) 
				&& (!this.hitYWall) && (this.playernum == 1))
				{
					this.hitYWall = true;
					this.gameSrv.emit("wallbounce")
					setTimeout(()=>{this.hitYWall = false;},500);
				}
			}
				
			const checkScoring = () =>
			{
				if((this.squareBall.pos.x < 0) && !this.hitXWall)
				{
					this.hitXWall = true;
					this.rScore+=1;
					if (this.rScore == 11) 
					{
						alert("right player win!");
						(this.lScore = 0), (this.rScore = 0);
					}
					this.gameSrv.emit("resetball", -1);
					setTimeout(()=>{this.hitXWall = false;},500);
				}
				if((this.squareBall.pos.x > this.width) && !this.hitXWall)
				{
					this.hitXWall = true;
					this.lScore+=1;
					if (this.lScore == 11) 
					{
						alert("left player win!");
						(this.lScore = 0), (this.rScore = 0);
					}
					this.gameSrv.emit("resetball", 1);
					setTimeout(()=>{this.hitXWall = false;},500);
				}
			}
			
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
	};

	ngOnDestroy() 
	{
		this.game?.stop();
		this.game?.canvas.remove();
		// delete this.game;
	}
}