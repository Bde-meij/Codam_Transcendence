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
import { refreshToken } from './entities/refreshToken.entity';
import { Loggary } from 'src/logger/logger.service';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService, private jwtService: JwtService, private configService: ConfigService, private loggary: Loggary, @InjectRepository(refreshToken) private readonly tokenRepo: Repository<refreshToken>){}

	async getJwtTokens(user: CallbackAuthDto): Promise<{access_token: string, refresh_token: string}> {
		const payload = {id: user.id, is2faVerified: user.is2faVerified};
		return {
			access_token : await this.jwtService.signAsync(payload,
				{expiresIn: this.configService.getOrThrow("JWT_ACCESS_TIME"),
				secret: this.configService.getOrThrow('JWT_ACCESS_SECRET')}),
			refresh_token : await this.jwtService.signAsync(payload,
				{expiresIn: this.configService.getOrThrow("JWT_REFRESH_TIME"),
				secret: this.configService.getOrThrow('JWT_REFRESH_SECRET')}),
		};
	}

	//returns jwt tokens that never expire for testing purposes
	async getForeverJwtTokens(user: CallbackAuthDto): Promise<{access_token: string, refresh_token: string}> {
		const payload = {id: user.id, is2faVerified: user.is2faVerified};
		return {
			access_token : await this.jwtService.signAsync(payload,
				{expiresIn: 'none',
				secret: this.configService.getOrThrow('JWT_ACCESS_SECRET')}),
			refresh_token : await this.jwtService.signAsync(payload,
				{expiresIn: 'none',
				secret: this.configService.getOrThrow('JWT_REFRESH_SECRET')}),
		};
	}

	async verifyJwtAccessToken(token: string) {
		console.log('verifying access token...')
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.getOrThrow("JWT_ACCESS_SECRET"),
				}
			);
			return payload;
		}
		catch(error) {
			throw new UnauthorizedException('Invalid access token');
		}
	}

	async verifyJwtRefreshToken(token: string) {
		console.log('verifying refresh token...')
		const invalidatedToken = await this.tokenRepo.findOne({where: {token: token}});
		if (invalidatedToken)
			throw new UnauthorizedException('Old refresh token (verify)');
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: this.configService.getOrThrow("JWT_REFRESH_SECRET"),
				}
			);
			return payload;
		}
		catch(error) {
			throw new UnauthorizedException('Invalid refresh token (verify)');
		}
	}

	async invalidateRefreshToken(refreshToken: string) {
		return await this.tokenRepo.save({token: refreshToken});
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