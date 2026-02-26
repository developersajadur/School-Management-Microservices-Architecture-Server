/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { rabbitmq } from 'src/config';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  private conn: amqp.Connection;
  private channel: amqp.Channel;

  private isReady = false;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.conn = await amqp.connect(rabbitmq.url);
      this.channel = await this.conn.createChannel();

      this.isReady = true;

      this.logger.log('✅ RabbitMQ connected');
    } catch (error) {
      this.logger.error('❌ RabbitMQ connection failed', error);
      throw error;
    }
  }

  private async ensureConnection() {
    if (!this.isReady) {
      await this.connect();
    }
  }

  async publish(queue: string, msg: any) {
    await this.ensureConnection();

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      persistent: true,
    });
  }

  async subscribe(queue: string, handler: (message: any) => Promise<void>) {
    await this.ensureConnection();

    await this.channel.assertQueue(queue, { durable: true });

    this.logger.log(`👂 Listening to queue: ${queue}`);

    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());

        await handler(content);

        this.channel.ack(msg);
      } catch (error) {
        this.logger.error('Message processing failed', error);
        this.channel.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.conn?.close();
  }
}
