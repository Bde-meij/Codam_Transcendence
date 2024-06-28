import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class CookieMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (req.originalUrl == '/api/auth/refresh') {
			if (req.cookies['access_token']) {
				delete req.cookies['access_token'];
			}
		}
		else {
			if (req.cookies['refresh_token']) {
				delete req.cookies['refresh_token'];
			}
		}
		next();
	}
}