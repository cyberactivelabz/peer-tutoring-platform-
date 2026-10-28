import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from '../repositories/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { STUDENT_ROLES, User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if (createUserDto.role !== undefined && !STUDENT_ROLES.includes(createUserDto.role)) {
      throw new ForbiddenException(
        'Administrator roles cannot be assigned through student account forms',
      );
    }
    const email = createUserDto.email.toLowerCase().trim();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictException('A student with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    let user: User;
    try {
      user = await this.usersRepository.create({
        ...createUserDto,
        email,
        password: hashedPassword,
      });
    } catch (error) {
      if (error?.code === '23505')
        throw new ConflictException('A student with this email address already exists');
      throw error;
    }

    delete user.password;
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Student profile not found');
    }
    return user;
  }

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    return this.usersRepository.findByEmail(email, includePassword);
  }

  async findAll(filters?: {
    courseToTeach?: string;
    courseNeedingHelp?: string;
    role?: string;
  }): Promise<User[]> {
    return this.usersRepository.findAll(filters);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.role !== undefined && !STUDENT_ROLES.includes(updateUserDto.role)) {
      throw new ForbiddenException(
        'Administrator roles cannot be assigned through student account forms',
      );
    }
    const user = await this.findById(id);
    const updated = await this.usersRepository.update(user.id, updateUserDto);
    return updated!;
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = await this.findById(id);
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await this.usersRepository.update(user.id, { password: hashedPassword });
  }

  // Email verification is an internal auth operation, never a public profile field.
  async verifyEmail(id: string): Promise<User> {
    const user = await this.findById(id);
    const updated = await this.usersRepository.update(user.id, { isVerified: true });
    return updated!;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.usersRepository.delete(id);
    return { message: 'Student account deactivated successfully' };
  }
}
