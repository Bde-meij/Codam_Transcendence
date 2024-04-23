import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './serializer/session.serializer';
import { Repository } from 'typeorm';

@Module({
  controllers: [AuthController],
  providers: [AuthService, {provide: 'AUTH_SERVICE', useClass: AuthService}, SessionSerializer, Repository],
  imports: [PassportModule.register({session: true}),
            TypeOrmModule.forFeature([User]),
            ConfigModule.forRoot({isGlobal: true, envFilePath: '.env',})],
})
export class AuthModule {}
