import { CanActivate, ExecutionContext, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from "../auth.service";
import { Loggary } from "src/logger/logger.service";

@Injectable()
export class JwtGuardIgnore2fa implements CanActivate {
	constructor(private jwtService: JwtService, private configService: ConfigService, private authService: AuthService, private loggary: Loggary) {};

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const accessToken = this.extractTokenFromHeader(request, 'access_token');
		if (!accessToken) {
			throw new UnauthorizedException('Access token not found');
		}
		try {
			const payload = await this.authService.verifyJwtAccessToken(accessToken);
			request['user'] = payload;
		} catch(err) {
			console.log('Access token validation failed (JWT guard): ', err);
			throw new UnauthorizedException('Invalid access token');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request, token_name: string): string | undefined {
		const token = request.cookies[token_name]
		// console.log("jwt guard: extractTokenFromHeader():", token);
		return (token);
	}
}