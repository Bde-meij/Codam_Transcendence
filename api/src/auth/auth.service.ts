import { Session, HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService, private jwtService: JwtService){}

	async getJwtAccessToken(user: User): Promise<{access_token: string}> {
		const payload = {sub: user.id};
		return {
			access_token : await this.jwtService.signAsync(payload),
		};
	}
}