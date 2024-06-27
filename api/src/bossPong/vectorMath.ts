export function unitVec(vec: number[]): number[]
{
	var magnitude = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
	return ([vec[0] / magnitude, vec[1] / magnitude])
}

export function dotPro(vecA: number[], vecB: number[]): number
{
	return(vecA[0] * vecB[0] + vecA[1] * vecB[1]);
}

export function surfDir(vecA: number[], vecB: number[]): number[]
{
	return ([vecA[0] - vecB[0], vecA[1] - vecB[1]])
}

export function pointDiff(cordA: number[], cordB: number[])
{
	var xdiff = (cordA[0] - cordB[0]) * (cordA[0] - cordB[0]);
	var ydiff = (cordA[1] - cordB[1]) * (cordA[1] - cordB[1]);
	return (Math.sqrt(xdiff + ydiff));
}

export function multiVec(vecA: number[], B: number): number[]
{
	return ([vecA[0] * B, vecA[1] * B]);
}
export function plusVec(vecA: number[], vecB: number[]): number[]
{
	return ([vecA[0] + vecB[0], vecA[1] + vecB[1]]);
}

export function bounce(vecA: number[], vecB:number[],  vecC:number[])
{
	// console.log("bounceInfo", "speed", vecA[0], vecA[1], "player", vecB[0], vecB[1], "boss", vecC[0], vecC[1]);
	var n = unitVec(surfDir(vecC, vecB));
	var dot = dotPro(n, vecA);
	var three = multiVec(n, dot);
	var four = multiVec(three, -2);
	return(multiVec(unitVec(plusVec(four, vecA)), 7));
}

export function rotateVec(vec: number[], ang: number)
{
	ang = -ang * (Math.PI/180);
	var cos = Math.cos(ang);
	var sin = Math.sin(ang);
	return(
	[(Math.round(10000*(vec[0] * cos - vec[1] * sin))/10000), 
	(Math.round(10000*(vec[0] * sin + vec[1] * cos))/10000)]);
};
