import { Logger, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TestingModule } from './testing/testing.module';
import { FriendsModule } from './friends/friends.module';
import { BlockModule } from './block/block.module';
import { Loggary } from 'src/logger/logger.service';

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
		FriendsModule,
		BlockModule,
	],
	controllers: [],
	providers: [GameModule, ChatGateway,
		{
			provide: Logger,
			useClass: Loggary
		}
	],
})
export class AppModule {}
