import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Endpoints:`);
  console.log(`   POST http://localhost:${port}/users/register`);
  console.log(`   POST http://localhost:${port}/users/login`);
  console.log(`   GET  http://localhost:${port}/users`);
  console.log(`   GET  http://localhost:${port}/users/:id`);
}
bootstrap();
