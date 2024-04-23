import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    session({
      secret: require('crypto').randomBytes(64).toString('hex'),
      resave: false,
      saveUninitialized: false,
    })
  )
  await app.listen(3000);
}
bootstrap();
