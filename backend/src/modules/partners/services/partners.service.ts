import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PartnersRepository } from '../repositories/partners.repository';
import { FindPartnerDto } from '../dto/find-partner.dto';
import { ReshufflePartnerDto } from '../dto/reshuffle-partner.dto';
import { StudyPartnerMatch, MatchStatus } from '../entities/study-partner-match.entity';
import { CoursesRepository } from '../../courses/repositories/courses.repository';

@Injectable()
export class PartnersService {
  constructor(
    private readonly partnersRepo: PartnersRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async matchPartner(userId: string, dto: FindPartnerDto): Promise<StudyPartnerMatch> {
    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    const candidate = await this.partnersRepo.findEligibleCandidate(
      userId,
      dto.courseId,
      dto.preferredFormat,
    );

    if (!candidate) {
      throw new NotFoundException(
        'No eligible peer study partner found at this moment for this course. Please try again later.',
      );
    }

    const match = await this.partnersRepo.createMatch(
      userId,
      candidate.id,
      dto.courseId,
      dto.preferredFormat,
      dto.notes,
    );

    return (await this.partnersRepo.findById(match.id))!;
  }

  async getMyPartners(userId: string): Promise<StudyPartnerMatch[]> {
    return this.partnersRepo.findUserMatches(userId);
  }

  async reshufflePartner(
    userId: string,
    matchId: string,
    dto: ReshufflePartnerDto,
  ): Promise<{ previousMatch: StudyPartnerMatch; newMatch?: StudyPartnerMatch }> {
    const match = await this.partnersRepo.findById(matchId);
    if (!match) {
      throw new NotFoundException(`Match with ID ${matchId} not found`);
    }

    if (match.studentAId !== userId && match.studentBId !== userId) {
      throw new ForbiddenException('You are not authorized to reshuffle this study partner match');
    }

    if (match.status !== MatchStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot reshuffle a match that is already ${match.status.toLowerCase()}`,
      );
    }

    // Mark previous match as reshuffled
    const previousMatch = (await this.partnersRepo.updateStatus(matchId, MatchStatus.RESHUFFLED))!;

    // Attempt to find a new eligible study partner
    let newMatch: StudyPartnerMatch | undefined;
    const candidate = await this.partnersRepo.findEligibleCandidate(
      userId,
      match.courseId,
      match.preferredFormat,
      [match.studentAId === userId ? match.studentBId : match.studentAId],
    );

    if (candidate) {
      const created = await this.partnersRepo.createMatch(
        userId,
        candidate.id,
        match.courseId,
        match.preferredFormat,
        dto.reason ? `Reshuffled match: ${dto.reason}` : 'Reshuffled match',
      );
      newMatch = (await this.partnersRepo.findById(created.id)) || undefined;
    }

    return { previousMatch, newMatch };
  }
}
