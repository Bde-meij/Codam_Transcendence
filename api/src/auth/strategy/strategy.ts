import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy, VerifyCallback } from 'passport-42'
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
      //scope: ['profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    
    console.log(accessToken);
    console.log(profile);
    console.log(done);

    const user = await this.authService.validateUser(
		profile.emails[0].value,
		profile.displayName,
    );

    return user || null;
  }
}