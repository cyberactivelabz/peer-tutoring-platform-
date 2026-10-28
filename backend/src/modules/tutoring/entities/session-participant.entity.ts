import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { TutoringSession } from './tutoring-session.entity';

@Entity('session_participants')
@Index('UQ_session_participant', ['sessionId', 'learnerId'], { unique: true })
export class SessionParticipant extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => TutoringSession, (session) => session.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session: TutoringSession;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learnerId' })
  learner: User;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
