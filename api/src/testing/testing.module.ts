import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { UserModule } from 'src/user/user.module';

@Module({
	controllers: [TestingController],
	providers: [],
	imports: [UserModule]
})
export class TestingModule {}
