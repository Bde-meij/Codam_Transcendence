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
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { fortyTwoGuard } from './guard/fortyTwo.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(fortyTwoGuard)
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

/*  @Post()
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
}
