import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TutoringRepository } from '../repositories/tutoring.repository';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionStatusDto } from '../dto/update-session-status.dto';
import { TutoringSession, SessionStatus, SessionType } from '../entities/tutoring-session.entity';
import { UserRole } from '../../users/entities/user.entity';
import { UsersRepository } from '../../users/repositories/users.repository';
import { CoursesRepository } from '../../courses/repositories/courses.repository';

@Injectable()
export class TutoringService {
  constructor(
    private readonly tutoringRepo: TutoringRepository,
    private readonly usersRepo: UsersRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async bookSession(learnerId: string, dto: CreateSessionDto): Promise<TutoringSession> {
    if (learnerId === dto.tutorId) {
      throw new BadRequestException('You cannot book a tutoring session with yourself');
    }

    const tutor = await this.usersRepo.findById(dto.tutorId);
    if (!tutor) {
      throw new NotFoundException(`Tutor with ID ${dto.tutorId} not found`);
    }

    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.courseId} not found`);
    }

    if (!tutor.isVerified || ![UserRole.TUTOR, UserRole.BOTH].includes(tutor.role))
      throw new BadRequestException('Choose a verified peer tutor');
    if (!Number.isFinite(Date.parse(dto.scheduledAt)) || Date.parse(dto.scheduledAt) <= Date.now())
      throw new BadRequestException('Choose a future date and time');
    const normalize = (code: string) => code.replace(/\s/g, '').toUpperCase();
    if (!tutor.coursesToTeach?.some((code) => normalize(code) === normalize(course.code)))
      throw new BadRequestException('This tutor does not teach the selected course');
    if (dto.topicId) {
      const topic = await this.coursesRepo.findTopicById(dto.topicId);
      if (!topic || topic.courseId !== course.id)
        throw new BadRequestException('Choose a topic from the selected course');
    }
    return this.tutoringRepo.bookSession(learnerId, dto);
  }

  async joinGroupSession(
    learnerId: string,
    sessionId: string,
    notes?: string,
  ): Promise<TutoringSession> {
    return this.tutoringRepo.joinGroupSession(learnerId, sessionId, notes);
  }

  async getMySessions(userId: string): Promise<TutoringSession[]> {
    return this.tutoringRepo.findUserSessions(userId);
  }

  async getSessionById(id: string, userId: string): Promise<TutoringSession> {
    const session = await this.tutoringRepo.findById(id);
    if (!session) {
      throw new NotFoundException(`Tutoring session with ID ${id} not found`);
    }
    const member =
      session.tutorId === userId || session.participants?.some((p) => p.learnerId === userId);
    const openGroup =
      session.sessionType === SessionType.GROUP &&
      [SessionStatus.SCHEDULED, SessionStatus.CONFIRMED].includes(session.status) &&
      new Date(session.scheduledAt).getTime() > Date.now();
    if (!member && !openGroup)
      throw new ForbiddenException('Only session members can view this session');
    return session;
  }

  async updateStatus(
    userId: string,
    sessionId: string,
    dto: UpdateSessionStatusDto,
  ): Promise<TutoringSession> {
    return this.tutoringRepo.transitionSession(userId, sessionId, dto.status);
  }

  async getOpenGroupSessions(courseId?: string): Promise<TutoringSession[]> {
    return this.tutoringRepo.findOpenGroupSessions(courseId);
  }
}
