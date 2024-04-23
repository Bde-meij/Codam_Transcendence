import { Controller, Get, Param, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
	constructor(private gameService: GameService) {};

	@Get()
	test() {
		return this.gameService.pos();
	}

	@Get('pos')
	pos() {
		return this.gameService.pos();
	}

	@Post('keyup/:player/:amount/')
	keyUp(
		@Param('player') player: string,
		@Param('amount') amount: string
	) {
		return this.gameService.keyUp(player, +amount);
	}

	@Post('keydown/:player/:amount')
	keyDown(
		@Param('player') player: string,
		@Param('amount') amount: string
	) {
		return this.gameService.keyDown(player, +amount);
	}
	
	
}
