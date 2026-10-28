import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
  ArrayMaxSize,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STUDENT_ROLES, UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'student@university.edu' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ss123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Ada' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Lovelace' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ enum: ['Male', 'Female'] })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'SCI/2023/1042' })
  @IsOptional()
  @IsString()
  matricNumber?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '300' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ enum: STUDENT_ROLES, default: UserRole.BOTH })
  @IsOptional()
  @IsIn(STUDENT_ROLES)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Passionate about algorithms and calculus peer tutoring.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: ['CSC201', 'MTH101'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  coursesToTeach?: string[];

  @ApiPropertyOptional({ example: ['PHY102', 'CHM101'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  coursesNeedingHelp?: string[];

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
