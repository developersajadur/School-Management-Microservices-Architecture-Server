import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TeacherCodeService } from './teacher-code.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherCodeService],
})
export class TeacherModule {}
