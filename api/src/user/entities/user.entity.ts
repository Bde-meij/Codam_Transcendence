import { Friend } from "src/friends/entities/friend.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

@Entity('user')
export class User {

	@PrimaryColumn()
	id: string;

	@Column()
	nickname: string;

	@Column({default: "online"})
	status: string;

	@Column({default: "/uploads/default_avatar.png"})
	avatar: string;

	@OneToMany(() => Friend, (friend) => friend.sender)
	friendOut: Friend[];

	@OneToMany(() => Friend, (friend) => friend.target)
	friendIn: Friend[];
}