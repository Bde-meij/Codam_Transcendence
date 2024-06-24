import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { MatchService } from "./match.service";
import { CreateMatchDto } from "./dto/create-match.dto";
import { UpdateMatchDto } from "./dto/update-match.dto";
import { Loggary } from "src/logger/logger.service";

@Controller('match')
export class MatchController {
	constructor(private readonly matchService: MatchService, private loggary: Loggary) {};

	@Post('create')
	async createMatch(@Req() req, @Body() data: CreateMatchDto) {
		return await this.matchService.createMatch(data);
	}

	@Patch('update')
	async updateMatch(@Req() req, @Body() data: UpdateMatchDto) {
		return await this.matchService.updateMatch(data);
	}

	@Get('user-matches/:targetId')
	async getUserMatches(@Req() req, @Param('targetId') targetId: string) {
		return await this.matchService.getUserMatches(targetId);
	}
	
	@Get('user-stats/:targetId')
	async getUserStats(@Req() req, @Param('targetId') targetId: string) {
		return await this.matchService.getUserStats(targetId);
	}
}