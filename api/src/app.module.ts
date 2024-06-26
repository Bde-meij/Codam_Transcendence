import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		AuthModule,
		DatabaseModule,
		UserModule,
		GameModule,
		DatabaseModule,
		TestingModule,
	],
	controllers: [],
	providers: [GameModule, ChatGateway],
})
export class AppModule {}
