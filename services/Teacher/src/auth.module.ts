import { StringValue } from 'ms';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { jwt } from './config';

@Module({
  imports: [
    JwtModule.register({
      secret: jwt.accessSecret,
      signOptions: { expiresIn: jwt.accessExpiresIn as StringValue },
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
