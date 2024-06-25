import { Logger, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { BossGameModule } from './bossPong/BossGame.module';
import { ChatGateway } from './chat/chat.gateway';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';
import { PasswordService } from './password/password.service';
import { FriendsModule } from './friends/friends.module';
import { CookieMiddleware } from './auth/middleware/cookie.middleware';
import { BlockModule } from './block/block.module';
import { Loggary } from 'src/logger/logger.service';
import { ChannelModule } from './chat/chat.module';

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
		BossGameModule,
		DatabaseModule,
		TestingModule,
		FriendsModule,
		// ChannelModule,
		BlockModule,
	],
	controllers: [],
	providers: [BossGameModule, GameModule, ChatGateway,
		PasswordService,
		{
			provide: Logger,
			useClass: Loggary
		}
	],
})
export class AppModule implements NestModule{
	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(CookieMiddleware)
			.forRoutes('*');
	}
}
