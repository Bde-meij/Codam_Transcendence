import { TimeInterval } from "rxjs/internal/operators/timeInterval";
import { Server, Socket } from "socket.io";
import { bounce, multiVec, plusVec, pointDiff, rotateVec} from "./vectorMath"

export class Room
{
	//ROOM
	key: number = 0;
	name:string;
	serverRef: Server;
	hasStarted: boolean = false;
	bossHit: boolean = false;
	shurikenInterval: NodeJS.Timeout;
	
	rotating: boolean = false;
	oob: boolean = false;
	dmgCounter: number = 0;

	players: Socket[] = 
	[
		null,
		null,
		null,
		null,
	];
	numOfPlayers: number = 0;
	playerLives: number = 4;

	//SHURIKEN
	shurikenPos: number[] = [400,550];
	shurikenSpeed: number[] = [0, 6];
	shurikenRot: number = 0;

	moveShuriken()
	{
		this.shurikenPos[0] += this.shurikenSpeed[0];
		this.shurikenPos[1] += this.shurikenSpeed[1];
		if (this.rotating == true)
		{
			this.shurikenSpeed = 
			rotateVec(this.shurikenSpeed, this.shurikenRot);
		}
	}

	resetShuriken()
	{
		var tmp: number[] = this.shurikenSpeed;
		this.shurikenSpeed = [0,0];
		this.shurikenPos = plusVec(this.bossPos, multiVec(tmp, 18));
		this.oob = false;
		setTimeout(() =>{{ this.shurikenSpeed = tmp }}, 1000);
	}

	//BOSS
	bossPos: number[] = [400, 400];
	bossRad: number = 80;

	checkOutOfBounds(): void
	{
		if ((this.shurikenPos[0] < 0) || (this.shurikenPos[0] > 800) 
			|| (this.shurikenPos[1] < 0) || (this.shurikenPos[1] > 800))
		{
			if (this.oob == false)
			{
				this.oob = true;
				this.resetShuriken();
				this.playerLives-=1;
				this.serverRef.emit("outOfBounds", this.playerLives);
				if (this.playerLives == 0)
				{
					this.shurikenPos = [400,600];
					this.shurikenSpeed = [0,0];
					this.serverRef.emit("playersLose");
				}
			}
		}
	}

	checkBossHit(): void
	{
		var distance = pointDiff(this.bossPos, this.shurikenPos);
		if ((distance <= this.bossRad) && (this.bossHit == true) && this.rotating == false)
		{
			this.shurikenRot = 33;
			this.rotating = true;
			this.shurikenPos = [400,400];
			setTimeout(() =>{{ this.shurikenRot = 0 }}, (Math.random()+1) * 1000);
		}
		if ((distance >= this.bossRad) && (this.rotating == true))
		{
			this.rotating = false;
			setTimeout(() => {this.bossHit = false },200);
			this.serverRef.in(this.name).emit("setBossColor", 2);
		}
		if ((distance <= this.bossRad) && (this.bossHit == false))
		{
			this.bossHit = true;
			this.shurikenSpeed = bounce(this.shurikenSpeed, this.bossPos, this.shurikenPos);
			this.serverRef.in(this.name).emit("bossDMG");
			this.serverRef.in(this.name).emit("setBossColor", 1);
			this.dmgCounter++;
			if (this.dmgCounter == 5)
			{
				this.shurikenSpeed = [0,0];
				setTimeout(() =>{ this.serverRef.emit("playersWin")}, 800);
			}
		}
	}
}
