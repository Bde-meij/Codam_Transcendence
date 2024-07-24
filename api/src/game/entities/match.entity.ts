import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum MatchType {
	PUBLIC = "public",
	PRIVATE = "private",
	SPECIAL = "special"
}

export enum MatchStatus {
	ONGOING = "ongoing",
	FINISHED = "finished"
}

@Entity('match')
export class Match {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'enum',
		enum: MatchType
	})
	type: MatchType;

	@Column({
		type: 'enum',
		enum: MatchStatus,
		default: MatchStatus.ONGOING
	})
	status: MatchStatus;

	@ManyToOne(() => User, (user) => user.matchWinningPlayer, {nullable: true})
	winningPlayer: User;

	@ManyToOne(() => User, (user) => user.matchLeftPlayer)
	leftPlayer: User;
	
	@ManyToOne(() => User, (user) => user.matchRightPlayer)
	rightPlayer: User;

	@Column({default: 0})
	leftPlayerScore: number;

	@Column({default: 0})
	rightPlayerScore: number;

	@CreateDateColumn()
	createdAt: Date;
}
