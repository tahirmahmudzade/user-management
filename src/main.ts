import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  console.log(config.get<string>('GCP_CALLBACK_URL'));
  console.log(config.get<string>('GCP_CLIENT_ID'));
  console.log(config.get<string>('GCP_CLIENT_SECRET'));
  await app.listen(config.get<number>('PORT'));
}
bootstrap();
