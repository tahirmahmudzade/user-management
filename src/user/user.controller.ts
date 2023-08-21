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

@UseGuards(AdminGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async findAllUsers() {
    const users = await this.userService.findAllUsers();

    return users;
  }

  @Get('/:id')
  async findUserById(@Param('id') id: string) {
    const user = await this.userService.findUserWithUnique({
      id: parseInt(id),
    });

    return user;
  }

  @Post('/createUser')
  async createUser(@Body() body: RegisterDto) {
    const user = await this.userService.createUser(body);

    return user;
  }

  @Patch('/updateUser/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Prisma.UserUpdateInput,
  ) {
    const user = await this.userService.updateUser(parseInt(id), body);

    return user;
  }

  @Delete('/deleteUser/:id')
  async deleteUser(@Param('id') id: string) {
    const result = await this.userService.deleteUser(parseInt(id));

    return result;
  }
}
