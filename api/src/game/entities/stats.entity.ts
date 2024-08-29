import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('stats')
export class MatchStats {
	@PrimaryColumn()
	id: number;

	@Column({default: 0})
	wins: number;

	@Column({default: 0})
	losses: number;

	@Column({default: 0}) // winning is +1 rating, losing is -1 rating
	rating: number;
}