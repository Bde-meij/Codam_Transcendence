import { User } from './user.class';

export interface Blocks {
	id: number;
	sender: User;
	target: User;
	createdAt: Date;
}
