import { Module } from '@nestjs/common';
import { Loggary } from './logger.service';

@Module({
  providers: [Loggary],
  exports: [Loggary],
})
export class LoggerModule {}