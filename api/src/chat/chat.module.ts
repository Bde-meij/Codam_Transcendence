import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { ChatRoomService } from './chatRoom.service';
import { ChatRoom } from './entities/chatRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockModule } from 'src/block/block.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom]), AuthModule, BlockModule, UserModule],
  providers: [ChatGateway, ChatRoomService],
  exports: [ChatRoomService]
})
export class ChannelModule {}