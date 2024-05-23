import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Redirect, HttpStatus, Session, UseGuards, Req, HttpCode, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	create(@Body() createUserDto: CreateUserDto) {
		//return this.userService.create(createUserDto);
	}

	@Get('current')
	@UseGuards(JwtGuard)
	async getUsername(@Req() req) {
		const user = await this.userService.findUserById(req.user.id);
		return user;
	}
	
	@Get(':id')
	@UseGuards(JwtGuard)
	async findUserById(@Req() req, @Param('id') id: string) {
		const user = await this.userService.findUserById(req.user.id);
		return user;
	}

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
	async getAvatar(@Req() req) {
		const user = await this.userService.findUserById(req.user.id);
		// return user.avatar; // TO DO : add avatar to user
		return ;
	}

	@Post('uploadAvatar')
	@UseGuards(JwtGuard)
	@UseInterceptors(FileInterceptor('file'))
	async uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
		console.log("MY DATA: ", file);
		return ;
	}

}



// @Post('upload')
// @UseInterceptors(FileInterceptor('file'))
// uploadFile(@UploadedFile() file: Express.Multer.File) {
//   console.log(file);
// }