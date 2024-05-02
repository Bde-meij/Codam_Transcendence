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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async login() {}

  @Get('callback')
  @UseGuards(AuthGuard('fortytwo'))
  async callback(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>) {
    // console.log('User information:', req.user);
    session.userId = (req.user as any).id;
    if (!await this.authService.userExists(session.userId))
    {
      //res.status(HttpStatus.FOUND).redirect('http://localhost:4200/register');
      session.displayName = (req.user as any).usual_full_name;
      const userData = {id: session.userId, displayName: session.displayName};
      await this.authService.createUser(userData);
    }
    else
    {
      const user = await this.authService.findUser(session.userId);
      session.displayName = user.displayName;
    }
    res.status(HttpStatus.FOUND).redirect('http://localhost:4200/dashboard');
  }

  @Get('register')
  @UseGuards(AuthGuard('fortytwo'))
  async register(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>) {
    session.displayName = (req.user as any).username;
    const userData = {id: session.userId, displayName: session.displayName};
    await this.authService.createUser(userData);
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