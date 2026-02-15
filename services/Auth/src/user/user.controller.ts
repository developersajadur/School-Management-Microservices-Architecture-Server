/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SafeUser } from './user.type';
import { UserService } from './user.service';
import { Role } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/get-user')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  getUser(@Req() req) {
    return req.user;
  }

  @Get('/me')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  getMe(@Req() req): Promise<SafeUser | null> {
    return req.user;
  }

  @Post('/create')
  async createUser(@Req() req) {
    return this.userService.createUser(req.body);
  }

  @Get('/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers(): Promise<SafeUser[]> {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async getUserById(@Req() req): Promise<SafeUser | null> {
    const userId = req.params.id as string;
    return this.userService.getUserDataById(userId);
  }

  @Post('/block/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async blockUser(@Req() req): Promise<SafeUser | null> {
    const userId = req.params.id as string;
    return this.userService.blockUser(userId);
  }

  @Post('/unblock/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async unblockUser(@Req() req): Promise<SafeUser | null> {
    const userId = req.params.id as string;
    return this.userService.unblockUser(userId);
  }

  @Delete('/delete/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Req() req): Promise<null> {
    const userId = req.params.id as string;
    return this.userService.deleteUser(userId);
  }
}
