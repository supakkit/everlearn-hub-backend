import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: [FRONTEND_URL],
    credentials: true,
  });

  const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || '';
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.use(`${GLOBAL_PREFIX}/stripe/webhook`, bodyParser.raw({ type: '*/*' }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('EverLearn Hub')
    .setDescription('The EverLearn Hub API')
    .setVersion('0.1')
    .addCookieAuth('accessToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
