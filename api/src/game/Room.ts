export class Room
{
	name:string;
	roomKey:number = 0;

	leftPlayer: string;
	rightPlayer: string;
	lScore:number = 0;
	rScore:number =0;
	hasStarted:boolean = false;

	ballPos: number[] = [400,300];
	ballSpeed: number[] = [10, 0];

	moveBall()
	{
		this.ballPos[0] += this.ballSpeed[0];
		this.ballPos[1] += this.ballSpeed[1];
	}

	wallBounce()
	{
		this.ballSpeed[1] *= -1;
		if ((this.ballSpeed[1]*this.ballSpeed[1]) < 4)
			this.ballSpeed[1] *= 10;
	}

	playerBounce(mod: number)
	{
		this.ballSpeed[0] *= -1;
		this.ballSpeed[1] += mod;
	}

	resetBall(mod: number)
	{
		this.ballSpeed[0] = 0;
		this.ballSpeed[1] = 0;
		this.ballPos[0] = 400;
		this.ballPos[1] = 300;
		setTimeout(() =>{this.ballSpeed[0] = 10*mod;},1000)
	}
}
