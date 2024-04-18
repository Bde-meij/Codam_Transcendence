import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { User } from '../user/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { FortyTwoStrategy } from './strategy/strategy';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './serializer/session.serializer';

@Module({
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, {provide: 'AUTH_SERVICE', useClass: AuthService}, SessionSerializer],
  imports: [PassportModule.register({session: true}),
            TypeOrmModule.forFeature([User]),
            ConfigModule.forRoot({isGlobal: true, envFilePath: '.env',})],
})
export class AuthModule {}
