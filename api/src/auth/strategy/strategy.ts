import { Inject, Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-oauth2'
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly configService: ConfigService,
    @Inject('AUTH_SERVICE') private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('CLIENT_ID'),
      clientSecret: configService.get('CLIENT_SECRET'),
      callbackURL: configService.get('CALL_BACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    email: string,
	displayName: string,
    done: VerifyCallback,
  ) {
    
    console.log(accessToken);
    console.log(email);
	console.log(displayName);
    console.log(done);

    const user = await this.authService.validateUser(
      email,
      displayName,
    );

    return user || null;
  }
}