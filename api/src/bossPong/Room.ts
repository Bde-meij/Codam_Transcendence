import { TimeInterval } from "rxjs/internal/operators/timeInterval";
import { Server, Socket } from "socket.io";
import { bounce, multiVec, pointDiff, unitVec} from "./vectorMath"

export class Room
{
	//ROOM
	key: number = 0;
	name:string;
	serverRef: Server;
	hasStarted: boolean = false;
	bossHit: boolean = false;
	shurikenInterval: NodeJS.Timeout;
	
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
	shurikenPos: number[] = [400,600];
	shurikenSpeed: number[] = [0, 7];

	moveShuriken()
	{
		this.shurikenPos[0] += this.shurikenSpeed[0];
		this.shurikenPos[1] += this.shurikenSpeed[1];
	}

	resetShuriken()
	{
		this.shurikenPos = [600,600];
		// this.shurikenSpeed = [0, 7];
		this.shurikenSpeed = 
		multiVec(
		unitVec([this.shurikenPos[0] - this.bossPos[0], 
			this.shurikenPos[1] - this.bossPos[1]]), 7);
	}

	//BOSS
	bossPos: number[] = [400, 400];
	bossRad: number = 80;

	checkOutOfBounds(): void
	{
		if ((this.shurikenPos[0] < 0) || (this.shurikenPos[0] > 800) 
			|| (this.shurikenPos[1] < 0) || (this.shurikenPos[1] > 800))
		{
			this.resetShuriken();
			this.playerLives--;
		}
	}

	checkBossHit(): void
	{
		if ((pointDiff(this.bossPos, this.shurikenPos) <= this.bossRad) && (this.bossHit == false))
		{
			this.bossHit = true;
			this.shurikenSpeed = bounce(this.shurikenSpeed, this.bossPos, this.shurikenPos);
			this.serverRef.in(this.name).emit("bossDMG");
			this.serverRef.in(this.name).emit("bossColor", 1);
			setTimeout(() => {
				this.serverRef.in(this.name).emit("bossColor", 2);
				this.bossHit = false;
			}, 2000);
		}
	}
}
