import { Global, Module } from '@nestjs/common';
import { RabbitMQService } from './consumer.service';

@Global()
@Module({
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
