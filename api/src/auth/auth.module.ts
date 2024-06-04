import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SessionSerializer } from './serializer/session.serializer';
import { Repository } from 'typeorm';
import { FortyTwoStrategy } from './guard/fortytwo.stratergy';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
	controllers: [AuthController],
	providers: [
		AuthService, {provide: 'AUTH_SERVICE', useClass: AuthService},
		SessionSerializer,
		Repository,
		FortyTwoStrategy,
		UserService
	],
	imports: [
		PassportModule.register({defaultStratergy: 'fortytwo'}),
		TypeOrmModule.forFeature([User]),
		ConfigModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return {
					global: true,
				}
			}
		})
	],
	exports: [AuthService],
})
export class AuthModule {}
