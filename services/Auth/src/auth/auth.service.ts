/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User, UserStatus } from '@prisma/client';
import { comparePasswords } from 'src/common/password/password.hash';
import { UserService } from 'src/user/user.service';
import { jwt } from 'src/config';
import { RedisService } from 'src/redis/redis.service';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';
import { admin as adminConfig, bcryptSaltRounds } from 'src/config/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account not active');
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    // Access Token
    const accessToken = this.jwtService.sign(payload, {
      secret: jwt.accessSecret,
      expiresIn: jwt.accessExpiresIn as StringValue,
    });

    // Refresh Token
    const refreshToken = this.jwtService.sign(
      { userId: user.id },
      {
        secret: jwt.refreshSecret,
        expiresIn: jwt.refreshExpiresIn as StringValue,
      },
    );

    //  Hash refresh token before storing
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    // Store in Redis with TTL
    await this.redisService.set(
      `refresh_token:${user.id}`,
      hashedRefreshToken,
      7 * 24 * 60 * 60, // seconds (7 days)
    );

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldRefreshToken: string) {
    try {
      const decoded = this.jwtService.verify(oldRefreshToken, {
        secret: jwt.refreshSecret,
      });

      const userId = decoded.userId;

      const storedToken = await this.redisService.get(
        `refresh_token:${userId}`,
      );

      if (!storedToken) {
        throw new UnauthorizedException('Session expired');
      }

      const isMatch = await bcrypt.compare(oldRefreshToken, storedToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ROTATION — delete old
      await this.redisService.del(`refresh_token:${userId}`);

      // Generate new tokens
      const newAccessToken = this.jwtService.sign(
        { userId },
        {
          secret: jwt.accessSecret,
          expiresIn: jwt.accessExpiresIn as StringValue,
        },
      );

      const newRefreshToken = this.jwtService.sign(
        { userId },
        {
          secret: jwt.refreshSecret,
          expiresIn: jwt.refreshExpiresIn as StringValue,
        },
      );

      const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);

      await this.redisService.set(
        `refresh_token:${userId}`,
        hashedNewRefreshToken,
        7 * 24 * 60 * 60,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(id: string) {
    console.log(id);
    await this.redisService.del(`refresh_token:${id}`);
    return { message: 'Logged out successfully' };
  }

  // Utility method to seed admin from environment variables
  async seedAdminFromEnv() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seeding not allowed in production');
    }

    const adminEmail = adminConfig.email;
    const adminPassword = adminConfig.password;
    const saltRounds = bcryptSaltRounds;

    if (!adminEmail || !adminPassword) {
      throw new BadRequestException('Admin env variables missing');
    }

    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      return { message: 'Admin already exists' };
    }

    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const admin = await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    return {
      message: 'Admin seeded successfully',
      adminId: admin.id,
    };
  }
}
