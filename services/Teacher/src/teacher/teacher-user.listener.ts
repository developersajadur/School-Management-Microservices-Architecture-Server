/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class TeacherUserListener implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.subscribe('user.created', async (message: any) => {
      if (message.type !== 'teacher') return;

      const { userId, teacherId } = message;

      await this.attachUserToTeacher(teacherId, userId);
    });
  }

  private async attachUserToTeacher(teacherId: string, userId: string) {
    await this.prisma.teacher.update({
      where: { id: teacherId },
      data: { userId },
    });
  }
}
