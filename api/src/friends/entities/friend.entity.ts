import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('friendRequest')
export class Friend {
	@PrimaryGeneratedColumn()
	id: string;

	@ManyToOne(() => User, (user) => user.friendOut)
	sender: User;

	@ManyToOne(() => User, (user) => user.friendIn)
	target: User;

	@Column({default: "pending"})
	status: string;
}
