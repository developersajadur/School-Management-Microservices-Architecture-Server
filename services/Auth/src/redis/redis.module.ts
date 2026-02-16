import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // so you don’t need to import everywhere
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
