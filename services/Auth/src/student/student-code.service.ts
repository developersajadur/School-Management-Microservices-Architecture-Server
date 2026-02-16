/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StudentCodeService {
  constructor(private prisma: PrismaService) {}

  async generateStudentCode(tx: any): Promise<string> {
    const currentYear = new Date().getFullYear();

    let counter = await tx.studentCounter.findUnique({
      where: { id: 1 },
    });

    if (!counter || counter.year !== currentYear) {
      counter = await tx.studentCounter.upsert({
        where: { id: 1 },
        update: {
          year: currentYear,
          sequence: 1,
        },
        create: {
          id: 1,
          year: currentYear,
          sequence: 1,
        },
      });
    } else {
      counter = await tx.studentCounter.update({
        where: { id: 1 },
        data: {
          sequence: {
            increment: 1,
          },
        },
      });
    }

    const padded = String(counter.sequence).padStart(4, '0');

    return `STU-${currentYear}-${padded}`;
  }
}
