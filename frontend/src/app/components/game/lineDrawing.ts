import{Actor,Color,vec,ExcaliburGraphicsContext,Vector}from "excalibur";
// import{width,height}from "./2pPong"

var width: number = 800;
var height: number = 600;

export var leftScorePos: &Vector[] = 
[
	vec(width*0.35, height*0.1),
	vec(width*0.45, height*0.1),

	vec(width*0.35, height*0.2),
	vec(width*0.45, height*0.2),

	vec(width*0.35, height*0.3),
	vec(width*0.45, height*0.3),
	
	vec(width*0.3, height*0.1),
	vec(width*0.3, height*0.3)
];

export var rightScorePos: &Vector[] = 
[
	vec(width*0.6, height*0.1),
	vec(width*0.7, height*0.1),

	vec(width*0.6, height*0.2),
	vec(width*0.7, height*0.2),

	vec(width*0.6, height*0.3),
	vec(width*0.7, height*0.3),

	vec(width*0.55, height*0.1),
	vec(width*0.55, height*0.3)
];

export function makeLines()
{
	var lines = new Actor();
	lines.graphics.onPostDraw = 
	(ctx: ExcaliburGraphicsContext) => 
	{
		ctx.save();
		let y = 5;
		while (y < 600) 
		{
			ctx.drawLine(vec(400, y), vec(400, y + 20), Color.White, 5);
			y += 30;
		}
		ctx.restore();
	};
	return (lines);
}

export function drawScore(ctx: ExcaliburGraphicsContext, 
	score: number, numPos: Vector[])
{
	ctx.save();

//horizontal lines
	//top
	if (score != 1 && score != 4 && score != 11)
		ctx.drawLine(numPos[0], numPos[1], Color.White, 5);
	//mid
	if (score != 0 && score != 1 && score != 7 && score != 10 && score != 11)
		ctx.drawLine(numPos[2], numPos[3], Color.White, 5);
	//bot
	if (score != 1 && score != 4 && score != 7 && score != 11)
		ctx.drawLine(numPos[4], numPos[5], Color.White, 5);

//vertical lines
	//topleft
	if (score != 1 && score != 2 && score != 3 && score != 7 && score != 11)
		ctx.drawLine(numPos[0], numPos[2], Color.White, 5);
	//topright
	if (score != 5 && score != 6)
		ctx.drawLine(numPos[1], numPos[3], Color.White, 5);
	//botleft
	if (score == 0 || score == 2 || score == 6 || score == 8 || score == 10)
		ctx.drawLine(numPos[2], numPos[4], Color.White, 5);
	//botright
	if (score != 2)
		ctx.drawLine(numPos[3], numPos[5], Color.White, 5);

// ten, eleven
	if (score > 9) 
		ctx.drawLine(numPos[6], numPos[7], Color.White, 5)
	
	ctx.restore();
}
