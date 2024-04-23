import { Component, OnInit } from '@angular/core';
import{Actor,Engine,Color,Keys,vec,ExcaliburGraphicsContext,Vector}from "excalibur";
import { GameService, Positions } from '../../services/game/game.service';
import { Observable } from 'rxjs';
import{Player,Ball,addAfterImage}from "./gameActors"
import{makeLines,drawScore,leftScorePos,rightScorePos}from "./lineDrawing";

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
    
	title = "my game";
	constructor(private gameService: GameService){};

    pos$:Observable<Positions> | undefined;
    ypositions: Positions | undefined
    
    lScore: number = 0;
    rScore: number = 0;
    height: number = 600;
    width: number = this.height/3 * 4;
	playerSpeed = this.height * 0.025;
	ballMod = this.height*0.15;

    hitXWall: boolean = false;
    hitYWall: boolean = false;

    leftPlayer = (new Player(this.width*0.1, this.height/2)).returnAct();
    rightPlayer = (new Player(this.width*0.9, this.height/2)).returnAct();
    squareBall = (new Ball(this.width/2, this.height/2).returnAct());
    ballShadows: Actor[] = addAfterImage(this.squareBall);

	
    public getPos() : void 
    {
		if (this.pos$) 
		{
			this.pos$.subscribe(data => this.ypositions = 
			{
				yPosP1 : data.yPosP1,
				yPosP2 : data.yPosP2,
		})}};
			
		ngOnInit()
		{
			this.pos$ = this.gameService.getPos();
			this.gameService.startKey("1", this.leftPlayer.pos.y).subscribe();
			this.gameService.startKey("2", this.rightPlayer.pos.y).subscribe();
				
		var game = new Engine
		({
			width: this.width,
			height: this.height,
			backgroundColor: Color.Black,
		});
  
        setTimeout(() => {
            this.squareBall.vel = vec(this.height, 0);
          }, 1000);

		// test for LAGS, do not remove
		// const updateLeftPlayer = (player: Actor) =>
		// {
		// 	if (game.input.keyboard.isHeld(Keys.W) && player.pos.y > player.height / 2)
		// 	{
		// 		player.pos.y -= this.playerSpeed;
		// 		this.gameService.keyDown("2", (this.playerSpeed).toString()).subscribe();
		// 	}
		// 	if (game.input.keyboard.isHeld(Keys.S) && player.pos.y < this.height - player.height / 2)
		// 	{
		// 		player.pos.y += this.playerSpeed;
		// 		this.gameService.keyUp("2", (this.playerSpeed).toString()).subscribe();
		// 	}
		// }

		const updateLeftPlayer = (player: Actor) =>
		{
			if (game.input.keyboard.isHeld(Keys.W) && player.pos.y > player.height / 2)
				this.gameService.upKey("1", (this.playerSpeed).toString()).subscribe();
			if (game.input.keyboard.isHeld(Keys.S) && player.pos.y < this.height - player.height / 2)
				this.gameService.downKey("1", (this.playerSpeed).toString()).subscribe();
		}
		
		const updateRightPlayer = (player: Actor) =>
		{
			if (game.input.keyboard.isHeld(Keys.Up) && player.pos.y > player.height / 2)
				this.gameService.upKey("2", (this.playerSpeed).toString()).subscribe();
			if (game.input.keyboard.isHeld(Keys.Down) && player.pos.y < this.height - player.height / 2)
				this.gameService.downKey("2", (this.playerSpeed).toString()).subscribe();
			if (game.input.keyboard.wasPressed(Keys.Space)) (this.lScore += 1), (this.rScore += 1);
		}

		const resetBall = (vel: number) =>
		{
			this.squareBall.pos.y = this.height / 2;
			this.squareBall.pos.x = this.width / 2;
			this.ballShadows[0].pos = this.squareBall.pos;
			this.ballShadows[1].pos = this.squareBall.pos;
			this.ballShadows[2].pos = this.squareBall.pos;
			this.squareBall.vel = vec(0, 0);
			setTimeout(() =>{this.squareBall.vel = vec(vel, 0);},1000);
		}
		
		let hitPlayer: boolean = false;
		this.squareBall.on("collisionstart", () =>
		{
			if (!hitPlayer)
			{
				hitPlayer = true;
				this.squareBall.vel.x *= -1;
			}
		});

		const wallBounce = () =>
{
	if ((this.squareBall.pos.y < 5 || this.squareBall.pos.y > this.height-5) 
	&& (!this.hitYWall))
	{
		this.hitYWall = true;
		this.squareBall.vel.y *= -1;
		if (Math.abs(this.squareBall.vel.y) < 2)
			this.squareBall.vel.y *= 10;
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
		resetBall(-this.height);
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
		resetBall(this.height);
	}
}

this.leftPlayer.on("collisionstart", () => 
	{
		if (game.input.keyboard.isHeld(Keys.W))
			this.squareBall.vel.y -= this.height*0.15;
		if (game.input.keyboard.isHeld(Keys.S))
			this.squareBall.vel.y += this.height*0.15;
	});
	
	this.rightPlayer.on("collisionstart", () => 
	{
		if (game.input.keyboard.isHeld(Keys.ArrowUp))
			this.squareBall.vel.y -= this.ballMod;
		if (game.input.keyboard.isHeld(Keys.ArrowDown))
			this.squareBall.vel.y += this.ballMod;
	});

		game.on("postupdate", () => {updateLeftPlayer(this.leftPlayer)});
		game.on("postupdate", () => {updateRightPlayer(this.rightPlayer)});
		this.squareBall.on("postupdate",()=>{this.hitXWall=false, this.hitYWall=false;});
		this.squareBall.on("collisionend",()=>{hitPlayer=false;});
		this.squareBall.on("preupdate", () =>
		{
			checkScoring();
			wallBounce();
		});

		// updates postition
		game.on("preupdate", () => 
		{
				this.getPos();
				var idiotvar: number | undefined = 0;
				idiotvar = this.ypositions?.yPosP1;
				if (idiotvar)
					this.leftPlayer.pos.y = idiotvar;
				idiotvar = this.ypositions?.yPosP2;
				if (idiotvar)
					this.rightPlayer.pos.y = idiotvar;
        });

		var score = new Actor;
		score.graphics.onPostDraw = 
		(ctx: ExcaliburGraphicsContext) =>
		{
			drawScore(ctx, this.lScore, leftScorePos);
			drawScore(ctx, this.rScore, rightScorePos);
		}

		game.add(makeLines());
		game.add(this.leftPlayer);
		game.add(this.rightPlayer);
		game.add(this.squareBall);
		game.add(this.ballShadows[2]);
		game.add(this.ballShadows[1]);
		game.add(this.ballShadows[0]);
		game.add(score);
        game.start();
    }
}