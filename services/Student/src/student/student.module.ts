import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentCodeService } from './student-code.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth.module';
import { StudentUserListener } from './student-user.listener';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [PrismaModule, AuthModule, RabbitMQModule],
  controllers: [StudentController],
  providers: [StudentService, StudentCodeService, StudentUserListener],
  exports: [StudentService],
})
export class StudentModule {}
