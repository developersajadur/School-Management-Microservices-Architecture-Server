/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtUserPayload } from 'src/user/user.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Unauthorized, token is missing');
    }

    try {
      const payload = this.jwtService.verify(token as string) as JwtUserPayload;

      const time = Math.floor(Date.now() / 1000);
      if (payload.exp < time) {
        throw new UnauthorizedException('Token has expired');
      }

      const isExistUser = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!isExistUser) {
        throw new NotFoundException('User not found');
      } else if (isExistUser.status === UserStatus.BLOCKED) {
        throw new UnauthorizedException('User is blocked');
      } else if (isExistUser.status === UserStatus.DELETED) {
        throw new NotFoundException('User not found');
      }
      (req as any).user = isExistUser;
      return true;
    } catch (error: any) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
