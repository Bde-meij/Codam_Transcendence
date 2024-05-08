import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Redirect, HttpStatus, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    //return this.userService.create(createUserDto);
  }

  @Get('current')
  async getUsername(@Res() res: Response, @Session() session: Record<string, any>) {
    return await this.userService.findUserById(session.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    //return this.userService.findOne(+id);
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
