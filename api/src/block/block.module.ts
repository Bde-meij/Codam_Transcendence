import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { Block } from './entities/block.entity';
import { Loggary } from 'src/logger/logger.service';

@Module({
	imports: [TypeOrmModule.forFeature([Block]), AuthModule, UserModule],
	controllers: [BlockController],
	providers: [BlockService,
		{
			provide: Loggary,
			useFactory: () => new Loggary('BlockModule', ['log', 'debug', 'warn', 'verbose'])
		}
	],
})
export class BlockModule {}
