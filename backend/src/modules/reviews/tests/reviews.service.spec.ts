import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { TutoringRepository } from '../../tutoring/repositories/tutoring.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { SessionStatus } from '../../tutoring/entities/tutoring-session.entity';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepo: any;
  let tutoringRepo: any;
  let usersRepo: any;

  beforeEach(async () => {
    reviewsRepo = {
      createReview: jest.fn(),
      findBySessionAndLearner: jest.fn(),
      findByTutor: jest.fn(),
      calculateTutorRating: jest.fn(),
    };

    tutoringRepo = {
      findById: jest.fn(),
    };

    usersRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: reviewsRepo },
        { provide: TutoringRepository, useValue: tutoringRepo },
        { provide: UsersRepository, useValue: usersRepo },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    const mockDto = {
      sessionId: 'session-1',
      rating: 5,
      comment: 'Excellent explanation!',
    };

    it('should throw NotFoundException if session not found', async () => {
      tutoringRepo.findById.mockResolvedValue(null);

      await expect(service.createReview('learner-1', mockDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if session is not COMPLETED', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.SCHEDULED,
      });

      await expect(service.createReview('learner-1', mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user was not a participant', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.COMPLETED,
        participants: [{ learnerId: 'other-learner' }],
      });

      await expect(service.createReview('learner-1', mockDto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already reviewed', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.COMPLETED,
        participants: [{ learnerId: 'learner-1' }],
      });
      reviewsRepo.findBySessionAndLearner.mockResolvedValue({ id: 'rev-1' });

      await expect(service.createReview('learner-1', mockDto)).rejects.toThrow(BadRequestException);
    });

    it('returns the atomically created review', async () => {
      tutoringRepo.findById.mockResolvedValue({
        id: 'session-1',
        status: SessionStatus.COMPLETED,
        tutorId: 'tutor-1',
        participants: [{ learnerId: 'learner-1' }],
      });
      reviewsRepo.findBySessionAndLearner.mockResolvedValue(null);
      reviewsRepo.createReview.mockResolvedValue({ id: 'rev-1', rating: 5 });
      reviewsRepo.calculateTutorRating.mockResolvedValue({
        average: 4.8,
        count: 10,
      });

      const result = await service.createReview('learner-1', mockDto);
      expect(result.id).toBe('rev-1');
      expect(reviewsRepo.createReview).toHaveBeenCalledWith(
        'learner-1',
        'tutor-1',
        undefined,
        mockDto,
      );
      expect(usersRepo.update).not.toHaveBeenCalled();
    });
  });
});
