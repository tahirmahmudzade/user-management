import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { JwtPayload } from 'src/common/types/jwtPayload.type';
import { Token } from 'src/common/types/tokens.type';
import { TokensUser } from 'src/common/types/tokensUser.type';
import { UserService } from 'src/user/user.service';
import {
  generatePassword,
  passwordHash,
} from 'src/common/utils/generatePassword';
import { ResetPasswordDto } from 'src/common/dtos/resetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(data: Prisma.UserCreateInput): Promise<TokensUser> {
    const isUser = await this.userService.findUserWithUnique({
      email: data.email,
    });
    console.log(data);
    if (isUser)
      throw new BadRequestException('User already exists, please log in');

    if (data.role === 'ADMIN')
      throw new BadRequestException('You can not create admin');

    const hashedPassword = await generatePassword(data.password);

    data.password = hashedPassword;

    const user = await this.userService.createUser(data);

    const token: Token = await this.signToken(user);

    return {
      user,
      ...token,
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
    const token: Token = await this.signToken(user);

    return {
      user,
      ...token,
    };
  }

  async resetPassword(id: number, body: ResetPasswordDto) {
    const { currentPassword, newPassword } = body;

    const user = await this.userService.findUserWithUnique({ id });

    const [salt, storedHash] = user.password.split('.');
    const hash = await passwordHash(currentPassword, salt);

    if (storedHash !== hash.toString('hex'))
      throw new ForbiddenException('Incorrect password');

    const newPasswordHash = await generatePassword(newPassword);

    await this.userService.updateUser(id, {
      password: newPasswordHash,
    });

    return 'Password has been changed, please log in again';
  }

  async signToken(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.firstName,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRES'),
    });

    return {
      accessToken,
    };
  }

  // async logout(userId: number) {
  //   const user = await this.prisma.user.updateMany({
  //     where: { id: userId, hashedRefreshToken: { not: null } },
  //     data: {
  //       hashedRefreshToken: null,
  //     },
  //   });

  //   return user;
  // }
}
