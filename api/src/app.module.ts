import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres', 
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'app',
      entities: [User],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    GameModule,
  ],
  controllers: [],
  providers: [ChatGateway],
})
export class AppModule {}
