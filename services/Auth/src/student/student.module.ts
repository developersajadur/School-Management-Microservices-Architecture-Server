import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { StudentCodeService } from './student-code.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [forwardRef(() => AuthModule), UserModule],
  controllers: [StudentController],
  providers: [StudentService, StudentCodeService],
  exports: [StudentService],
})
export class StudentModule {}
