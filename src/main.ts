import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ConfigService for accessing environment variables
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // Helmet for setting HTTP headers
  app.use(helmet());

  // CORS for allowing cross-origin requests
  app.enableCors({ credentials: true, methods: 'GET,POST,PATCH,DELETE' });

  // Swagger for API documentation
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
