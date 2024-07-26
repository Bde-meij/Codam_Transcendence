import { HttpException, Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { StatsService } from './stats.service';
import { MatchStats } from './entities/stats.entity';

@Injectable()
export class MatchService {
	constructor(@InjectRepository(Match) private readonly matchRepo: Repository<Match>, private readonly userService: UserService, private readonly statsService: StatsService) {}
	
	async createMatch(createMatchDto: CreateMatchDto) {
		// Games should only be create by the backend, these errors should never happen
		// if (createMatchDto.leftPlayerId === createMatchDto.rightPlayerId) {
		// 	throw new HttpException('Cannot create game with yourself', 400);
		// }
		const leftPlayer: User = await this.userService.findUserById(createMatchDto.leftPlayerId);
		if (!leftPlayer) {
			// console.log('Left player not found! User id:', createMatchDto.leftPlayerId);
			throw new HttpException('Left player not found', 404);
		}
		const rightPlayer: User = await this.userService.findUserById(createMatchDto.rightPlayerId);
		if (!rightPlayer) {
			// console.log('Right player not found! User id:', createMatchDto.rightPlayerId);
			throw new HttpException('Right player not found', 404);
		}
		const match: Match = await this.matchRepo.save({
			leftPlayer: leftPlayer,
			rightPlayer: rightPlayer,
			type: createMatchDto.type
		});
		// console.log('Match created:\n', match);
		return {
			id: match.id,
			type: match.type,
			status: match.status,
			leftPlayer: {
				id: match.leftPlayer.id,
				nickname: match.leftPlayer.nickname
			},
			rightPlayer: {
				id: match.rightPlayer.id,
				nickname: match.rightPlayer.nickname
			},
			createdAt: match.createdAt,
		};
	}
	
	async updateMatch(updateMatchDto: UpdateMatchDto) {
		if (updateMatchDto.leftPlayerScore == updateMatchDto.rightPlayerScore) {
			// console.log('Match cannot end in a tie!');
			throw new HttpException('Match cannot end in a tie', 400);
		}
		const match: Match = await this.matchRepo.findOne({
			where: {
				id: updateMatchDto.id,
				status: MatchStatus.ONGOING,
			},
			relations: {
				leftPlayer: true,
				rightPlayer: true,
			}
		});
		if (!match) {
			// console.log('Valid match could not be found!');
			throw new HttpException('Invalid match update', 400);
		}
		let winner: User;
		if (updateMatchDto.leftPlayerScore > updateMatchDto.rightPlayerScore) {
			winner = match.leftPlayer;
			this.statsService.updateWins(match.leftPlayer.id);
			this.statsService.updateLosses(match.rightPlayer.id);
		} else {
			winner = match.rightPlayer;
			this.statsService.updateWins(match.rightPlayer.id);
			this.statsService.updateLosses(match.leftPlayer.id);
		}
		await this.matchRepo.update(
			{id: updateMatchDto.id},
			{
				leftPlayerScore: updateMatchDto.leftPlayerScore,
				rightPlayerScore: updateMatchDto.rightPlayerScore,
				winningPlayer: winner,
				status: MatchStatus.FINISHED,
			}
		)
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
		// console.log("DELETING MATCH:", matchId);
		const match: Match = await this.matchRepo.findOne({
			where: {id: matchId}
		});
		if (!match) {
			throw new HttpException('Match not found', 404);
		}
		this.matchRepo.delete({id: matchId});
	}

}
