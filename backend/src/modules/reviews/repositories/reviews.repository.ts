import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
  ) {}

  async createReview(
    learnerId: string,
    tutorId: string,
    courseId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    try {
      return await this.reviewRepo.manager.transaction(async (manager) => {
        // Serialize rating changes for this tutor across concurrent reviews.
        const tutor = await manager.findOne(User, {
          where: { id: tutorId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!tutor) throw new NotFoundException('Tutor not found');
        const existing = await manager.findOne(Review, {
          where: { sessionId: dto.sessionId, learnerId },
        });
        if (existing)
          throw new BadRequestException('You have already reviewed this tutoring session');
        const review = await manager.save(
          Review,
          manager.create(Review, {
            sessionId: dto.sessionId,
            tutorId,
            learnerId,
            courseId,
            rating: dto.rating,
            comment: dto.comment,
          }),
        );
        const stats = await manager
          .createQueryBuilder(Review, 'review')
          .select('AVG(review.rating)', 'average')
          .addSelect('COUNT(*)', 'count')
          .where('review.tutorId = :tutorId', { tutorId })
          .getRawOne();
        await manager.update(User, tutorId, {
          rating: Number(Number(stats.average).toFixed(2)),
          reviewCount: Number(stats.count),
        });
        return review;
      });
    } catch (error) {
      if (error?.code === '23505')
        throw new BadRequestException('You have already reviewed this tutoring session');
      throw error;
    }
  }

  async findBySessionAndLearner(sessionId: string, learnerId: string): Promise<Review | null> {
    return this.reviewRepo.findOne({
      where: { sessionId, learnerId },
    });
  }

  async findByTutor(tutorId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { tutorId },
      relations: ['learner', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTutorAndCourse(tutorId: string, courseId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { tutorId, courseId },
      relations: ['learner', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculateTutorRating(tutorId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.reviewRepo.find({ where: { tutorId } });
    if (!reviews.length) {
      return { average: 0, count: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = parseFloat((sum / reviews.length).toFixed(2));
    return { average, count: reviews.length };
  }
}
