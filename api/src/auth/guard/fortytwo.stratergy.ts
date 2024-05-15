import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'fortytwo') {
	constructor(private readonly configService: ConfigService) {
		super({
			clientID: configService.get<string>('CLIENT_ID'),
			clientSecret: configService.get<string>('CLIENT_SECRET'),
			callbackURL: configService.get<string>('CALL_BACK_URL'),
			profileFields: {
				'id': function (obj) { return String(obj.id); },
				'usual_full_name': 'usual_full_name',
				'login': 'login',
				'emails.0.value': 'email',
				'photos.0.value': 'image_url'
			}
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		// Here, you can access user profile information and perform custom logic
		const user = {
			id: profile.id,
			usual_full_name: profile.usual_full_name,
			login: profile.login,
			email: profile.emails[0].value,
			accessToken,
			refreshToken,
		};
		done(null, user);
	}
}