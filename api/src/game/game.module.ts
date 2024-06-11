import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [GameGateway, GameService],
  exports: [GameGateway]
})
export class GameModule {}
