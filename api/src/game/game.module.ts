import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameGateway } from './game.gateway';
import { Match } from './entities/match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
	imports: [TypeOrmModule.forFeature([Match]), UserModule, AuthModule, UserModule],
	controllers: [MatchController],
	providers: [GameGateway, MatchService],
})
export class GameModule {}
