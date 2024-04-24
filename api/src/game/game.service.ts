import { HttpException, Injectable } from '@nestjs/common';
import { GamePositionsDto } from './dto/game-positions.dto';

@Injectable()
export class GameService {
	private positions: GamePositionsDto = {
		yPosP1: 0,
		yPosP2: 0
	};
	
	constructor() {};

	pos(): GamePositionsDto	{
		console.log('pos()');
		return (this.positions);
	}

	startKey(player: string, amount: number) {
		if (player === '1')
			this.positions.yPosP1 = amount;
		else if (player === '2')
			this.positions.yPosP2 = amount;
		else
			throw new HttpException('Invalid player', 400);
		console.log('player 1: %d', this.positions.yPosP1);
		console.log('player 2: %d', this.positions.yPosP2);
	}

	// y = 0 at top, switched up-= and down+= -bas-

	upKey(player: string, amount: number) {
		if (player === '1')
			this.positions.yPosP1 -= amount;
		else if (player === '2')
			this.positions.yPosP2 -= amount;
		else
			throw new HttpException('Invalid player', 400);
		console.log('player 1: %d', this.positions.yPosP1);
		console.log('player 2: %d', this.positions.yPosP2);
	}

	downKey(player: string, amount: number) {
		if (player === '1')
			this.positions.yPosP1 += amount;
		else if (player === '2')
			this.positions.yPosP2 += amount;
		else
			throw new HttpException('Invalid player', 400);
		console.log('player 1: %d', this.positions.yPosP1);
		console.log('player 2: %d', this.positions.yPosP2);
	}
}
