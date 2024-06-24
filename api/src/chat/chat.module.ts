import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { Loggary } from 'src/logger/logger.service';

@Module({
  imports: [AuthModule],
  providers: [ChatGateway,
	{
		provide: Loggary,
		useFactory: () => new Loggary('ChannelModule', ['log', 'debug', 'warn', 'verbose'])
	}
],
  exports: [ChatGateway]
})
export class ChannelModule {}