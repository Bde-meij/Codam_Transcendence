import { HttpException, Injectable } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class MatchService {
	constructor(@InjectRepository(Match) private readonly matchRepo: Repository<Match>, private readonly userService: UserService) {}
	
	async createMatch(createMatchDto: CreateMatchDto) {
		// Games should only be create by the backend, these errors should never happen
		// if (createMatchDto.leftPlayerId === createMatchDto.rightPlayerId) {
		// 	throw new HttpException('Cannot create game with yourself', 400);
		// }
		const leftPlayer: User = await this.userService.findUserById(createMatchDto.leftPlayerId);
		if (!leftPlayer) {
			throw new HttpException('Left player not found', 404);
		}
		const rightPlayer: User = await this.userService.findUserById(createMatchDto.rightPlayerId);
		if (!rightPlayer) {
			throw new HttpException('Right player not found', 404);
		}
		const match: Match = await this.matchRepo.save({
			leftPlayer: leftPlayer,
			rightPlayer: rightPlayer,
			type: createMatchDto.type
		});
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
			throw new HttpException('Invalid match update', 400);
		}
		let winner: User;
		if (updateMatchDto.leftPlayerScore > updateMatchDto.rightPlayerScore) {
			winner = match.leftPlayer;
		} else {
			winner = match.rightPlayer;
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

	async getUserMatches(targetId: string): Promise<Match[]> {
		if (!await this.userService.userExists(targetId)) {
			throw new HttpException('Player not found', 404);
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
		return matches;
	}

	async getUserStats(targetId: string) {
		const matches: Match[] = await this.getUserMatches(targetId);
		if (matches.length == 0) {
			return {
				wins: 0,
				losses: 0,
				winrate: "n/a",
			};
		}
		let wins: number = 0;
		matches.forEach((match) => {
			if (match.winningPlayer.id == targetId)
				wins++;
		})
		return {
			wins: wins,
			losses: matches.length - wins,
			winrate: (wins / matches.length * 100).toFixed(2) + "%",
		};
	}

	async deleteMatch(matchId: string) {
		const match: Match = await this.matchRepo.findOne({
			where: {id: matchId}
		});
		if (!match) {
			throw new HttpException('Match not found', 404);
		}
		this.matchRepo.delete({id: matchId});
	}

}
