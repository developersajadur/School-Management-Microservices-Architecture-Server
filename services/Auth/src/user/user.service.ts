/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SafeUser } from './user.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { hashPassword } from 'src/common/password/password.hash';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(user: any): Promise<SafeUser | any> {
    const hashedPassword = await hashPassword(user.password as string);
    return this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  async getAllUsers(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserDataById(userId: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    } else if (user?.isBlocked) {
      throw new ForbiddenException('User is blocked');
    }
    return user;
  }

  async getUserByEmailForLogin(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isBlocked: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    } else if (user?.isBlocked) {
      throw new ForbiddenException('User is blocked');
    }
    return user;
  }

  async blockUser(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id: userId, isDeleted: false },
      data: { isBlocked: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async unblockUser(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false, isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<null> {
    await this.prisma.user.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
      },
    });
    return null;
  }
}
