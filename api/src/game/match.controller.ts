import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { MatchService } from "./match.service";

@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService) {};

	@Get('user-matches/:targetId')
	async getUserMatches(@Param('targetId', ParseIntPipe) targetId: number) {
		return await this.matchService.getUserMatches(targetId);
	}
	
	@Get('user-stats/:targetId')
	async getUserStats(@Param('targetId', ParseIntPipe) targetId: number) {
		return await this.matchService.getUserStats(targetId);
	}
}