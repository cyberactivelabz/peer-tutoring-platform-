import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { TutoringSession } from '../../tutoring/entities/tutoring-session.entity';
import { Course } from '../../courses/entities/course.entity';

@Entity('reviews')
@Index('UQ_session_review', ['sessionId', 'learnerId'], { unique: true })
export class Review extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => TutoringSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: TutoringSession;

  @Index()
  @Column({ type: 'uuid' })
  tutorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tutorId' })
  tutor: User;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Index()
  @Column({ type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column({ type: 'int' })
  rating: number; // 1 to 5

  @Column({ type: 'text', nullable: true })
  comment: string;
}
