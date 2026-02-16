import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

@Controller({
  path: 'auth/users',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('/get-user')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.USER)
  // getUser(@Req() req) {
  //   return req.user;
  // }

  // @Get('/me')
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(Role.ADMIN, Role.USER)
  // getMe(@Req() req): Promise<SafeUser | null> {
  //   return req.user;
  // }

  // @Post('/create')
  // async createUser(@Req() req) {
  //   return this.userService.createUser(req.body);
  // }
}
