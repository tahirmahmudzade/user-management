import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from 'src/common/types/jwtPayload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req?.get('authorization')?.split(' ')[1].trim();

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,

      refreshToken,
    };
  }
}
