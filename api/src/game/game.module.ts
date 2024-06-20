import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { Match } from './entities/match.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { Loggary } from 'src/logger/logger.service';

@Module({
	imports: [TypeOrmModule.forFeature([Match]), UserModule],
	controllers: [MatchController],
	providers: [GameGateway, MatchService,
		{
			provide: Loggary,
			useFactory: () => new Loggary('GameModule', ['log', 'debug', 'warn', 'verbose'])
		}
	],
})
export class GameModule {}
