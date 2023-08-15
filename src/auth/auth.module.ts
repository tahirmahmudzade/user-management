import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';
import { LocalAuthStrategy } from '../common/strategies/local-auth.strategy';
import { AccessTokenStrategy } from '../common/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from '../common/strategies/refreshToken.strategy';
import { GoogleAuthStrategy } from 'src/common/strategies/google-auth.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleAuthStrategy,
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
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
      .forRoutes(AuthController);
  }
}
