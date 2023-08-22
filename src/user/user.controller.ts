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
import { AdminGuard } from 'src/common/guards/admin.guard';
import { RegisterDto } from 'src/common/dtos/register.dto';
import { Prisma } from '@prisma/client';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@UseGuards(AdminGuard)
@Controller('users')
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
