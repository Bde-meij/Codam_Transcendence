import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');

	app.enableCors({
		origin: ["http://localhost:4200"],
		credentials: true,
	})

	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe());
	
	await app.listen(3000);
}
bootstrap();
