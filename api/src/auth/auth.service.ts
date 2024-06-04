import { Session, HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

	async getJwtAccessToken(user: CallbackAuthDto): Promise<{access_token: string}> {
		const payload = {id: user.id};
		return {
			access_token : await this.jwtService.signAsync(payload),
		};
	}

	async verifyJwtAccessToken(token: string) {
		console.log('verifying token...')
		const payload = await this.jwtService.verifyAsync(
			token,
			{
				secret: this.configService.getOrThrow("JWT_SECRET"),
			}
		);
		// console.log('token verified: payload:', payload)
		return payload;
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