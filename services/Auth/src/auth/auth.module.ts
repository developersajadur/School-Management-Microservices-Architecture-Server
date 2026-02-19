import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from './roles.guard';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';
import { jwt } from 'src/config';
import { StringValue } from 'ms';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwt.accessSecret,
      signOptions: {
        expiresIn: jwt.accessExpiresIn as StringValue,
      },
    }),

    forwardRef(() => UserModule),
    RedisModule,
  ],

  controllers: [AuthController],

  providers: [AuthService, AuthGuard, RolesGuard],

  exports: [JwtModule, AuthGuard, RolesGuard],
})
export class AuthModule {}
