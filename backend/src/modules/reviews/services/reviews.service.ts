import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsRepository } from '../repositories/reviews.repository';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Review } from '../entities/review.entity';
import { TutoringRepository } from '../../tutoring/repositories/tutoring.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { SessionStatus } from '../../tutoring/entities/tutoring-session.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepo: ReviewsRepository,
    private readonly tutoringRepo: TutoringRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  async createReview(learnerId: string, dto: CreateReviewDto): Promise<Review> {
    const session = await this.tutoringRepo.findById(dto.sessionId);
    if (!session) {
      throw new NotFoundException(`Tutoring session with ID ${dto.sessionId} not found`);
    }

    if (session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews can only be submitted for completed tutoring sessions',
      );
    }

    const isParticipant = session.participants?.some((p) => p.learnerId === learnerId);
    if (!isParticipant) {
      throw new ForbiddenException(
        'Only students who attended this tutoring session can leave a review',
      );
    }

    const existingReview = await this.reviewsRepo.findBySessionAndLearner(dto.sessionId, learnerId);
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this tutoring session');
    }

    const review = await this.reviewsRepo.createReview(
      learnerId,
      session.tutorId,
      session.courseId,
      dto,
    );

    return review;
  }

  async getTutorCourseReviews(tutorId: string, courseId: string): Promise<Review[]> {
    return this.reviewsRepo.findByTutorAndCourse(tutorId, courseId);
  }

  async getTutorReviews(tutorId: string): Promise<Review[]> {
    const tutor = await this.usersRepo.findById(tutorId);
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${tutorId} not found`);
    }

    return this.reviewsRepo.findByTutor(tutorId);
  }
}
