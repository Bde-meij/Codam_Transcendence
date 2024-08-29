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
	HttpException,
	UnauthorizedException,
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
import { JwtRefreshGuard } from './guard/jwtRefresh.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly userService: UserService) {}

	// Checks whether the user is authorized using the jwtguard
	// Returns: {loggedIn: true} on success - 401 Unauthorized on failure
	@Get('isloggedin')
	@UseGuards(JwtGuard)
	async checkLoggedIn(@Req() req) {
		// if (!await this.userService.findUserById(req.user.id))
		// 	throw new UnauthorizedException("Did you really just delete yourself from the database while you were logged in to see what happens??");
		// console.log('GET: auth/isloggedin');
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
		const user: User = await this.userService.findUserById(potentialNewUser.id)
		if (user && user.isTwoFAEnabled == true) {
			potentialNewUser.is2faVerified = false;
		}
		const tokens = await this.authService.getJwtTokens(potentialNewUser);
		res.cookie('access_token', tokens.access_token, {httpOnly: true});
		res.cookie('refresh_token', tokens.refresh_token, {httpOnly: true});
		if (!user) {
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
		}
		else if (user.isTwoFAEnabled) {
				res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/twofa`);
		}
		else {
			this.userService.updateStatus(user.id, 'online');
			res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard/home`);
		}
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
		const secret = await this.authService.generateTwoFASecret(req.user.id);
		const otpauthUrl = speakeasy.otpauthURL({
			secret: secret.ascii,
			label: `Transcendence (${req.user.id})`,
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
		if (!isValid) {
			res.json({message: 'Invalid authentication code', status: false});
			return;
		}
		const tokens = await this.authService.getJwtTokens({
			id: req.user.id,
			is2faVerified: true,
		});
		res.cookie('access_token', tokens.access_token);
		res.cookie('refresh_token', tokens.refresh_token);
		res.json({message: 'Google 2FA verified', status: true});
		if (!user.isTwoFAEnabled)
			await this.userService.enableTwoFA(user.id);
		if (user.status == 'offline')
			await this.userService.updateStatus(user.id, 'online');
	}

	@Post('2fadisable')
	@UseGuards(JwtGuard)
	async disableTwoFA(@Req() req) {
		this.userService.updateTwoFA(req.user.id, false, {base32: null});
	}

	@Get('is2faenabled')
	@UseGuards(JwtGuard)
	async isTwoFAEnabled(@Req() req, @Res() res) {
		const status = (await this.userService.get2faEnabled(req.user.id));
		if (!status){
			throw new HttpException('User ' + req.user.id + ' not found', HttpStatus.NOT_FOUND);
		}
		const isEnabled = status.isTwoFAEnabled
		res.json({isTwoFAEnabled: isEnabled});
	}

	@Post('refresh')
	@UseGuards(JwtRefreshGuard)
	async refreshToken(@Req() req, @Res() res) {
		await this.authService.invalidateRefreshToken(req.refresh_token);
		const tokens = await this.authService.getJwtTokens({
			id: req.user.id,
			is2faVerified: req.user.is2faVerified,
		});
		res.cookie('access_token', tokens.access_token, {httpOnly: true});
		res.cookie('refresh_token', tokens.refresh_token, {httpOnly: true});
		res.json({message: "Tokens refreshed"});
	}
}