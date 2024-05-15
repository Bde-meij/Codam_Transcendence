import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(
		@Inject('AUTH_SERVICE') private readonly userService: UserService,
	) {
		super();
	}

	serializeUser(user: User, done: Function) {
		done(null, user);
	}

	async deserializeUser(payload: any, done: Function) {
		const user = await this.userService.findUserById(payload.id);
		return user ? done(null, user) : done(null, null);
	}
}