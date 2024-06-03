import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	Req,
	Res,
	HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from './guard/jwt.guard';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly userService: UserService) {}

	// Checks whether the user is authorized using the jwtguard
	// Returns: {loggedIn: true} on success - 401 Unauthorized on failure
	@Get('isloggedin')
	@UseGuards(JwtGuard)
	async checkLoggedIn() {
		return {loggedIn: true};
	}

	@Get('login')
	@UseGuards(AuthGuard('fortytwo'))
	async login() {}

	@Get('callback')
	@UseGuards(AuthGuard('fortytwo'))
	async callback(@Req() req: Request, @Res() res: Response) {
<<<<<<< HEAD
	// const user: any = {id: (req.user as User).id, nickname: (req.user as User).nickname};
	const user: any = {id: (req.user as User).id, nickname: (req.user as any).nickname, status: "online", avatar: "", rooms: (req.user as any).rooms};
=======
	const user : User = {id: (req.user as any).id, nickname: (req.user as any).nickname, status: "online", avatar: "", twoFASecret: null, isTwoFAEnabled: false};
>>>>>>> 517a8cf634813a832a90eefe0abc26c6a455d666
	const token = await this.authService.getJwtAccessToken(user);
	res.cookie("access_token", token.access_token);
		if (!await this.userService.userExists(user.id)) {
			console.log("user not found");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
		}
		else
		{
			console.log("user found");
			//if ((await this.userService.findUserById(user.id)).isTwoFAEnabled) {
				//res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/2fa`);
			//}
			//else {
				this.userService.updateStatus(user.id, 'online');
				res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard`);
			//}
		}
	}

	@Post('register')
	@UseGuards(JwtGuard)
<<<<<<< HEAD
=======
	//@UseGuards(AuthGuard('fortytwo'))
>>>>>>> 517a8cf634813a832a90eefe0abc26c6a455d666
	async register(@Req() req, @Res() res: Response, @Body() body: {nickname : string}) {
		console.log("NEW NAME:", body.nickname);
		const user: any = {id: req.user.id, nickname: body.nickname, avatar: "/uploads/default_avatar.png", status: "online"};
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
		await this.userService.updateStatus(req.user.id, 'offline');
	}

	@Get('2fasetup')
	@UseGuards(JwtGuard)
	async setupTwoFA(@Req() req, @Res() res) {
		const user = await this.userService.findUserById(req.user.id);
		const secret = await this.authService.generateTwoFASecret(user.id);
		const otpauthUrl = speakeasy.otpauthURL({
			secret: secret.ascii,
			label: `Transcendence (${user.id})`,
			issuer: 'Transcendence',
		});
		const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

		res.json({qrCode: qrCodeUrl, secret: secret.base32});
	}

	@Post('2faverify')
	@UseGuards(JwtGuard)
	async verifyTwoFA(@Req() req, @Res() res, @Body() body) {
		const user = await this.userService.findUserById(req.user.id);
		if (!user.isTwoFAEnabled) {
			await this.userService.enableTwoFA(user.id);
		}
		const secret = user.twoFASecret;
		const isValid = await this.authService.verifyTwoFAToken(secret, body.userInput);
		if (isValid) {
			res.json({message: 'Google 2FA verified'});
			await this.userService.updateStatus(user.id, 'online');
		}
		else
			res.json({message: 'Invalid authentication code'});
	}

	@Post('2fadisable')
	@UseGuards(JwtGuard)
	async disableTwoFA(@Req() req) {
		this.userService.disableTwoFA(req.user.id);
		this.userService.updateTwoFASecret(req.user.id, {base32: null});
	}

	@Get('is2faenabled')
	@UseGuards(JwtGuard)
	async isTwoFAEnabled(@Req() req, @Res() res) {
		const isEnabled = (await this.userService.findUserById(req.user.id)).isTwoFAEnabled;
		res.json({isTwoFAEnabled: isEnabled});
	}
}