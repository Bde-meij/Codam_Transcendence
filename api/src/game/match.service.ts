import { HttpException, Injectable } from '@nestjs/common';
import { SaveMatchDto } from './dto/create-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { StatsService } from './stats.service';
import { MatchStats } from './entities/stats.entity';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match) private readonly matchRepo: Repository<Match>,
		private readonly userService: UserService,
		private readonly statsService: StatsService
	) {}

	async saveMatch(saveMatchDto: SaveMatchDto) {
		const leftPlayer: User = await this.userService.findUserById(saveMatchDto.leftPlayerId);
		if (!leftPlayer) {
			console.log("left player", saveMatchDto.leftPlayerId, "not found!");
			return ;
		}
		const rightPlayer: User = await this.userService.findUserById(saveMatchDto.rightPlayerId);
		if (!rightPlayer) {
			console.log("right player", saveMatchDto.rightPlayerId, "not found!");
			return ;
		}
		let winner: User;
		if (saveMatchDto.leftPlayerScore > saveMatchDto.rightPlayerScore) {
			winner = leftPlayer;
			this.statsService.updateWins(leftPlayer.id);
			this.statsService.updateLosses(rightPlayer.id);
		} else {
			winner = rightPlayer;
			this.statsService.updateWins(rightPlayer.id);
			this.statsService.updateLosses(leftPlayer.id);
		}
		const match: Match = await this.matchRepo.save({
			leftPlayer: leftPlayer,
			rightPlayer: rightPlayer,
			leftPlayerScore: saveMatchDto.leftPlayerScore,
			rightPlayerScore: saveMatchDto.rightPlayerScore,
			winningPlayer: winner,
			status: MatchStatus.FINISHED,
			type: saveMatchDto.type
		});
	}

	async getUserMatches(targetId: number): Promise<Match[]> {
		if (!await this.userService.userExists(targetId)) {
			// console.log('User not found! User id:', targetId);
			throw new HttpException('User not found', 404);
		}
		const matches: Match[] = await this.matchRepo.find({
			select: {
				id: true,
				type: true,
				status: true,
				leftPlayer: {
					id: true,
					nickname: true,
				},
				rightPlayer: {
					id: true,
					nickname: true,
				},
				winningPlayer: {
					id: true,
					nickname: true,
				},
				leftPlayerScore: true,
				rightPlayerScore: true,
				createdAt: true,
			},
			where: [
				{leftPlayer: {id: targetId}, status: MatchStatus.FINISHED},
				{rightPlayer: {id: targetId}, status: MatchStatus.FINISHED},
			],
			relations: {
				leftPlayer: true,
				rightPlayer: true,
				winningPlayer: true,
			}
		});
		// console.log('User matches:\n', matches);
		return matches;
	}
	
	async getUserStats(targetId: number) {
		const user = await this.userService.findUserById(targetId);
		if (!user){
			throw new HttpException('User not found', 404);
		}
		const stats: MatchStats = await this.statsService.getStats(targetId);
		let winrate: string;
		if (stats.wins + stats.losses == 0)
			winrate = "n/a";
		else
			winrate = (stats.wins / (stats.wins + stats.losses) * 100).toFixed(2) + "%";
		return {
			wins: stats.wins,
			losses: stats.losses,
			winrate: winrate,
			ranking: await this.statsService.getRanking(targetId)
		};
	}

	async deleteMatch(matchId: number) {
		this.matchRepo.delete({id: matchId});
	}

}
