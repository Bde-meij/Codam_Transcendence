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
import { User } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  private user: User;
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService, private readonly userService: UserService) {}

  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async login() {console.log("It hereee");}

  @Get('callback')
  @UseGuards(AuthGuard('fortytwo'))
  async callback(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>) {
    this.user = {id: (req.user as any).id, displayName: (req.user as any).displayName};
    session.userId = this.user.id;
    if (!await this.userService.userExists(this.user.id)) {
        console.log("user not found");
        res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/register`);
    }
    else
    {
      console.log("user found");
      const user = await this.userService.findUserById(this.user.id);
      session.displayName = user.displayName;
      res.status(HttpStatus.FOUND).redirect(`http://${req.hostname}:4200/dashboard`);
    }
  }
  
  @Post('register')
  //@UseGuards(AuthGuard('fortytwo'))
  async register(@Req() req: Request, @Res() res: Response, @Session() session: Record<string, any>, @Body() data: any) {
    if (!await this.userService.findUserByName(data.nickname)) {
      session.displayName = data.nickname;
      this.user.displayName = data.nickname;
      await this.userService.createUser(this.user);
      return res.status(HttpStatus.OK);
    }
    return res.status(HttpStatus.FORBIDDEN).json({message: 'Name is already taken'});
  }
}