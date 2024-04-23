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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('code')
  async login(@Body() code: string): Promise<any> {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const clientSecert = this.configService.get<string>('CLIENT_SECRET');
    const redirectUri = 'http://localhost:4200/callback'
    const tokenEndpoint = 'https://api.intra.42.fr/v2/oauth';

    try {
      const response = await axios.post(tokenEndpoint, {
        code,
        client_id: clientId,
        client_secret: clientSecert,
        redirect_uri: redirectUri,
        grant_type: 'client_credentials',
      });

      const accessToken = response.data.access_token;
      console.log('Access token: ', accessToken);
      const userInfoEndpoint = 'https://api.intra.42.fr/v2/me'
      const userInfoResponse = await axios.get(userInfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      })

      const userInfo = userInfoResponse.data;
      const userExists = await this.authService.findUser(userInfo.id);

      if (!userExists){
        await this.authService.createUser(userInfo);
      }

      return userInfo;
    }

    catch (error) {
      console.error('Error exchanging code for access token:', error);
      throw error;
    }
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