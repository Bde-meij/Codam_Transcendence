import { Blocks } from "src/block/entities/block.entity";
import { FriendRequest } from "src/friends/entities/friend.entity";
import { Match } from "src/game/entities/match.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

export const defaultAvatarUrl: string = "/uploads/default_avatar.png";

@Entity('user')
export class User {

	@PrimaryColumn()
	id: number;

	@Column()
	nickname: string;

	// @Column("text", { array: true, default: "{}" })
	// rooms: string[];
	
	@Column({default: "online"})
	status: string;

	@Column({default: defaultAvatarUrl})
	avatar: string;

	@OneToMany(() => FriendRequest, (friend) => friend.sender)
	friendOut: FriendRequest[];

	@OneToMany(() => FriendRequest, (friend) => friend.target)
	friendIn: FriendRequest[];

	@OneToMany(() => Blocks, (block) => block.sender)
	blockOut: Blocks[];

	@OneToMany(() => Blocks, (block) => block.target)
	blockIn: Blocks[];

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

	@Column({default: 0})
	roomKey: number;
}