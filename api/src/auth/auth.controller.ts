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
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from './guard/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CallbackAuthDto } from './dto/callback-auth.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly userService: UserService) {}

	// Checks whether the user is authorized using the jwtguard
	// Returns: {loggedIn: true} on success - 401 Unauthorized on failure
	@Get('check')
	@UseGuards(JwtGuard)
	async checkLoggedIn() {
		return {loggedIn: true};
	}

	@Get('login')
	@UseGuards(AuthGuard('fortytwo'))
	async login() {console.log("It hereee");}

	@Get('callback')
	@UseGuards(AuthGuard('fortytwo'))
	async callback(@Req() req: Request, @Res() res: Response) {
		const user: CallbackAuthDto = {
			id: (req.user as any).id,
			// nickname: (req.user as any).nickname,
		}
		// const user: User = {
		// 	id: (req.user as any).id,
		// 	nickname: (req.user as any).nickname,
		// 	status: "online",
		// 	avatar: "",
		// 	friendIn: [],
		// 	friendOut: [],
		// };
		const token = await this.authService.getJwtAccessToken(user);
		res.cookie("access_token", token.access_token);
		if (!await this.userService.userExists(user.id)) {
			console.log("user not found");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
		}
		else
		{
			console.log("user found");
			this.userService.updateStatus(user.id, "online");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard`);
		}
	}

	@Post('register')
	@UseGuards(JwtGuard)
	async register(@Req() req, @Res() res: Response, @Body() body: {nickname : string}) {
		console.log("NEW NAME:", body.nickname);
		const user: CreateUserDto = {id: req.user.id, nickname: body.nickname};

		if (await this.userService.findUserById(user.id))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'User already registered'});

		if (await this.userService.findUserByName(body.nickname))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});

		await this.userService.createUser(user);
		return res.status(HttpStatus.OK).json({message: 'User registered', user: user});
	}

	@Post('logout')
	@UseGuards(JwtGuard)
	async logout(@Req() req) {
		await this.userService.updateStatus(req.user.id, "offline");
	}
}