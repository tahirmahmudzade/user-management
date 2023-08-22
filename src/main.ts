import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.use(helmet({}));

  app.enableCors({ credentials: true, methods: 'GET,POST,PATCH,DELETE' });

  const options = new DocumentBuilder()
    .setTitle('User Management API')
    .setDescription('User Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.get<number>('PORT') || 8888);
}
bootstrap();
