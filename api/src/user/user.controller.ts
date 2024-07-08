import { Controller, Get, Post, Body, Param, Res, HttpStatus, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import * as path from 'path';
import { User, defaultAvatarUrl } from './entities/user.entity';
import { ok } from 'assert';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('current')
	@UseGuards(JwtGuard)
	async getUser(@Req() req) {
		// console.log('GET: user/current');
		const user : User = await this.userService.findUserById(req.user.id);
		return user;
	}
	
	@Get('/isnametaken/:nickname')
	@UseGuards(JwtGuard)
	async isNameTaken(@Req() req, @Param('nickname') name: string) {
		// console.log('GET: user/isnametaken');
		let taken : boolean = false;
		try { 
			await this.userService.findUserByName(name);
			taken = true;
		} catch {
			taken = false;
		}
		// console.log("TAKEN : " + taken);
		return (taken);
	}
	
	@Post('changename')
	@UseGuards(JwtGuard)
	async changeName(@Req() req, @Res() res, @Body() body: {nickname : string}) {
		// console.log("NEW NAME:", body.nickname);
		if (await this.userService.findUserByName(body.nickname))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});
		await this.userService.updateName(req.user.id, body.nickname);
		return res.status(HttpStatus.OK).json({message: 'Nickname changed'});
	}
	
	@Post('register')
	@UseGuards(JwtGuard)
	async register(@Req() req, @Res() res, @Body() body: {nickname : string}) {
		// console.log("NEW NAME:", body.nickname);
		const user: CreateUserDto = {id: req.user.id, nickname: body.nickname};
		await this.userService.createUser(user);
		return res.status(HttpStatus.OK).json({message: 'User registered', user: user});
	}
	
	@Get('/name/:id')
	@UseGuards(JwtGuard)
	async findUserByName(@Req() req, @Param('id') id: string) {
		// console.log('GET: user/name');
		const user: User = await this.userService.findUserById(id);
		return user;
	}
	

	@Get('partial/name/:id')
	@UseGuards(JwtGuard)
	async returnPartialUser(@Param('id') id: string) {
		// console.log('GET: user/partial/name');
		const fullUser = await this.userService.findUserById(id);
		const {status, avatar, friendIn, friendOut, twoFASecret, isTwoFAEnabled, ...rest} = fullUser;
		return rest as CreateUserDto;
	}
	
	@Get('getAvatar')
	@UseGuards(JwtGuard)
	async getAvatar(@Req() req, @Res() res) {
		// console.log('GET: user/getAvatar');
		const user = await this.userService.findUserById(req.user.id);
		if (!user)
			return res.status(HttpStatus.NOT_FOUND).json({message: 'User not found'});
		const file = createReadStream(join(process.cwd(), user.avatar));
		// Return error 404 if the avatar doesn't exist
		file.on('error', () => {
			return res.status(HttpStatus.NOT_FOUND).json({message: 'Avatar not found', avatar: user.avatar});
		})
		
		file.pipe(res);
	}
	
	@Get('getAvatar/:id')
	@UseGuards(JwtGuard)
	async getAvatarById(@Req() req, @Res() res, @Param('id') id: string) {
		// console.log('GET: user/getAvatar/id');
		const user = await this.userService.getAvatar(id);
		if (!user)
			return res.status(HttpStatus.NOT_FOUND).json({message: 'User not found'});
		const file = createReadStream(join(process.cwd(), user.avatar));
		// Return error 404 if the avatar doesn't exist
		file.on('error', () => {
			return res.status(HttpStatus.NOT_FOUND).json({message: 'Avatar not found', avatar: user.avatar});
		})
		
		file.pipe(res);
	}

	@Post('uploadAvatar')
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor('file', {
		storage: diskStorage({
			destination: './uploads',
			filename: (req, file, cb) => {
				const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
				cb(null, `${randomName}${extname(file.originalname)}`);
			},
		}),
	}))
	async uploadAvatar(@Req() req, @Res() res, @UploadedFile() file: Express.Multer.File) {
		const currentAvatarPath = (await this.userService.getAvatar(req.user.id)).avatar;
		//deletes old image if there was one (and isn't default avatar)
		if (currentAvatarPath === defaultAvatarUrl) {
			const resolvedAvatarPath = path.resolve(currentAvatarPath);
			if (existsSync(resolvedAvatarPath))
				unlinkSync(resolvedAvatarPath);
		}
		this.userService.updateAvatar(req.user.id, file.path);
		console.log("MY DATA: ", file);
		return res.status(HttpStatus.OK).json({message: 'Avatar uploaded'});
	}

	@Post('update-roomkey/:key')
	@UseGuards(JwtGuard)
	async updateRoomKey(@Req() req, @Param('key') key: string) {
		await this.userService.updateRoomKey(req.user.id, +key);
	}
}