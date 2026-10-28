import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { User } from '../../users/entities/user.entity';
import { OtpService } from './otp.service';
import { MailService } from './mail.service';
import { OtpType } from '../entities/otp.entity';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { VerifyResetOtpDto } from '../dto/verify-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, true);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      return null;
    }

    delete user.password;
    return user;
  }

  async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
    // 1. Create student account in unverified status
    const user = await this.usersService.create(registerDto);

    // 2. Generate and store 6-digit OTP
    const otpCode = await this.otpService.generateOtp(user.email);

    // 3. Dispatch OTP via Resend
    await this.mailService.sendVerificationOtp(user.email, otpCode, user.firstName);

    return {
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      email: user.email,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<AuthResponseDto> {
    const normalizedEmail = verifyOtpDto.email.toLowerCase().trim();

    // 1. Validate OTP code
    await this.otpService.verifyOtp(normalizedEmail, verifyOtpDto.code);

    // 2. Mark student account as verified
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      throw new BadRequestException('Student profile not found');
    }

    const verifiedUser = await this.usersService.verifyEmail(user.id);
    const token = this.generateToken(verifiedUser);

    return {
      accessToken: token,
      tokenType: 'Bearer',
      user: this.sanitizeUser(verifiedUser),
    };
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const normalizedEmail = resendOtpDto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new BadRequestException('No student account found with this email address');
    }

    if (user.isVerified) {
      throw new BadRequestException('Your account is already verified. You can log in directly.');
    }

    // Generate fresh OTP (automatically enforces 60s cooldown limit)
    const otpCode = await this.otpService.generateOtp(normalizedEmail);

    // Dispatch email
    await this.mailService.sendVerificationOtp(user.email, otpCode, user.firstName);

    return {
      message: 'A fresh 6-digit verification code has been sent to your email address.',
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Your student account is not verified yet. Please enter the verification code sent to your email or request a new code.',
      );
    }

    const token = this.generateToken(user);
    return {
      accessToken: token,
      tokenType: 'Bearer',
      user: this.sanitizeUser(user),
    };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    const code = await this.otpService.generateOtp(email, OtpType.PASSWORD_RESET);
    await this.mailService.sendPasswordResetOtp(email, code, user.firstName);
    return { message: 'A password reset code has been sent to your email address.' };
  }

  async resendPasswordResetOtp(dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.forgotPassword(dto);
  }

  async verifyPasswordResetOtp(dto: VerifyResetOtpDto): Promise<{ resetToken: string }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    await this.otpService.verifyOtp(email, dto.code, OtpType.PASSWORD_RESET);
    return {
      resetToken: this.jwtService.sign(
        { sub: user.id, email, purpose: 'PASSWORD_RESET' },
        { expiresIn: '10m' },
      ),
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    let payload: { sub: string; email: string; purpose: string };
    try {
      payload = this.jwtService.verify(dto.resetToken);
    } catch {
      throw new BadRequestException('The password reset session is invalid or expired');
    }

    if (payload.purpose !== 'PASSWORD_RESET') {
      throw new BadRequestException('The password reset session is invalid');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user || user.id !== payload.sub) {
      throw new BadRequestException('Account not found');
    }

    await this.usersService.updatePassword(user.id, dto.newPassword);
    await this.mailService.sendPasswordResetConfirmation(user.email, user.firstName);
    return { message: 'Your password was successfully reset.' };
  }

  async getMe(userId: string): Promise<Partial<User>> {
    const user = await this.usersService.findById(userId);
    return this.sanitizeUser(user);
  }

  private generateToken(user: User): string {
    const payload = {
      purpose: 'ACCESS',
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User): Partial<User> {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      matricNumber: user.matricNumber,
      department: user.department,
      level: user.level,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      coursesToTeach: user.coursesToTeach || [],
      coursesNeedingHelp: user.coursesNeedingHelp || [],
      rating: user.rating,
      reviewCount: user.reviewCount,
      totalSessionsGiven: user.totalSessionsGiven,
      totalSessionsAttended: user.totalSessionsAttended,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };
  }
}
