import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './auth/entities/auth.entity';
import { GameModule } from './game/game.module';

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
      entities: [Auth],
      synchronize: true,
      logging: true,
    }),
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
