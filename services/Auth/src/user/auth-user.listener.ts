/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RabbitMQService } from 'src/rabbitmq/consumer.service';

@Injectable()
export class AuthUserListener implements OnModuleInit {
  private readonly logger = new Logger(AuthUserListener.name);

  constructor(
    private prisma: PrismaService,
    private rabbitmq: RabbitMQService,
  ) {}

  async onModuleInit() {
    await this.rabbitmq.subscribe('user.create', async (message: any) => {
      if (message.type !== 'student' && message.type !== 'teacher') {
        return;
      }

      await this.handleUserCreation(message);
    });

    this.logger.log('👂 Listening to user.create queue');
  }

  private async handleUserCreation(payload: any) {
    const { email, phone, password, role, studentId, teacherId } = payload;

    // 🔒 idempotency check
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      this.logger.warn(`User already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        role,
      },
    });

    this.logger.log(`✅ User created: ${email}`);

    // 🔔 publish user.created event
    await this.rabbitmq.publish('user.created', {
      type: payload.type,
      userId: user.id,
      studentId: studentId ?? null,
      teacherId: teacherId ?? null,
    });
  }
}
