import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherCodeService } from './teacher-code.service';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private teacherCodeService: TeacherCodeService,
  ) {}

  async create(dto: CreateTeacherDto) {
    return this.prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const teacherCode = await this.teacherCodeService.generate(tx);

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          phone: dto.phone,
          role: 'TEACHER',
          status: 'ACTIVE',
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          teacherCode,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          joiningDate: new Date(dto.joiningDate),
          qualification: dto.qualification,
          experience: dto.experience,
          address: dto.address,
        },
      });

      return {
        message: 'Teacher created successfully',
        teacher,
      };
    });
  }
}
