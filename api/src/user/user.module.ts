import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {JwtService } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module';
import { Loggary } from 'src/logger/logger.service';

@Module({
	imports: [TypeOrmModule.forFeature([User]), AuthModule],
	controllers: [UserController],
	providers: [UserService, JwtService,
		{
			provide: Loggary,
			useFactory: () => new Loggary('UserModule', ['log', 'debug', 'warn', 'verbose'])
		}
	],
	exports: [UserService],
})
export class UserModule {}
