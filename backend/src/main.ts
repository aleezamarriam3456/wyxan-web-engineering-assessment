
/*
 * File: main.ts
 *
 * Purpose:
 * Entry point of the NestJS backend application.
 *
 * Responsibilities:
 * - Initialize the NestJS application.
 * - Configure CORS for the Next.js frontend.
 * - Enable request validation.
 * - Start the API server on port 3001.
 */

import { setServers } from 'node:dns';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  // Configure DNS resolvers for the MongoDB connection.
  setServers(['1.1.1.1', '8.8.8.8']);

  const app = await NestFactory.create(AppModule);

  // Allow requests from the local Next.js frontend.
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  });

  // Validate incoming API request bodies.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Start the backend API.
  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
