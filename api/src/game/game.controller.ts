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

	@Post('startkey/:player/:amount/')
	startKey(
		@Param('player') player: string,
		@Param('amount') amount: number
	) {
		return this.gameService.startKey(player, +amount);
	}

	@Post('upkey/:player/:amount/')
	upKey(
		@Param('player') player: string,
		@Param('amount') amount: string
	) {
		return this.gameService.upKey(player, +amount);
	}

	@Post('downkey/:player/:amount')
	downKey(
		@Param('player') player: string,
		@Param('amount') amount: string
	) {
		return this.gameService.downKey(player, +amount);
	}
	
	
}
