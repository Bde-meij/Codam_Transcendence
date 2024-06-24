import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from "@angular/router";
import { SockService } from '../../services/sock/sock.service';
import { Actor,Engine,Color,CollisionType,Keys,Vector } from "excalibur";
import { makePlayers, playerMovement } from "./Players";
import{ io }from "socket.io-client";


@Component({
	selector: 'app-bossGame',
	standalone: true,
	imports: [NgIf],
	templateUrl: './bossGame.component.html',
	styleUrl: './bossGame.component.scss'
})

export class BossGameComponent implements OnInit, OnDestroy
{
	fullSize = 800;
	halfSize = this.fullSize / 2;
	radius = ( this.halfSize / 8) * 7;
	bossHit = false;
	damageCounter = 0;
	playerLives = 3;

	bounced: boolean = false;

	playernum: number = 0;
	gameSrv = io('/bossPong');

	game = new Engine({
		width:  this.fullSize,
		height:  this.fullSize,
		backgroundColor: Color.Black,
	});

	players: Actor[] = makePlayers();

	bigBoss = new Actor({
		x:  this.halfSize,
		y:  this.halfSize,
		radius: this.fullSize*0.1,
		color: Color.DarkGray,
		collisionType: CollisionType.Fixed
	});

	lifebar = new Actor({
		x:  this.halfSize,
		y:  this.halfSize - this.radius*1.1,
		width: this.fullSize*0.9,
		height: ( this.halfSize - this.radius)/4,
		color: Color.Green,
		collisionType: CollisionType.Fixed,
	});

	shuriken = new Actor({
		// this.radius: this.fullSize*0.01,
		width:  this.halfSize/25,
		height:  this.halfSize/25,
		color: Color.LightGray,
		x:  this.halfSize,
		y: this.fullSize*0.2,
		collisionType: CollisionType.Passive,
	});

	ngOnInit()
	{
		console.log("init")
		this.game.add(this.bigBoss);
		this.game.add(this.shuriken);
		this.game.add(this.lifebar);
		this.game.add(this.players[0]);
		this.game.add(this.players[1]);
		this.game.add(this.players[2]);
		this.game.add(this.players[3]);
		this.game.start();
		
		
		this.gameSrv.on("connectSignal", () =>
		{
			console.log("connected, ask join")
			this.gameSrv.emit("joinGame");
		});
		
		this.gameSrv.on('assignNumber', (playNum)  =>
		{
			console.log("number assigned", playNum);
			this.playernum = playNum;
		});

		this.gameSrv.on("startSignal", () =>
		{
			console.log("should start")
			this.startGame();
		})
	}

	startGame()
	{
		this.game.on("postupdate", ()=>
		{
			this.shuriken.rotation += 0.27;

			if (this.playernum == 8)
				this.singleplayerMovement();
			else
				this.multiplayerMovement();
			
			if (this.bounced == true)
				setTimeout(() => {this.bounced = false}, 500);
		});

		this.gameSrv.on('updatePlayerPos', (args) =>
		{
			console.log("player", args[2], "should be updated");
			this.players[args[2]].pos.x = args[0];
			this.players[args[2]].pos.y = args[1];
			this.players[args[2]].rotation = args[3];
		});


		this.gameSrv.on("updateShurikenPos", (position: number[])=>
		{
			this.shuriken.pos.x = position[0];
			this.shuriken.pos.y = position[1];
		});

		this.gameSrv.on("bossDMG", ()=>
		{
			console.log("bossDMG")
			this.lifebar.actions.scaleBy(new Vector(-0.1, 0), 2);
			this.damageCounter+=1;
			if (this.damageCounter > 8)
				this.lifebar.color = Color.Red;
			else if (this.damageCounter > 4)
				this.lifebar.color = Color.Orange;
			this.game.currentScene.camera.shake( this.halfSize*0.05,  this.halfSize*0.05, 350);
		});
		this.gameSrv.on("bossColor", (colNum: number)=>
		{
			if (colNum == 1)
				this.bigBoss.color = Color.Red;
			if (colNum == 2)
				this.bigBoss.color = Color.Gray;
		});

		for (var i = 0; i < 4; i++)
			this.checkPlayerCollision(i);
	}

	singleplayerMovement()
	{
		if (this.game.input.keyboard.isHeld(Keys.A))
		{
			var i = 0;
			while (i < 4)
			{
				playerMovement(this.players[i], Keys.A);
				i++;
			}
		}
		if (this.game.input.keyboard.isHeld(Keys.D))
		{
			var i = 0;
			while (i < 4)
			{
				playerMovement(this.players[i], Keys.D);
				i++;
			}
		}
	}

	multiplayerMovement()
	{
		if (this.game.input.keyboard.isHeld(Keys.A))
		{
			var i = this.playernum-1;
			playerMovement(this.players[i], Keys.A);
			this.gameSrv.emit("updatePlayers", this.players[i].pos.x, 
			this.players[i].pos.y, i, this.players[i].rotation)
		}
		if (this.game.input.keyboard.isHeld(Keys.D))
		{
			var i = this.playernum-1;
			playerMovement(this.players[i], Keys.D);
			this.gameSrv.emit("updatePlayers", this.players[i].pos.x, 
			this.players[i].pos.y, i, this.players[i].rotation)
		}
	}

	checkPlayerCollision(i: number)
	{
		this.players[i].on("collisionstart", () => 
		{
			if (this.bounced == false)
			{
				this.bounced = true;
				if ((this.playernum == i+1) || (this.playernum == 8))
				{
					this.gameSrv.emit("bouncePlayer", 
					[this.players[i].pos.x, this.players[i].pos.y],);
				}
			}
		});
	}	
	
	ngOnDestroy() 
	{
		console.log("game is destroyed");
		this.game.stop();
		this.game.canvas.remove();
		this.gameSrv.disconnect();
		// this.gameSrv.ngOnDestroy();
		// this.router.navigate(['/dashboard/game-menu']);
	}
}
