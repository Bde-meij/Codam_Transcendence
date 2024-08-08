import { User } from "src/user/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('block')
export class Blocks {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.blockOut)
	sender: User;

	@ManyToOne(() => User, (user) => user.blockIn)
	target: User;

	@CreateDateColumn()
	createdAt: Date;
}
