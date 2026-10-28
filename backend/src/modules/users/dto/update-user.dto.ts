import { IsString, IsOptional, IsIn, ArrayMaxSize, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { STUDENT_ROLES, UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ada' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Lovelace' })
  @IsOptional()
  @IsString()
  lastName?: string;

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

  @ApiPropertyOptional({ example: '400' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ enum: STUDENT_ROLES })
  @IsOptional()
  @IsIn(STUDENT_ROLES)
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Passionate about algorithms and calculus peer tutoring.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: ['CSC201', 'CSC301'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  coursesToTeach?: string[];

  @ApiPropertyOptional({ example: ['PHY102'], type: [String] })
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
