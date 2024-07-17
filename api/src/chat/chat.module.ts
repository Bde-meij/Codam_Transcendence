import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChatRoomService } from './chatRoom.service';
import { ChatMessage, ChatRoom, chatRoomList } from './entities/chatRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockModule } from 'src/block/block.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, chatRoomList, ChatMessage]), AuthModule, BlockModule, UserModule],
  providers: [ChatGateway, ChatRoomService],
  exports: [ChatGateway, ChatRoomService]
})
export class ChannelModule {}