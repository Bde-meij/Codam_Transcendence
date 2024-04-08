import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'auth'})
export class Auth {
	@PrimaryGeneratedColumn()
	id: number;
	@Column()
	name: string;
	@Column()
	password: string;
}
