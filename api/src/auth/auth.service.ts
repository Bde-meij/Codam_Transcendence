import { Session, HttpStatus, Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoExpiredSessionError, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CallbackAuthDto } from './dto/callback-auth.dto';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService, private jwtService: JwtService, private configService: ConfigService){}

	async getJwtTokens(user: CallbackAuthDto): Promise<{access_token: string, refresh_token: string}> {
		const payload = {id: user.id};
		return {
			access_token : await this.jwtService.signAsync(payload, {expiresIn: '15m'}),
			refresh_token : await this.jwtService.signAsync(payload, {expiresIn: '7d'}),
		};
	}

	async verifyJwtAccessToken(token: string) {
		console.log('verifying token...')
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.getOrThrow("JWT_SECRET"),
				}
			);
			// console.log('token verified: payload:', payload)
			return payload;
		}
		catch(error) {
			throw new UnauthorizedException('Invalid access token');
		}
	}

	async refreshJwtToken(token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.getOrThrow("JWT_SECRET"),
				}
			);
			const newAccessToken = this.jwtService.sign({ username: payload.username, sub: payload.sub }, { expiresIn: '15m' });
      		return newAccessToken;
		}
		catch(error) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async verifyTwoFAToken(userSecret: string, token: string) {
		return speakeasy.totp.verify({
			secret: userSecret,
			encoding: 'base32',
			token,
		});
	}

	async generateTwoFASecret(id: string) {
		const secret = speakeasy.generateSecret();
		await this.userService.updateTwoFASecret(id, secret)
		return secret;
	}
}