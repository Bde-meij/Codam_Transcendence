import { Entity, PrimaryColumn } from "typeorm";

@Entity('refreshToken')
export class refreshToken {

	@PrimaryColumn()
	token: string;
}