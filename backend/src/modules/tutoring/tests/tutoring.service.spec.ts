import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TutoringService } from '../services/tutoring.service';
import { TutoringRepository } from '../repositories/tutoring.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';
import { SessionType, SessionStatus } from '../entities/tutoring-session.entity';

describe('TutoringService', () => {
  let service: TutoringService;
  let tutoringRepo: any;
  let usersRepo: any;
  let coursesRepo: any;

  beforeEach(async () => {
    tutoringRepo = {
      createSession: jest.fn(),
      bookSession: jest.fn(),
      joinGroupSession: jest.fn(),
      transitionSession: jest.fn(),
      findById: jest.fn(),
      findUserSessions: jest.fn(),
      findOpenGroupSessions: jest.fn(),
      addParticipant: jest.fn(),
      findParticipant: jest.fn(),
      updateStatus: jest.fn(),
    };

    usersRepo = {
      findById: jest.fn(),
    };

    coursesRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutoringService,
        { provide: TutoringRepository, useValue: tutoringRepo },
        { provide: UsersRepository, useValue: usersRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<TutoringService>(TutoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookSession', () => {
    const mockDto = {
      tutorId: 'tutor-uuid',
      courseId: 'course-uuid',
      sessionType: SessionType.ONE_ON_ONE,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    };

    it('should throw BadRequestException if learner books with themselves', async () => {
      await expect(service.bookSession('tutor-uuid', mockDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if tutor does not exist', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.bookSession('learner-uuid', mockDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if course does not exist', async () => {
      usersRepo.findById.mockResolvedValue({
        id: 'tutor-uuid',
        role: 'TUTOR',
        isVerified: true,
        coursesToTeach: ['CSC 201'],
      });
      coursesRepo.findById.mockResolvedValue(null);

      await expect(service.bookSession('learner-uuid', mockDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should successfully book session and add learner as participant', async () => {
      usersRepo.findById.mockResolvedValue({
        id: 'tutor-uuid',
        role: 'TUTOR',
        isVerified: true,
        coursesToTeach: ['CSC 201'],
      });
      coursesRepo.findById.mockResolvedValue({ id: 'course-uuid', code: 'CSC201' });
      tutoringRepo.createSession.mockResolvedValue({ id: 'session-uuid' });
      tutoringRepo.addParticipant.mockResolvedValue({});
      tutoringRepo.bookSession.mockResolvedValue({
        id: 'session-uuid',
        tutorId: 'tutor-uuid',
        participants: [{ learnerId: 'learner-uuid' }],
      });

      const result = await service.bookSession('learner-uuid', mockDto as any);
      expect(result.id).toBe('session-uuid');
      expect(tutoringRepo.bookSession).toHaveBeenCalledWith('learner-uuid', mockDto);
    });
  });

  it('rejects unverified or non-tutor accounts before writing a booking', async () => {
    usersRepo.findById.mockResolvedValue({ id: 'tutor', role: 'LEARNER', isVerified: true });
    coursesRepo.findById.mockResolvedValue({ id: 'course', code: 'CSC201' });
    await expect(
      service.bookSession('learner', {
        tutorId: 'tutor',
        courseId: 'course',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    ).rejects.toThrow(BadRequestException);
    expect(tutoringRepo.bookSession).not.toHaveBeenCalled();
  });

  it('rejects access to a private session by a non-member', async () => {
    tutoringRepo.findById.mockResolvedValue({
      tutorId: 'tutor',
      sessionType: SessionType.ONE_ON_ONE,
      participants: [{ learnerId: 'learner' }],
      status: SessionStatus.SCHEDULED,
    });
    await expect(service.getSessionById('session', 'stranger')).rejects.toThrow(
      'Only session members',
    );
    await expect(service.getSessionById('session', 'learner')).resolves.toHaveProperty(
      'tutorId',
      'tutor',
    );
  });
});
