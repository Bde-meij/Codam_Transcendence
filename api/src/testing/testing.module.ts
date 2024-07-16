import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { UserModule } from 'src/user/user.module';
import { FriendsModule } from 'src/friends/friends.module';
import { BlockModule } from 'src/block/block.module';
import { GameModule } from 'src/game/game.module';
import { ChannelModule } from 'src/chat/chat.module';

@Module({
	controllers: [TestingController],
	providers: [],
	imports: [UserModule, FriendsModule, BlockModule, GameModule, ChannelModule]
})
export class TestingModule {}
