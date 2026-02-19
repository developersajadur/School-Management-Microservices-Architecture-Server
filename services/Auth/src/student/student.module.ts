import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentCodeService } from './student-code.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [StudentController],
  providers: [StudentService, StudentCodeService],
  exports: [StudentService],
})
export class StudentModule {}
