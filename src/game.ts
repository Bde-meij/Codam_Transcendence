import { Actor, Engine, Color, CollisionType, Keys, vec, Camera} from 'excalibur';
import { vector } from 'excalibur/build/dist/Util/DrawUtil';

const game = new Engine({width:800, height:600});

const leftPlayer = new Actor
({
	x: 40,
	y: game.drawHeight/2,
	width:20,
	height:100,
	color:Color.White,
})
leftPlayer.body.collisionType = CollisionType.Fixed;

const rightPlayer = new Actor
({
	x: game.drawWidth -40,
	y: game.drawHeight/2,
	width:20,
	height:100,
	color:Color.White,
})
rightPlayer.body.collisionType = CollisionType.Fixed;

const ball = new Actor
({
	x: game.drawWidth/2,
	y: game.drawHeight/2,
	radius: 10,
	color: Color.Red,
});
ball.body.collisionType = CollisionType.Passive;

// const ballSpeed = vec(400, 0);
setTimeout(()=>{ball.vel = vec(400, 0);}, 1000); // ball velocity is vec / 1000ms

leftPlayer.on("postupdate", ()=>
{
	if ((game.input.keyboard.isHeld(Keys.W)) && (leftPlayer.pos.y > leftPlayer.height/2))
		leftPlayer.pos.y -= 10;
	if ((game.input.keyboard.isHeld(Keys.S)) && (leftPlayer.pos.y < game.drawHeight - leftPlayer.height/2))
		leftPlayer.pos.y += 10;
})

leftPlayer.on("collisionstart", ()=>
{
	if ((game.input.keyboard.isHeld(Keys.W)) && (leftPlayer.pos.y > leftPlayer.height/2))
		ball.vel.y -= 50;
	if ((game.input.keyboard.isHeld(Keys.S)) && (leftPlayer.pos.y < game.drawHeight - leftPlayer.height/2))
		ball.vel.y += 50;
})

rightPlayer.on("collisionstart", ()=>
{
	if ((game.input.keyboard.isHeld(Keys.Up)) && (rightPlayer.pos.y > leftPlayer.height/2))
		ball.vel.y -= 50;
	if ((game.input.keyboard.isHeld(Keys.Down)) && (rightPlayer.pos.y < game.drawHeight - leftPlayer.height/2))
		ball.vel.y += 50;
})

rightPlayer.on("postupdate", ()=>
{
	if ((game.input.keyboard.isHeld(Keys.Up)) && (rightPlayer.pos.y > leftPlayer.height/2))
		rightPlayer.pos.y -= 10;
	if ((game.input.keyboard.isHeld(Keys.Down)) && (rightPlayer.pos.y < game.drawHeight - leftPlayer.height/2))
		rightPlayer.pos.y += 10;
})

let hitWall: boolean = false;

ball.on("postupdate", ()=>
{
	if (!hitWall)
	{
		hitWall = true;
		if (ball.pos.x < 0)
		{
			alert("rightPlayer win!");
			ball.pos.y = game.drawHeight/2
			ball.pos.x = game.drawWidth/2
			ball.vel = vec(-400, 0);
		}
		if (ball.pos.x > game.drawWidth)
		{
			alert("leftPlayer win!");
			ball.pos.y = game.drawHeight/2
			ball.pos.x = game.drawWidth/2
			ball.vel = vec(400, 0);
		}
		if ((ball.pos.y < 5) || (ball.pos.y > game.drawHeight - 5))
			ball.vel.y *= -1;
	}
})

ball.on("preupdate", ()=>
{
	hitWall = false;
})

let hitPlayer: boolean = false;

ball.on("collisionstart", () =>
{
	if (!hitPlayer)
	{
		hitPlayer = true;
		ball.vel.x *= -1;
	}
})

ball.on("collisionend", () =>
{
	hitPlayer = false;
})
game.add(leftPlayer);
game.add(rightPlayer);
game.add(ball);

// game.currentScene.camera.shake(100, 100, 1000);

game.start();


