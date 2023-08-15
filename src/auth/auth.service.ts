import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { JwtPayload } from 'src/common/types/jwtPayload.type';
import { Tokens } from 'src/common/types/tokens.type';
import { TokensUser } from 'src/common/types/tokensUser.type';
import { UserService } from 'src/user/user.service';
import {
  generatePassword,
  passwordHash,
} from 'src/common/utils/generatePassword';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async signUp(data: Prisma.UserCreateInput): Promise<TokensUser> {
    const isUser = await this.userService.findUserWithUnique({
      email: data.email,
    });

    if (isUser)
      throw new BadRequestException('User already exists, please log in');

    if (data.role === 'ADMIN')
      throw new BadRequestException('You can not create admin');

    const hashedPassword = await generatePassword(data.password);

    data.password = hashedPassword;

    const user = await this.userService.createUser(data);

    const tokens: Tokens = await this.signTokens(user);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findUserWithUnique({ email });

    if (!user) throw new ForbiddenException('Incorrect email or password');

    const [salt, storedHash] = user.password.split('.');
    const hash = await passwordHash(password, salt);

    if (storedHash !== hash.toString('hex'))
      throw new ForbiddenException('Incorrect email or password');

    return user;
  }

  async login(userId: number): Promise<TokensUser> {
    const user: User = await this.userService.findUserWithUnique({
      id: userId,
    });
    const tokens: Tokens = await this.signTokens(user);
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      ...tokens,
    };
  }

  async logout(userId: number) {
    const user = await this.prisma.user.updateMany({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: {
        hashedRefreshToken: null,
      },
    });

    return user;
  }

  async signTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.firstName,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
