import { Injectable } from "@nestjs/common";
import { MatchStats } from "./entities/stats.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class StatsService {
	constructor(@InjectRepository(MatchStats) private readonly statsRepo: Repository<MatchStats>) {}

	async createStats(userId: number): Promise<MatchStats> {
		// Create stats giving the id the same value as the user id
		const createdStats: MatchStats =  await this.statsRepo.save({
			id: userId,
		});
		return createdStats;
	}
	
	async getStats(userId: number): Promise<MatchStats> {
		let stats: MatchStats = await this.statsRepo.findOne({where: {id: userId}});
		// Create stats if the user doesn't have any yet
		if (!stats) {
			stats = await this.createStats(userId);
		}
		return stats;
	}

	async updateWins(userId: number) {
		let stats: MatchStats = await this.getStats(userId);
		await this.statsRepo.update({id: userId}, {wins: stats.wins + 1, rating: stats.rating + 1});
	}

	async updateLosses(userId: number) {
		let stats: MatchStats = await this.getStats(userId);
		await this.statsRepo.update({id: userId}, {losses: stats.losses + 1, rating: stats.rating - 1});
	}
	
	async getRanking(userId: number): Promise<number> {
		const stats: MatchStats = await this.getStats(userId);
		const rating: number = stats.rating;
		// QueryBuilder is vulnerable to sql injections, but this will only ever be called using value created on the backend
		const ranking: number = await this.statsRepo.createQueryBuilder('stats')
			.where('stats.rating >= :rating', {rating})
			.getCount();
		return ranking;
	}
}