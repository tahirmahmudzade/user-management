import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    const user = await this.prisma.user.create({ data });

    return user;
  }

  async findUserWithUnique(field: Prisma.UserWhereUniqueInput) {
    if (field.id || field.email) {
      const user = await this.prisma.user.findUnique({ where: field });
      console.log(user.passport);
      return user;
    }
    return null;
  }

  async findAllUsers() {
    const users = await this.prisma.user.findMany();

    return users;
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput) {
    const user = await this.prisma.user.update({ where: { id }, data });

    return user;
  }

  async deleteUser(id: number) {
    await this.prisma.user.delete({ where: { id } });

    return 'User deleted successfully';
  }
}
