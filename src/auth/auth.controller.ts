import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
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
import { ResetPasswordDto } from 'src/common/dtos/resetPassword.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from 'src/common/guards/google.guard';

@ApiTags('Authentication')
@Serialize(UserDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    description: 'Create a new user',
    type: RegisterDto,
    required: true,
  })
  @ApiCreatedResponse({
    status: 201,
    description: 'User created',
  })
  @Post('/signup')
  async signUp(@Body() body: RegisterDto, @Res() res: Response) {
    const data = await this.authService.signUp(body);
    return res.status(HttpStatus.CREATED).json(data);
  }

  @ApiOkResponse({
    status: 200,
    description: 'User logged in',
  })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.login(req.user['id']);
    return res.status(HttpStatus.OK).json(data);
  }

  @ApiBearerAuth('Access Token')
  @ApiNoContentResponse({
    status: 204,
    description: 'User logged out',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('/logout')
  async logout(@Req() req: Request) {
    req.headers.authorization = null;
    return 'Logged out';
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  async googleLogin() {
    return { message: 'Redirecting to google login page...' };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/redirect')
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    const data = await this.authService.login(req.user['id']);

    return res.status(HttpStatus.OK).json(data);
  }

  @ApiBearerAuth('Access Token')
  @ApiBody({
    description: 'Reset password',
    type: ResetPasswordDto,
    required: true,
  })
  @ApiOkResponse({
    status: 200,
    description: 'Password reset',
  })
  @UseGuards(AccessTokenGuard)
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @CurrentUser() user: Partial<User>,
    @Body() body: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const result = await this.authService.resetPassword(user.id, body);

    req.headers.authorization = null;

    return result;
  }

  @ApiOkResponse({
    description: 'User profile',
    status: 200,
  })
  @UseGuards(AccessTokenGuard)
  @Get('/my-profile')
  @HttpCode(HttpStatus.OK)
  async myProfile(@CurrentUser() user: Partial<User>) {
    const a = 'b';
    return user;
  }
}
