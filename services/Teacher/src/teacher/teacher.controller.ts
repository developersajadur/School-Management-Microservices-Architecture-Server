import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/guards/roles.decorator';
import { CreateTeacherDto } from 'src/dto/create-teacher.dto';

@Controller({
  path: 'teachers',
  version: '1',
})
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post('create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.create(dto);
  }
}
