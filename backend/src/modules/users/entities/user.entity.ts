import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';

export enum UserRole {
  LEARNER = 'LEARNER',
  TUTOR = 'TUTOR',
  BOTH = 'BOTH',
  STUDY_PARTNER = 'STUDY_PARTNER',
  ADMIN = 'ADMIN',
}

// Public account flows may select student roles only. Admins are provisioned separately.
export const STUDENT_ROLES = [
  UserRole.LEARNER,
  UserRole.TUTOR,
  UserRole.BOTH,
  UserRole.STUDY_PARTNER,
];

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  matricNumber: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  level: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BOTH,
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber: string;

  @Column('simple-array', { nullable: true })
  coursesToTeach: string[];

  @Column('simple-array', { nullable: true })
  coursesNeedingHelp: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 0 })
  totalSessionsGiven: number;

  @Column({ type: 'int', default: 0 })
  totalSessionsAttended: number;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
