import {Actor, CollisionType, Color} from "excalibur";

export class Player
{
	x: number = 0;
	y: number = 0;
	constructor(x: number, y: number)
	{
		this.x = x;
		this.y = y;
	}
	returnAct(): Actor
	{
		return new Actor 
		({
			x: this.x,
			y: this.y,
			width: 13,
			height: 70,
			color: Color.White,
			collisionType: CollisionType.Fixed,
		});
	}
}

export class Ball
{
	x: number = 0;
	y: number = 0;
	constructor(x: number, y: number)
	{
		this.x = x;
		this.y = y;
	}
	returnAct(): Actor
	{
		return new Actor 
		({
			x: this.x,
			y: this.y,
			width: 13,
			height: 13,
			color: Color.White,
			collisionType: CollisionType.Passive,
		});
	}
}

export function addAfterImage(squareBall: Actor): Actor[]
{
	var afterImages: Actor[] =
	[
	   new Actor({
		width: 13,
		height: 13,
		pos: squareBall.pos,
		color: Color.White,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: 10,
		height: 10,
		pos: squareBall.pos,
		color: Color.LightGray,
		collisionType: CollisionType.PreventCollision
		}),
		
		new Actor({
		width: 7,
		height: 7,
		pos: squareBall.pos,
		color: Color.Gray,
		collisionType: CollisionType.PreventCollision
		})
	]

	return (afterImages);
}
