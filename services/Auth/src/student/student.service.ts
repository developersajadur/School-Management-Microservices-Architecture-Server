import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { hashPassword } from 'src/common/password/password.hash';
import { Role, StudentStatus } from '@prisma/client';
import { StudentCodeService } from './student-code.service';

@Injectable()
export class StudentService {
  constructor(
    private prisma: PrismaService,
    private studentCodeService: StudentCodeService,
  ) {}

  async createStudent(dto: CreateStudentDto) {
    return await this.prisma.$transaction(async (tx) => {
      //  Check email uniqueness manually (optional but better error control)
      const existingUser = await tx.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
      const hashedPassword = await hashPassword(dto.password);

      // Create user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          password: hashedPassword,
          role: Role.STUDENT,
        },
      });
      const studentCode = await this.studentCodeService.generateStudentCode(tx);
      // Create student profile
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode: studentCode,
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          dateOfBirth: new Date(dto.dateOfBirth),
          admissionDate: new Date(dto.admissionDate),
          address: dto.address,
          status: dto.status ?? StudentStatus.ACTIVE,
        },
      });

      return {
        message: 'Student created successfully',
        data: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          email: user.email,
          studentCode: student.studentCode,
        },
      };
    });
  }
}
