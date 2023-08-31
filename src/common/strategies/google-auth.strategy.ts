import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import * as password from 'generate-password';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GCP_CLIENT_ID'),
      clientSecret: configService.get<string>('GCP_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GCP_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const isUser: User = await this.userService.findUserWithUnique({
      email: profile.emails[0].value,
    });

    if (isUser) {
      return isUser;
    }

    const user = await this.authService.signUp({
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      imageUrl: profile.photos[0].value,
      password: password.generate({
        length: 15,
        numbers: true,
        symbols: true,
        uppercase: true,
      }),
    });

    return user;
  }
}
