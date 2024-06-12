import { FriendRequest } from "src/friends/entities/friend.entity";
import { Match } from "src/game/entities/match.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity('user')
export class User {

	@PrimaryColumn()
	id: string;

	@Column()
	nickname: string;

	// @Column("text", { array: true, default: "{}" })
	// rooms: string[];
	
	@Column({default: "online"})
	status: string;

	@Column({default: "/uploads/default_avatar.png"})
	avatar: string;

	@OneToMany(() => FriendRequest, (friend) => friend.sender)
	friendOut: FriendRequest[];

	@OneToMany(() => FriendRequest, (friend) => friend.target)
	friendIn: FriendRequest[];

	@OneToMany(() => Match, (match) => match.winningPlayer)
	matchWinningPlayer: Match[];

	@OneToMany(() => Match, (match) => match.leftPlayer)
	matchLeftPlayer: Match[];

	@OneToMany(() => Match, (match) => match.rightPlayer)
	matchRightPlayer: Match[];
	
	@Column({nullable: true})
	twoFASecret: string;

	@Column({default: false})
	isTwoFAEnabled: boolean;
}