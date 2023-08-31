import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from 'src/common/dtos/register.dto';
import { Prisma, Role } from '@prisma/client';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({
    status: 200,
    description: 'All users',
    isArray: true,
  })
  @Get('/')
  async findAllUsers() {
    const users = await this.userService.findAllUsers();

    return users;
  }

  @ApiResponse({
    status: 200,
    description: 'User found',
  })
  @Get('/:id')
  async findUserById(@Param('id') id: string) {
    const user = await this.userService.findUserWithUnique({
      id: parseInt(id),
    });

    return user;
  }

  @ApiResponse({
    status: 201,
    description: 'User created',
  })
  @ApiBody({
    description: 'Create a new user',
    type: RegisterDto,
    required: true,
  })
  @Post('/createUser')
  async createUser(@Body() body: RegisterDto) {
    const user = await this.userService.createUser(body);

    return user;
  }

  @ApiResponse({
    status: 200,
    description: 'User updated',
  })
  @Patch('/updateUser/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Prisma.UserUpdateInput,
  ) {
    const user = await this.userService.updateUser(parseInt(id), body);

    return user;
  }

  @ApiResponse({
    status: 200,
    description: 'User deleted',
  })
  @Delete('/deleteUser/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(parseInt(id));

    return result;
  }
}
