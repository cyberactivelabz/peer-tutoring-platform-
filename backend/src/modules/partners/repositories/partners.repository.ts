import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyPartnerMatch, MatchStatus } from '../entities/study-partner-match.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class PartnersRepository {
  constructor(
    @InjectRepository(StudyPartnerMatch)
    private readonly matchRepo: Repository<StudyPartnerMatch>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createMatch(
    studentAId: string,
    studentBId: string,
    courseId: string,
    _preferredFormat?: string,
    notes?: string,
  ): Promise<StudyPartnerMatch> {
    const match = this.matchRepo.create({
      studentAId,
      studentBId,
      courseId,
      preferredFormat: _preferredFormat,
      notes,
      status: MatchStatus.ACTIVE,
    });
    return this.matchRepo.save(match);
  }

  async findById(id: string): Promise<StudyPartnerMatch | null> {
    return this.matchRepo.findOne({
      where: { id },
      relations: ['studentA', 'studentB', 'course'],
    });
  }

  async findActiveMatchBetween(
    studentAId: string,
    studentBId: string,
    courseId: string,
  ): Promise<StudyPartnerMatch | null> {
    return this.matchRepo.findOne({
      where: [
        {
          studentAId,
          studentBId,
          courseId,
          status: MatchStatus.ACTIVE,
        },
        {
          studentAId: studentBId,
          studentBId: studentAId,
          courseId,
          status: MatchStatus.ACTIVE,
        },
      ],
    });
  }

  async findUserMatches(userId: string): Promise<StudyPartnerMatch[]> {
    return this.matchRepo
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.studentA', 'studentA')
      .leftJoinAndSelect('match.studentB', 'studentB')
      .leftJoinAndSelect('match.course', 'course')
      .where('(match.studentAId = :userId OR match.studentBId = :userId)', {
        userId,
      })
      .orderBy('match.matchedAt', 'DESC')
      .getMany();
  }

  async updateStatus(id: string, status: MatchStatus): Promise<StudyPartnerMatch | null> {
    await this.matchRepo.update(id, { status });
    return this.findById(id);
  }

  async findEligibleCandidate(
    requesterId: string,
    courseId: string,
    _preferredFormat?: string,
    excludedIds: string[] = [],
  ): Promise<User | null> {
    // Find IDs of users already actively matched with requester for this course
    const existingMatches = await this.matchRepo.find({
      where: [
        { studentAId: requesterId, courseId, status: MatchStatus.ACTIVE },
        { studentBId: requesterId, courseId, status: MatchStatus.ACTIVE },
      ],
    });

    const excludedUserIds = new Set<string>([requesterId, ...excludedIds]);
    for (const m of existingMatches) {
      excludedUserIds.add(m.studentAId);
      excludedUserIds.add(m.studentBId);
    }

    // Query for any active student user not in the excluded list
    const candidate = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id NOT IN (:...excludedIds)', {
        excludedIds: Array.from(excludedUserIds),
      })
      .andWhere('user.isVerified = :verified', { verified: true })
      .andWhere('user.isActive = :active', { active: true })
      .andWhere('user.role != :admin', { admin: 'ADMIN' })
      .andWhere(
        `(SELECT regexp_replace(upper(c.code), '[[:space:]]', '', 'g') FROM courses c WHERE c.id = :courseId) = ANY(string_to_array(regexp_replace(upper(COALESCE("user"."coursesToTeach", '') || ',' || COALESCE("user"."coursesNeedingHelp", '')), '[[:space:]]', '', 'g'), ','))`,
        { courseId },
      )
      .orderBy('user.createdAt', 'DESC')
      .getOne();

    return candidate;
  }
}
