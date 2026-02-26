import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeacherCodeService } from './teacher-code.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { AuthModule } from 'src/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherCodeService, RabbitMQService],
})
export class TeacherModule {}
