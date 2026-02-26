/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class StudentUserListener implements OnModuleInit {
  private readonly logger = new Logger(StudentUserListener.name);

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.subscribe('user.created', async (message: any) => {
      console.log('Received message:', message);

      const { userId, studentId } = message;

      const result = await this.prisma.student.updateMany({
        where: { id: studentId },
        data: { userId },
      });

      console.log('Update result:', result);
    });

    this.logger.log('👂 Listening to user.created queue');
  }

  private async attachUserToStudent(studentId: string, userId: string) {
    await this.prisma.student.updateMany({
      where: {
        id: studentId,
        userId: null, // 🔥 idempotent
      },
      data: { userId },
    });

    this.logger.log(`✅ Attached user ${userId} to student ${studentId}`);
  }
}
