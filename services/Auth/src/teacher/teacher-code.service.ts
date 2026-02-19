/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeacherCodeService {
  constructor(private prisma: PrismaService) {}

  async generate(tx: any): Promise<string> {
    const year = new Date().getFullYear();

    const last = await tx.teacher.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let sequence = 1;

    if (last) {
      const lastNumber = Number(last.teacherCode.split('-').pop());
      sequence = lastNumber + 1;
    }

    const padded = String(sequence).padStart(4, '0');

    return `TCH-${year}-${padded}`;
  }
}
