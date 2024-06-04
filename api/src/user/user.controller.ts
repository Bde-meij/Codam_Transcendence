import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Redirect, HttpStatus, Session, UseGuards, Req, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		//return this.userService.create(createUserDto);
	}

	@Get('current')
	@UseGuards(JwtGuard)
	async getUser(@Req() req) {
		const user = await this.userService.findUserById(req.user.id);
		return user;
	}
	
	// @Get(':id')
	// @UseGuards(JwtGuard)
	// async findUserById(@Req() req, @Param('id') id: string) {
	// 	const user = await this.userService.findUserById(id);
	// 	return user;
	// }

	@Get('/isnametaken/:nickname')
	@UseGuards(JwtGuard)
	async isNameTaken(@Req() req, @Param('nickname') name: string) {
		let taken : boolean = false;
		if (await this.userService.findUserByName(name)) {
			taken = true;
		}
		console.log("TAKEN : " + taken);
		return (taken);
	}

	@Post('changename')
	@UseGuards(JwtGuard)
	async changeName(@Req() req, @Res() res, @Body() body: {nickname : string}) {
		console.log("NEW NAME:", body.nickname);
		if (await this.userService.findUserByName(body.nickname))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});
		await this.userService.updateName(req.user.id, body.nickname);
		return res.status(HttpStatus.OK).json({message: 'Nickname changed'});
	}

	@Post('register')
	@UseGuards(JwtGuard)
	//@UseGuards(AuthGuard('fortytwo'))
	async register(@Req() req, @Res() res, @Body() body: {nickname : string}) {
		console.log("NEW NAME:", body.nickname);
		const user: CreateUserDto = {id: req.user.id, nickname: body.nickname};

		if (await this.userService.findUserById(user.id))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'User already registered'});

		if (await this.userService.findUserByName(body.nickname))
			return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});

		await this.userService.createUser(user);
		return res.status(HttpStatus.OK).json({message: 'User registered', user: user});
	}

	// @Post('register')
	// @UseGuards(JwtGuard)
	// //@UseGuards(AuthGuard('fortytwo'))
	// async register(@Req() req, @Res() res, @Body() body: {nickname : string}) {
	// 	console.log("NEW NAME:", body.nickname);
	// 	const user: any = {id: req.user.id, nickname: body.nickname, avatar: "/uploads/default_avatar.png", status: "online"};
	// 	if (await this.userService.findUserById(user.id))
	// 		return res.status(HttpStatus.FORBIDDEN).json({message: 'User already registered'});

	// 	if (await this.userService.findUserByName(body.nickname))
	// 		return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});

	// 	await this.userService.createUser(user);
	// 	return res.status(HttpStatus.OK).json({message: 'User registered', user: user});
	// }

	@Get('/name/:id')
	@UseGuards(JwtGuard)
	async findUserByName(@Req() req, @Param('name') name: string) {
		const user = await this.userService.findUserByName(name);
		return user;
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		//return this.userService.update(+id, updateUserDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		//return this.userService.remove(+id);
	}

	@Get('getAvatar')
	@UseGuards(JwtGuard)
	async getAvatar(@Req() req, @Res() res) {
		const user = await this.userService.findUserById(req.user.id);
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
		const user = await this.userService.findUserById(id);
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
	async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
		this.userService.updateAvatar(req.user.id, file.path);
		console.log("MY DATA: ", file);
		return ;
	}
}