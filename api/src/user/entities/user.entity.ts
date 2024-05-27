import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('user')
export class User {

	@PrimaryColumn()
	id: string;

	@Column()
	nickname: string;

	@Column("text", { array: true, default: "{}" })
	rooms: string[];
}