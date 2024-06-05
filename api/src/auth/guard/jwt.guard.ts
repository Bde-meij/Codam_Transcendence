import { CanActivate, ExecutionContext, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from "../auth.service";

@Injectable()
export class JwtGuard implements CanActivate {
	constructor(private jwtService: JwtService, private configService: ConfigService, private authService: AuthService) {};

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const accessToken = this.extractTokenFromHeader(request, 'access_token');
		const refreshToken = this.extractTokenFromHeader(request, 'refresh_token');
		if (!accessToken) {
			throw new UnauthorizedException('Access token not found');
		}
		try {
			const payload = await this.authService.verifyJwtAccessToken(accessToken);
			if (!payload.is2faVerified)
				throw new UnauthorizedException();
			request['user'] = payload;
		} catch(err) {
			console.log('Access token validation failed: ', err);
			if (refreshToken) {
				try {
					const tokenAndPlayload = await this.authService.refreshJwtToken(refreshToken);
					if (!tokenAndPlayload.payload.is2faVerified)
						throw new UnauthorizedException();
					response.cookie('access_token', tokenAndPlayload.newAccessToken, {httpOnly: true});
					request.user = await this.authService.verifyJwtAccessToken(tokenAndPlayload.newAccessToken);
				}
				catch(error) {
					console.error('Refresh token validation failed: ', error);
					throw new UnauthorizedException('Invalid refresh token');
				}
			}
			else {
				throw new UnauthorizedException('Refresh token not found');
			}
		}
		return true;
	}

	private extractTokenFromHeader(request: Request, token_name: string): string | undefined {
		const token = request.cookies[token_name]
		console.log("jwt guard: extractTokenFromHeader():", token);
		return (token);
	}
}