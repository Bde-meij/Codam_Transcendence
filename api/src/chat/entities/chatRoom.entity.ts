import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('chatRoom')
export class ChatRoom {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({nullable: false})
	name: string;

	@Column({nullable: true, default: null})
	password: string;
}