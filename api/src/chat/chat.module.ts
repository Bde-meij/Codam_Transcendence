import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChatRoomService } from './chatRoom.service';
import { Chatroom, UserChatroom } from './entities/chatRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockModule } from 'src/block/block.module';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chatroom, User, UserChatroom]), AuthModule, BlockModule, UserModule, FriendsModule],
  providers: [ChatGateway, ChatRoomService],
  exports: [ChatGateway, ChatRoomService]
})
export class ChannelModule {}