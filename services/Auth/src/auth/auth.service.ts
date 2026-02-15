/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { comparePasswords } from 'src/common/password/password.hash';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly wtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  async login(email: string, password: string): Promise<any> {
    const user = (await this.userService.getUserByEmailForLogin(email)) as User;
    if (!user) {
      throw new UnauthorizedException('User not found');
    } else if (user.isBlocked) {
      throw new UnauthorizedException('User is blocked');
    } else if (user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.wtService.sign(payload);
    const { password: __, ...safeUser } = user;

    return {
      message: 'Login successful',
      token,
      user: safeUser,
    };
  }
}
