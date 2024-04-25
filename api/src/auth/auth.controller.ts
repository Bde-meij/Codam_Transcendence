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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async login() {
  }

  @Get('callback')
  @UseGuards(AuthGuard('fortytwo'))
  async callback(@Req() req: Request, @Res() res: Response) {
    console.log('User information:', req.user);
    res.status(HttpStatus.FOUND).redirect('http://localhost:4200/dashboard');
  }
}
  /*@UseGuards(fortyTwoGuard)
  @Get('login')
  handlerLogin() {
    return this.handlerLogin()
  }

  @UseGuards(fortyTwoGuard)
  @Get('redirect')
  handlerRedirect() {
    return this.handlerRedirect()
  }

  @Get('status')
  user(@Req() req: Request) {
    if (req.user) {
      return {message: 'Authenticated', user: req.user}
    } else {
      return {message: 'Not Authentiated'}
    }
  }

  @Post()
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updatePass(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }*/