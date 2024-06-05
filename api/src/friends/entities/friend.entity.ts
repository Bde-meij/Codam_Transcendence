import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum FriendStatus {
	PENDING = "pending",
	ACCEPTED = "accepted",
	DECLINED = "declined",
}

@Entity('friendRequest')
export class FriendRequest {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => User, (user) => user.friendOut)
	sender: User;

	@ManyToOne(() => User, (user) => user.friendIn)
	target: User;

	@Column({
		type: 'enum',
		enum: FriendStatus,
		default: FriendStatus.PENDING,
	})
	status: FriendStatus;
}
