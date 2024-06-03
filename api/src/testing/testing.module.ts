import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [TestingController],
	providers: [TestingService],
	imports: [UserModule]
})
export class TestingModule {}
