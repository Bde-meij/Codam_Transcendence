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
		const token = this.extractTokenFromHeader(request);
		if (!token) {
			throw new UnauthorizedException();
		}
		try {
			const payload = await this.authService.verifyJwtAccessToken(token);
			request['user'] = payload;
		} catch {
			throw new UnauthorizedException();
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const token = request.cookies['access_token']
		console.log("jwt guard: extractTokenFromHeader():", token);
		return (token);
	}
}