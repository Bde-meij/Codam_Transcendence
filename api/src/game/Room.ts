import { TimeInterval } from "rxjs/internal/operators/timeInterval";
import { Server, Socket } from "socket.io";

export class Room
{
	//ROOM
	name:string;
	leftPlayer: Socket = null;
	rightPlayer: Socket = null;
	serverRef: Server;
	hasStarted = false;
	stopInterval: NodeJS.Timeout;
	key: number = 0;

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
	ballSpeed: number[] = [8, 0];

	moveBall()
	{
		this.ballPos[0] += this.ballSpeed[0];
		this.ballPos[1] += this.ballSpeed[1];
	}

	checkWallBounce()
	{
		if ((this.ballPos[1] < 5) || (this.ballPos[1] > 595))
		{
			this.ballSpeed[1] *= -1;
			if ((this.ballSpeed[1]*this.ballSpeed[1]) < 4)
				this.ballSpeed[1] *= 10;
		}
	}

	playerBounce(effect: number)
	{
		this.ballSpeed[0] *= -1;
		this.ballSpeed[1] += effect;
	}

	resetBall(mod: number)
	{
		this.ballSpeed[0] = 0;
		this.ballSpeed[1] = 0;
		this.ballPos[0] = 400;
		this.ballPos[1] = 300;
		setTimeout(() =>{this.ballSpeed[0] = 8*mod;},1000)
	}

	checkHit(diff: number)
	{
		if (Math.abs(diff) < 41.5)
		{
			this.ballSpeed[0] *= -1;
			if (Math.abs(this.ballSpeed[0]) < 24)
				this.ballSpeed[0] *= 1.02;
			this.ballSpeed[1] += diff/5;
		}
	}

	checkPlayerCollision()
	{
		var leftDiff = this.ballPos[1] - this.leftPos;
		var rightDiff = this.ballPos[1] - this.rightPos;

		if ((this.ballPos[0] > 86.5) && ((this.ballPos[0] + this.ballSpeed[0]) < 86.5))
			this.checkHit(leftDiff);
		else if ((this.ballPos[0] < 713.5) && ((this.ballPos[0] + this.ballSpeed[0]) > 713.5))
			this.checkHit(rightDiff);

		if (this.ballSpeed[1] > 12)
			this.ballSpeed[1] = 12;
		if (this.ballSpeed[1] < -12)
			this.ballSpeed[1] = -12;
	}

	checkScoring(): number
	{
		if (this.ballPos[0] < 0)
		{
			this.rScore+=1;
			this.serverRef.in(this.name).emit("updateScore", [this.lScore, this.rScore]);
			this.resetBall(-1);
			if (this.rScore == 3)
			setTimeout(() =>{
			{
				clearInterval(this.stopInterval);
				this.serverRef.in(this.name).emit("playerwin", this.rightId);
				return (1);
			}},600)
		}
		else if (this.ballPos[0] > 800)
		{
			this.lScore+=1;
			this.serverRef.in(this.name).emit("updateScore", [this.lScore, this.rScore]);
			this.resetBall(1);
			if (this.lScore == 3)
			setTimeout(() =>{
			{
				clearInterval(this.stopInterval);
				this.serverRef.in(this.name).emit("playerwin", this.leftId);
				return (1);
			}},600)
		}
		return (0);
	}
}
