import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from "@angular/router";
import { SockService } from '../../services/sock/sock.service';
import { Actor,Engine,Color,CollisionType,Keys,Vector } from "excalibur";
import { makePlayers, playerMovement, addPlayerShadows, addShurikenShadows, updateShadows } from "./Players";
import{ io }from "socket.io-client";
import {Texts} from './texts';

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
	bossHit: boolean = false;
	damageCounter: number = 0;
	playerLives: number = 0;

	updateHack: number = 0;

	router = new Router;
	bounced: boolean = false;
	texts = new Texts;
	playernum: number = 0;
	gameSrv = io('/bossPong');

	game = new Engine({
		width:  this.fullSize,
		height:  this.fullSize,
		backgroundColor: Color.Black,
	});

	players: Actor[] = makePlayers();
	playerShadows: Actor[] = addPlayerShadows(this.players[0],this.players[1],this.players[2],this.players[3]);

	bigBoss = new Actor({
		x:  this.halfSize,
		y:  this.halfSize,
		radius: this.fullSize*0.1,
		color: Color.Violet,
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
		width:  this.halfSize/25,
		height:  this.halfSize/25,
		color: Color.LightGray,
		x: 400,
		y: 550,
		collisionType: CollisionType.Passive,
	});
	shurikenShadows = addShurikenShadows(this.shuriken);

	ngOnInit()
	{
		this.screenResize();
		window.addEventListener("resize", () =>
		{
			this.screenResize();
		});
		
		this.bossHit = false;
		this.damageCounter = 0;
		this.checkEarlyDisconnect();
		
		this.gameSrv.on("connectSignal", () =>
		{
			// console.log("connected, ask join")
			this.game.add(this.texts.wait);
			this.game.start();
			this.gameSrv.emit("joinGame");
		});
	
		this.gameSrv.on('assignNumber', (playNum: number)  =>
		{
			// console.log("number assigned", playNum);
			this.playernum = playNum;
		});

		this.gameSrv.on("startSignal", () =>
		{
			this.game.remove(this.texts.wait);
			this.texts.timer.text = "3"
			this.game.add(this.texts.timer);
			setTimeout(() =>{{this.texts.timer.text = "2"}},1000);
			setTimeout(() =>{{this.texts.timer.text = "1"}},2000);
			setTimeout(() =>{{this.texts.timer.text = "GO!"}},3000);
			setTimeout(() =>{{
				this.game.remove(this.texts.timer);
				this.startGame();
			}},4000);
		})
	}

	startGame()
	{
		this.addAssets();
		this.gameSrv.emit("startGameLoop");
		
		this.game.on("postupdate", ()=>
		{
			this.updateHack++;
			if (this.updateHack > 10000)
				this.updateHack = 0;
			if ((this.updateHack % 4) == 0)
			{
				updateShadows(this.players[0], this.playerShadows, 0);
				updateShadows(this.players[1], this.playerShadows, 3);
				updateShadows(this.players[2], this.playerShadows, 6);
				updateShadows(this.players[3], this.playerShadows, 9);
			}
			this.shuriken.rotation += 0.27;
			if (this.playernum == 8)
				this.singleplayerMovement();
			else
				this.multiplayerMovement();
			if (this.bounced == true)
				setTimeout(() => {this.bounced = false}, 500);
		});

		this.gameSrv.on('updatePlayerPos', (args: number[]) =>
		{
			this.players[args[2]].pos.x = args[0];
			this.players[args[2]].pos.y = args[1];
			this.players[args[2]].rotation = args[3];
		});

		this.gameSrv.on("updateShurikenPos", (position: number[])=>
		{
			updateShadows(this.shuriken, this.shurikenShadows, 0);
			this.shuriken.pos.x = position[0];
			this.shuriken.pos.y = position[1];
		});

		this.gameSrv.on("bossDMG", ()=>
		{
			// console.log("bossDMG")
			this.lifebar.actions.scaleBy(new Vector(-0.2, 0), 2);
			this.damageCounter+=1;
			if (this.damageCounter > 3)
				this.lifebar.color = Color.Red;
			else if (this.damageCounter > 1)
				this.lifebar.color = Color.Orange;
			this.game.currentScene.camera.shake( this.halfSize*0.05,  this.halfSize*0.05, 350);
		});

		this.gameSrv.on("setBossColor", (indication: number)=>
		{
			if (indication == 1)
				this.bigBoss.color = Color.Violet.darken(0.9);
			if (indication == 2)
				this.bigBoss.color = Color.Violet;
		});

		for (var i = 0; i < 4; i++)
			this.checkPlayerCollision(i);

		this.gameSrv.on("playersWin", () =>
		{
			this.removeAssets();
			this.texts.win.text = "PLAYERS WON!"
			this.game.add(this.texts.win);
			setTimeout(() =>{{
				if (window.location.pathname === '/dashboard/bossPong') {
					this.router.navigate(['/dashboard/game-menu']);
				}
			;}},2000);
		})
		
		this.gameSrv.on("playersLose", () =>
		{
			this.removeAssets();
			this.texts.win.text = "YOU LOST!"
			this.game.add(this.texts.win);
			setTimeout(() =>{{
				if (window.location.pathname === '/dashboard/bossPong') {
					this.router.navigate(['/dashboard/game-menu']);
				}
			;}},2000);
		})

		this.gameSrv.on("outOfBounds", (lives: number) =>
		{
			this.texts.lives.text = lives.toString();
			// console.log("lives left", lives);
		})
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
					[this.players[i].pos.x, this.players[i].pos.y]);
				}
			}
		});
	}

	checkEarlyDisconnect()
	{
		this.gameSrv.on("abortGame", () =>
		{
			this.game.remove(this.texts.wait);
			this.game.remove(this.texts.timer);
			setTimeout(() =>{{
				if (window.location.pathname === '/dashboard/bossPong') {
					this.router.navigate(['/dashboard/game-menu']);
				}
			;}},2000);
			this.game.add(this.texts.abort);
		});
	}

	addAssets()
	{
		this.game.add(this.texts.lives);
		this.game.add(this.bigBoss);
		this.game.add(this.lifebar);
		this.game.add(this.shurikenShadows[2]);
		this.game.add(this.shurikenShadows[1]);
		this.game.add(this.shurikenShadows[0]);
		this.game.add(this.shuriken);
		for (var i = 11; i >= 0; i--)
			this.game.add(this.playerShadows[i]);
		this.game.add(this.players[0]);
		this.game.add(this.players[1]);
		this.game.add(this.players[2]);
		this.game.add(this.players[3]);
	}

	removeAssets()
	{
		this.game.remove(this.texts.lives);
		this.game.remove(this.bigBoss);
		this.game.remove(this.lifebar);
		this.game.remove(this.shuriken);
		this.game.remove(this.shurikenShadows[2]);
		this.game.remove(this.shurikenShadows[1]);
		this.game.remove(this.shurikenShadows[0]);
		for (var i = 11; i >= 0; i--)
			this.game.remove(this.playerShadows[i]);
		this.game.remove(this.players[0]);
		this.game.remove(this.players[1]);
		this.game.remove(this.players[2]);
		this.game.remove(this.players[3]);
	}

	screenResize()
	{
		if (window.innerWidth < window.innerHeight)
			this.game.screen.viewport = {width: window.innerWidth*0.7, height: window.innerWidth*0.7};
		else
			this.game.screen.viewport = {width: window.innerHeight*0.7, height: window.innerHeight*0.7};
		this.game.screen.applyResolutionAndViewport();
	}
	
	ngOnDestroy() 
	{
		// console.log("game is destroyed");
		this.game.stop();
		this.game.canvas.remove();
		this.gameSrv.disconnect();
	}
}
