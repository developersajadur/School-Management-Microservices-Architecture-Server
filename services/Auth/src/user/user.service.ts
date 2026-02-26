/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { hashPassword } from 'src/common/password/password.hash';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  rabbitmq: any;
  constructor(private prisma: PrismaService) {}
  async createUser(payload: any) {
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        phone: payload.phone,
        password: await hashPassword(payload.password),
        role: payload.role,
      },
    });

    await this.rabbitmq.publish('user.created', {
      userId: user.id,
      type: payload.type,
      teacherId: payload.teacherId ?? null,
      studentId: payload.studentId ?? null,
    });

    return user;
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}
