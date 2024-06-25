import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { Loggary } from './logger/logger.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: false
	});
	const loggary = new Loggary('AppModule');
	app.useLogger(loggary);
	app.setGlobalPrefix('api');

	app.enableCors({
		origin: ["http://localhost:4200"],
		credentials: true,
	})

	app.use(cookieParser());

	await app.listen(3000);
}
bootstrap();
