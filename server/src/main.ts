import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { buildCorsOriginMatcher } from './common/utils/cors.util';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const clientOrigin = configService.get<string>('clientOrigin');
  app.enableCors({
    origin: buildCorsOriginMatcher(clientOrigin),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalFilters(new DomainExceptionFilter());
  
  const uploadDir = configService.get<string>('media.localDir', 'uploads');
  app.use(
    '/uploads',
    express.static(join(process.cwd(), uploadDir), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('5SS STARPRINT API')
    .setDescription('API for 5SS Starprint feature')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
