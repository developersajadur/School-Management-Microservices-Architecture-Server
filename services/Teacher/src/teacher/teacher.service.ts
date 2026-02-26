import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTeacherDto } from 'src/dto/create-teacher.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { TeacherCodeService } from './teacher-code.service';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private teacherCodeService: TeacherCodeService,
    private rabbitmq: RabbitMQService,
  ) {}

  async create(dto: CreateTeacherDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.teacher.findFirst({
        where: { phone: dto.phone },
      });

      if (existing) {
        throw new BadRequestException('Teacher already exists');
      }

      const teacherCode = await this.teacherCodeService.generate(tx);

      const teacher = await tx.teacher.create({
        data: {
          teacherCode,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          joiningDate: new Date(dto.joiningDate),
          qualification: dto.qualification,
          experience: dto.experience,
          address: dto.address,
          phone: dto.phone,
        },
      });

      await this.rabbitmq.publish('user.create', {
        type: 'teacher',
        teacherId: teacher.id,
        email: dto.email,
        phone: dto.phone,
        password: dto.password,
        role: 'TEACHER',
      });

      return {
        message: 'Teacher created (waiting for user creation)',
        data: {
          id: teacher.id,
          teacherCode: teacher.teacherCode,
          name: `${teacher.firstName} ${teacher.lastName}`,
        },
      };
    });
  }
}
