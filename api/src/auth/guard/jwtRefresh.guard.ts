import { CanActivate, ExecutionContext, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshGuard implements CanActivate {
	constructor(private jwtService: JwtService, private configService: ConfigService, private authService: AuthService) {};

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const refreshToken = this.extractTokenFromHeader(request, 'refresh_token');
		if (!refreshToken) {
			throw new UnauthorizedException('Refresh token not found');
		}
		try {
			const payload = await this.authService.verifyJwtRefreshToken(refreshToken);
			request['user'] = payload;
			request['refresh_token'] = refreshToken;
		} catch(err) {
			response.clearCookie('access_token');
			response.clearCookie('refresh_token');
			console.log('Refresh token validation failed (JWT refresh guard): ', err);
			throw new UnauthorizedException('Invalid refresh token');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request, token_name: string): string | undefined {
		const token = request.cookies[token_name]
		console.log("jwt guard: extractTokenFromHeader():", token);
		return (token);
	}
}