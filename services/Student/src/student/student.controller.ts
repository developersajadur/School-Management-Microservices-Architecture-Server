import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { Role } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';
import { CreateStudentDto } from 'src/dto/create-student.dto';

@Controller({
  path: 'students',
  version: '1',
})
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('create')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createStudent(@Body() dto: CreateStudentDto) {
    return this.studentService.createStudent(dto);
  }
}
