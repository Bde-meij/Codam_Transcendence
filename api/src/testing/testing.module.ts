import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UserModule } from 'src/user/user.module';
import { Loggary } from 'src/logger/logger.service';

@Module({
	controllers: [TestingController],
	providers: [TestingService,
		{
			provide: Loggary,
			useFactory: () => new Loggary('TestingModule', ['log', 'debug', 'warn', 'verbose'])
		}
	],
	imports: [UserModule]
})
export class TestingModule {}
