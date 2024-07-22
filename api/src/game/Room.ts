import { TimeInterval } from "rxjs/internal/operators/timeInterval";
import { Server, Socket } from "socket.io";
import { bounce, minVec, plusVec } from "./vectorMath";

export class Room
{
	//ROOM
	id: string = null;
	name:string;
	leftPlayer: Socket = null;
	rightPlayer: Socket = null;
	serverRef: Server;
	hasStarted = false;
	stopInterval: NodeJS.Timeout;
	gravityInterval: NodeJS.Timeout;
	key: number = 0;
	// hitwall: boolean = false;

	//LEFTPLAYER
	leftId: number = 0;
	leftPos: number = 300;
	rScore:number = 0;
	
	//RIGHTPLAYER
	rightId: number = 0;
	rightPos: number = 300;
	lScore:number = 0;

	//BALL
	ballPos: number[] = [400,300];
	ballSpeed: number[] = [9, 0];

	moveBall()
	{
		if (this.ballSpeed[0] < 1 && this.ballSpeed[0] >= 0)
			this.ballSpeed[0] = 1;
		if (this.ballSpeed[0] > -1 && this.ballSpeed[0] <= 0)
			this.ballSpeed[0] = -1;

		this.ballPos[0] += this.ballSpeed[0];
		this.ballPos[1] += this.ballSpeed[1];
	}

	resetBall(mod: number)
	{
		this.ballSpeed[0] = 0;
		this.ballSpeed[1] = 0;
		this.ballPos[0] = 400;
		this.ballPos[1] = 300;
		setTimeout(() =>{this.ballSpeed[0] = 9*mod;},1000)
	}

	checkCollision()
	{
		var leftDiff = this.ballPos[1] - this.leftPos;
		var rightDiff = this.ballPos[1] - this.rightPos;

		if ((this.ballPos[0] > 86.5) && ((this.ballPos[0] + this.ballSpeed[0]) < 86.5) && Math.abs(leftDiff) < 41.5)
			this.ballSpeed = bounce(this.ballSpeed, [86.5, this.leftPos], plusVec(this.ballPos, [300, 0]));
		else if ((this.ballPos[0] < 713.5) && ((this.ballPos[0] + this.ballSpeed[0]) > 713.5)&& Math.abs(rightDiff) < 41.5)
			this.ballSpeed = bounce(this.ballSpeed, [713.5, this.rightPos], plusVec(this.ballPos, [-300, 0]));
		if (this.ballPos[1] < 5)
			this.ballSpeed[1] = Math.abs(this.ballSpeed[1]);
		if (this.ballPos[1] > 595)
			this.ballSpeed[1] = -Math.abs(this.ballSpeed[1]);
	}

	checkScoring(): number
	{
		if (this.ballPos[0] < 0)
		{
			this.rScore+=1;
			this.serverRef.in(this.name).emit("updateScore", [this.lScore, this.rScore]);
			this.resetBall(-1);
			if (this.rScore == 11)
			setTimeout(() =>{
			{
				clearInterval(this.stopInterval);
				this.serverRef.in(this.name).emit("playerwin", this.rightPlayer.data.nick);
				return (1);
			}},600)
		}
		else if (this.ballPos[0] > 800)
		{
			this.lScore+=1;
			this.serverRef.in(this.name).emit("updateScore", [this.lScore, this.rScore]);
			this.resetBall(1);
			if (this.lScore == 11)
			setTimeout(() =>{
			{
				clearInterval(this.stopInterval);
				this.serverRef.in(this.name).emit("playerwin", this.leftPlayer.data.nick);
				return (1);
			}},600)
		}
		return (0);
	}
}
