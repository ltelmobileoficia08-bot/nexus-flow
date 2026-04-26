import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const staticDir = join(__dirname, '..', '..', '..', 'web', 'out');
  if (existsSync(staticDir)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        next();
        return;
      }
      const cleanPath = req.path.replace(/\/$/, '') || '/index';
      const htmlFile = join(staticDir, cleanPath + '.html');
      if (!htmlFile.startsWith(staticDir + '/')) {
        next();
        return;
      }
      if (existsSync(htmlFile)) {
        res.sendFile(htmlFile);
        return;
      }
      next();
    });
    expressApp.use(express.static(staticDir));
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`NexusFlow API running on http://localhost:${port}`);
}
void bootstrap();
