import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	Req,
	Res,
	HttpStatus,
	Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response, Express, response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { JwtGuard } from './guard/jwt.guard';
import { JwtGuardIgnore2fa } from './guard/jwtIgnore2fa.guard';
import { CallbackAuthDto } from './dto/callback-auth.dto';
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
		const potentialNewUser: CallbackAuthDto = {
			id: (req.user as any).id,
			is2faVerified: true,
		}
		const userExists: boolean = await this.userService.userExists(potentialNewUser.id);
		if (userExists) {
			if ((await this.userService.findUserById(potentialNewUser.id)).isTwoFAEnabled)
				potentialNewUser.is2faVerified = false;
		}
		const tokens = await this.authService.getJwtTokens(potentialNewUser);
		res.cookie('access_token', tokens.access_token, {httpOnly: true});
		res.cookie('refresh_token', tokens.refresh_token, {httpOnly: true});
		if (!userExists) {
			console.log("user not found");
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
		}
		else
		{
			console.log("user found");
			if ((await this.userService.findUserById(potentialNewUser.id)).isTwoFAEnabled) {
				res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/twofa`);
			}
			else {
				this.userService.updateStatus(potentialNewUser.id, 'online');
				res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard`);
			}
		}
	}

	//makes jwt tokens that never expire for testing purposes
	@Get('foreverCokkies')
	async foreverCokkies(@Req() req: Request, @Res() res: Response) {
		const fakeUser: CallbackAuthDto = {
			id: (req.user as any).id,
			is2faVerified: true,
		}
		const tokens = await this.authService.getForeverJwtTokens(fakeUser);
		res.cookie('access_token', tokens.access_token, {httpOnly: true});
		res.cookie('refresh_token', tokens.refresh_token, {httpOnly: true});
	}

	@Post('logout')
	@UseGuards(JwtGuard)
	async logout(@Req() req, @Res() res) {
		await this.userService.updateStatus(req.user.id, 'offline');
		res.clearCookie('access_token');
		res.clearCookie('refresh_token');
		res.status(200).send({message: 'Logged out successfully'});
	}

	@Get('2fasetup')
	@UseGuards(JwtGuard)
	async setupTwoFA(@Req() req, @Res() res) {
		const user: User = await this.userService.findUserById(req.user.id);
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
	@UseGuards(JwtGuardIgnore2fa)
	async verifyTwoFA(@Req() req, @Res() res, @Body() body) {
		const user: User = await this.userService.findUserById(req.user.id);
		const secret = user.twoFASecret;
		const isValid = await this.authService.verifyTwoFAToken(secret, body.userInput);
		if (isValid) {
			const potentialNewUser: CallbackAuthDto = {
				id: (req.user as any).id,
				is2faVerified: true,
			}
			const tokens = await this.authService.getJwtTokens(potentialNewUser);
			res.cookie('access_token', tokens.access_token);
			res.cookie('refresh_token', tokens.refresh_token);
			res.json({message: 'Google 2FA verified', status: true});
			if (!user.isTwoFAEnabled)
				await this.userService.enableTwoFA(user.id);
			if (user.status == 'offline')
				await this.userService.updateStatus(user.id, 'online');
		}
		else
			res.json({message: 'Invalid authentication code', status: false});
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