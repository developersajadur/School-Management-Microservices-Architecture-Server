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

  async onModuleInit() {
    try {
      const url = rabbitmq.url;

      this.conn = await amqp.connect(url);
      this.channel = await this.conn.createChannel();

      this.logger.log('RabbitMQ connected successfully');

      this.conn.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
      });

      this.conn.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });
    } catch (error) {
      this.logger.error('RabbitMQ connection failed', error);
      throw error;
    }
  }

  async publish(queue: string, msg: any) {
    await this.channel.assertQueue(queue, { durable: true });

    const sent = this.channel.sendToQueue(
      queue,
      Buffer.from(JSON.stringify(msg)),
      { persistent: true },
    );

    if (sent) {
      this.logger.log(`Message sent to queue: ${queue}`);
    } else {
      this.logger.warn(`Message NOT sent to queue: ${queue}`);
    }
  }

  async subscribe(queue: string, handler: (message: any) => Promise<void>) {
    await this.channel.assertQueue(queue, { durable: true });

    this.logger.log(`Listening to queue: ${queue}`);

    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());

        await handler(content);

        this.channel.ack(msg);

        this.logger.log(`Message processed from: ${queue}`);
      } catch (error) {
        this.logger.error(`Error processing message from: ${queue}`, error);

        this.channel.nack(msg, false, false);
      }
    });
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.conn?.close();
    this.logger.log('RabbitMQ connection closed');
  }
}
