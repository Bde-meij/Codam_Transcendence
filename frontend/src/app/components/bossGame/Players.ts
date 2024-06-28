import {Actor, CollisionType, Color, Keys} from "excalibur";

var fullSize = 800;
var halfSize = fullSize / 2;
var radius = (halfSize / 8) * 7;
var mod = 1;
var playerSpeed = fullSize*0.02;
var dirSpeed = 0;
var startPosMod = Math.sqrt((radius*radius)/2);

export function makePlayers(): Actor[]
{
	var players: Actor[] =
	[
		new Actor({
		x: halfSize - startPosMod,
		y: halfSize - startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.White,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize - startPosMod)) / radius)*-1
		}),

		new Actor({
		x: halfSize + startPosMod,
		y: halfSize - startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.Red,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize + startPosMod)) / radius)*-1
		}),

		new Actor({
		x: halfSize - startPosMod,
		y: halfSize + startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.Yellow,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize - startPosMod)) / radius)
		}),

		new Actor({
		x: halfSize + startPosMod,
		y: halfSize + startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.Blue,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize + startPosMod)) / radius)
		})
	]
	return (players);
}

export function playerMovement(player: Actor, key: Keys)
{
	if (player.pos.y > halfSize)
		mod = 1;
	else
		mod = -1;

	player.rotation = Math.asin((halfSize - player.pos.x) / radius) * mod;

	dirSpeed = playerSpeed * (Math.abs(player.pos.x - halfSize) / halfSize);
	if (player.pos.x > halfSize + (radius/2)) 
	{
		if (key == Keys.A)
			player.pos.y -= Math.abs(dirSpeed);
		if (key == Keys.D) 
			player.pos.y += Math.abs(dirSpeed);
		player.pos.x = halfSize +
		Math.sqrt(Math.pow(radius, 2) - Math.pow(player.pos.y - halfSize, 2));
	}
	else if (player.pos.x < halfSize - (radius/2))
	{
		if (key == Keys.A)
			player.pos.y += Math.abs(dirSpeed);
		if (key == Keys.D)
			player.pos.y -= Math.abs(dirSpeed);
		player.pos.x = halfSize -
		Math.sqrt(Math.pow(radius, 2) - Math.pow(player.pos.y - halfSize, 2));
	}
	else
	{
		dirSpeed = playerSpeed * (Math.abs(player.pos.y - halfSize) / halfSize) * mod;
		if (key == Keys.A)
			player.pos.x += dirSpeed;
		if (key == Keys.D) 
			player.pos.x -= dirSpeed;
		
		player.pos.y = halfSize + mod *
		Math.sqrt(Math.pow(radius, 2) - Math.pow(player.pos.x - halfSize, 2));
	}
}

export function addShurikenShadows(shuriken: Actor): Actor[]
{
	var shurikenShadows: Actor[] =
	[
	   new Actor({
		width: 13,
		height: 13,
		pos: shuriken.pos,
		color: Color.White,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: 10,
		height: 10,
		pos: shuriken.pos,
		color: Color.LightGray,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: 7,
		height: 7,
		pos: shuriken.pos,
		color: Color.Gray,
		collisionType: CollisionType.PreventCollision
		})
	]
	return (shurikenShadows);
}

export function addPlayerShadows(playerOne: Actor,playerTwo: Actor, playerThree: Actor, playerFour: Actor): Actor[]
{
	var playerShadows: Actor[] =
	[
	   new Actor({
		width: playerOne.width*0.8,
		height: playerOne.height*0.8,
		pos: playerOne.pos,
		color: playerOne.color.darken(0.2),
		rotation: playerOne.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.6,
		height: playerOne.height*0.6,
		pos: playerOne.pos,
		color: playerOne.color.darken(0.4),
		rotation: playerOne.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.4,
		height: playerOne.height*0.4,
		pos: playerOne.pos,
		color:  playerOne.color.darken(0.6),
		rotation: playerOne.rotation,
		collisionType: CollisionType.PreventCollision
		}),

		new Actor({
		width: playerOne.width*0.8,
		height: playerOne.height*0.8,
		pos: playerTwo.pos,
		color: playerTwo.color.darken(0.2),
		rotation: playerTwo.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.6,
		height: playerOne.height*0.6,
		pos: playerTwo.pos,
		color: playerTwo.color.darken(0.4),
		rotation: playerTwo.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.4,
		height: playerOne.height*0.4,
		pos: playerTwo.pos,
		color:  playerTwo.color.darken(0.6),
		rotation: playerTwo.rotation,
		collisionType: CollisionType.PreventCollision
		}),

	   	new Actor({
		width: playerOne.width*0.8,
		height: playerOne.height*0.8,
		pos: playerThree.pos,
		color: playerThree.color.darken(0.2),
		rotation: playerThree.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.6,
		height: playerOne.height*0.6,
		pos: playerThree.pos,
		color: playerThree.color.darken(0.4),
		rotation: playerThree.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.4,
		height: playerOne.height*0.4,
		pos: playerThree.pos,
		color:  playerThree.color.darken(0.6),
		rotation: playerThree.rotation,
		collisionType: CollisionType.PreventCollision
		}),

		new Actor({
		width: playerOne.width*0.8,
		height: playerOne.height*0.8,
		pos: playerFour.pos,
		color: playerFour.color.darken(0.2),
		rotation: playerFour.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.6,
		height: playerOne.height*0.6,
		pos: playerFour.pos,
		color: playerFour.color.darken(0.4),
		rotation: playerFour.rotation,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: playerOne.width*0.4,
		height: playerOne.height*0.4,
		pos: playerFour.pos,
		color:  playerFour.color.darken(0.6),
		rotation: playerFour.rotation,
		collisionType: CollisionType.PreventCollision
		})
	]
	return (playerShadows);
}

export function updateShadows(player: Actor, shadows: Actor[], si:number)
{
	shadows[si+2].pos = shadows[si+1].pos;
	shadows[si+1].pos = shadows[si+0].pos;
	shadows[si+0].pos = player.pos;
	shadows[si+2].rotation = shadows[si+1].rotation;
	shadows[si+1].rotation = shadows[si+0].rotation;
	shadows[si+0].rotation = player.rotation;
}