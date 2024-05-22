import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Req,
	Res,
	Redirect,
	HttpStatus,
	Session,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from './guard/jwt.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly userService: UserService) {}

	@Get('login')
	@UseGuards(AuthGuard('fortytwo'))
	async login() {console.log("It hereee");}

	@Get('callback')
	@UseGuards(AuthGuard('fortytwo'))
	async callback(@Req() req: Request, @Res() res: Response) {
		const user = {id: (req.user as any).id, nickname: (req.user as any).nickname};
	const token = await this.authService.getJwtAccessToken(user);
	res.cookie("access_token", token.access_token);
		if (!await this.userService.userExists(user.id)) {
			console.log("user not found");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
		}
		else
		{
			console.log("user found");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard`);
		}
	}
	
	@Post('register')
	@UseGuards(JwtGuard)
	//@UseGuards(AuthGuard('fortytwo'))
	async register(@Req() req, @Res() res: Response, @Body() data: any) {
	var user: User = {id: req.user.id, nickname: data.nickname};

	console.log("IMAGE TEST:", data);

	if (await this.userService.findUserById(user.id))
		return res.status(HttpStatus.FORBIDDEN).json({message: 'User already registered'});

	if (await this.userService.findUserByName(data.nickname)) 
		return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});

	await this.userService.createUser(user);
	return res.status(HttpStatus.OK).json({message: 'User registered'});
	}
}