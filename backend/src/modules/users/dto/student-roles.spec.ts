import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { UserRole } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

describe('Student account boundaries', () => {
  it('rejects ADMIN for public registration and profile updates', async () => {
    for (const type of [CreateUserDto, UpdateUserDto]) {
      const dto = Object.assign(new type(), { role: UserRole.ADMIN });
      expect((await validate(dto)).some((error) => error.property === 'role')).toBe(true);
    }
  });
  it('rejects arrays containing non-string course values', async () => {
    expect(
      (await validate(Object.assign(new UpdateUserDto(), { coursesToTeach: [{}] }))).some(
        (error) => error.property === 'coursesToTeach',
      ),
    ).toBe(true);
  });
  it('blocks elevation even if a caller bypasses DTO validation', async () => {
    const repo: any = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    };
    const service = new UsersService(repo);
    await expect(
      service.create({ email: 'x@example.test', role: UserRole.ADMIN } as CreateUserDto),
    ).rejects.toThrow('Administrator roles');
    await expect(service.update('learner', { role: UserRole.ADMIN })).rejects.toThrow(
      'Administrator roles',
    );
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });
});
