import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentStatus } from '@prisma/client';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { StudentCodeService } from './student-code.service';
import { CreateStudentDto } from 'src/dto/create-student.dto';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private studentCodeService: StudentCodeService,
    private rabbitmq: RabbitMQService,
  ) {}

  async createStudent(dto: CreateStudentDto) {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.student.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new BadRequestException('Email already exists');
      }

      const studentCode = await this.studentCodeService.generateStudentCode(tx);

      const student = await tx.student.create({
        data: {
          studentCode,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          dateOfBirth: new Date(dto.dateOfBirth),
          admissionDate: new Date(dto.admissionDate),
          address: dto.address,
          status: dto.status ?? StudentStatus.ACTIVE,
          email: dto.email,
          phone: dto.phone,
        },
      });

      // Publish event for Auth service
      await this.rabbitmq.publish('user.create', {
        type: 'student',
        studentId: student.id,
        email: dto.email,
        phone: dto.phone,
        password: dto.password,
        role: 'STUDENT',
      });

      return {
        message: 'Student created (waiting for user creation)',
        data: {
          id: student.id,
          studentCode: student.studentCode,
          email: student.email,
        },
      };
    });
  }
}
