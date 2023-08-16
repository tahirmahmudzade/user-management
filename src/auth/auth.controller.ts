import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserDto } from 'src/common/dtos/user.dto';
import { RegisterDto } from 'src/common/dtos/register.dto';
import { LocalAuthGuard } from 'src/common/guards/localAuth.guard';
import { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { AuthGuard } from '@nestjs/passport';

@Serialize(UserDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body() body: RegisterDto,
    @Res() res: Response,
    @Session() session: any,
  ) {
    const data = await this.authService.signUp(body);

    session.userId = data.user.id;

    return res.status(HttpStatus.CREATED).json(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: any,
  ) {
    const data = await this.authService.login(req.user['id']);

    session.userId = data.user.id;

    return res.status(HttpStatus.OK).json(data);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  async logout(
    @CurrentUser() user: Partial<User>,
    @Req() req: Request,
    @Session() session: any,
  ) {
    req.headers.authorization = null;

    session.userId = null;

    return 'Logged out';
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  @Get('/google/login')
  async googleLogin() {
    return { message: 'Redirecting to google login page...' };
  }

  @UseGuards(AuthGuard('google'))
  @Get('/google/redirect')
  async googleRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: any,
  ) {
    console.log(req.user);
    const data = await this.authService.login(req.user['id']);
    session.userId = data.user.id;
    return res.status(HttpStatus.OK).json(data);
  }
}
