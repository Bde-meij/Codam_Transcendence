import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { BossGameGateway } from './BossGame.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [AuthModule, UserModule],
	controllers: [],
	providers: [BossGameGateway],
})

export class BossGameModule {}
