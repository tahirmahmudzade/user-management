import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import * as Joi from 'joi';
import { APP_PIPE } from '@nestjs/core';
import { FilesModule } from './files/files.module';
import { CurrentUserMiddleware } from './common/middlewares/current-user.middleware';
import cookieSession from 'cookie-session';
// eslint-disable-next-line @typescript-eslint/no-var-requires

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(8888),
      }),
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        stopAtFirstError: true,
      }),
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          name: 'session',
          keys: [this.configService.get('SESSION_KEY')],
          maxAge: 24 * 60 * 60 * 1000,
          httpOnly: true,
        }),
      )
      .forRoutes('*');

    consumer
      .apply(CurrentUserMiddleware)
      .exclude(
        { path: 'auth/signup', method: RequestMethod.POST },
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/google/login',
          method: RequestMethod.GET,
        },
        {
          path: 'auth/google/redirect',
          method: RequestMethod.GET,
        },
      )
      .forRoutes('*');
  }
}
