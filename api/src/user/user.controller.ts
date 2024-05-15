import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Redirect, HttpStatus, Session, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

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
}
