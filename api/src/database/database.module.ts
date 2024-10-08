import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { refreshToken } from 'src/auth/entities/refreshToken.entity';
import { Blocks } from 'src/block/entities/block.entity';
import { Chatroom, UserChatroom } from 'src/chat/entities/chatRoom.entity';
import { FriendRequest } from 'src/friends/entities/friend.entity';
import { Match } from 'src/game/entities/match.entity';
import { MatchStats } from 'src/game/entities/stats.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.getOrThrow('POSTGRES_HOST'),
				port: configService.getOrThrow('POSTGRES_PORT'),
				username: configService.getOrThrow('POSTGRES_USERNAME'),
				password: configService.getOrThrow('POSTGRES_PASSWORD'),
				database: configService.getOrThrow('POSTGRES_DB'),
				synchronize: configService.getOrThrow('POSTGRES_SYNC'),
				logging: false,
				entities: [
					User,
					FriendRequest,
					refreshToken,
					Blocks,
					Match,
					MatchStats,
					Chatroom,
					UserChatroom,
				],
			})
		}),
	]
})
export class DatabaseModule {}
