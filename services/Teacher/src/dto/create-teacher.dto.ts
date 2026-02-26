import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  MaxLength,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateTeacherDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  joiningDate: string;

  @IsOptional()
  @IsString()
  qualification?: string;

  @IsOptional()
  experience?: number;

  @IsOptional()
  @IsString()
  address?: string;
}
