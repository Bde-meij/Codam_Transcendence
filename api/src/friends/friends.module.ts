import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { JwtService } from '@nestjs/jwt';
import { Friend } from './entities/friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([Friend]), AuthModule, UserModule],
	controllers: [FriendsController],
	providers: [FriendsService, JwtService],
})
export class FriendsModule {}
