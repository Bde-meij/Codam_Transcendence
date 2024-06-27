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
		color: Color.Blue,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize - startPosMod)) / radius)*-1
		}),

		new Actor({
		x: halfSize + startPosMod,
		y: halfSize - startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.Yellow,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize + startPosMod)) / radius)*-1
		}),

		new Actor({
		x: halfSize - startPosMod,
		y: halfSize + startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.Red,
		collisionType: CollisionType.Fixed,
		rotation: Math.asin((halfSize - (halfSize - startPosMod)) / radius)
		}),

		new Actor({
		x: halfSize + startPosMod,
		y: halfSize + startPosMod,
		width: fullSize/10,
		height: halfSize/25,
		color: Color.White,
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
