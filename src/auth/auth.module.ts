import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthStrategy } from '../common/strategies/local-auth.strategy';
import { AccessTokenStrategy } from '../common/strategies/accessToken.strategy';
import { GoogleAuthStrategy } from '../common/strategies/google-auth.strategy';

@Module({
  imports: [UserModule, PassportModule, JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthStrategy,
    AccessTokenStrategy,
    GoogleAuthStrategy,
  ],
})
export class AuthModule {}
