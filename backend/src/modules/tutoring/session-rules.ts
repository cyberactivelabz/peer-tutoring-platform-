import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TutoringSession, SessionStatus, SessionType } from './entities/tutoring-session.entity';

export function assertCanJoin(session: TutoringSession, learnerId: string) {
  if (session.sessionType !== SessionType.GROUP)
    throw new BadRequestException('Only group sessions can be joined directly');
  if (![SessionStatus.SCHEDULED, SessionStatus.CONFIRMED].includes(session.status))
    throw new BadRequestException('This session is no longer open');
  if (new Date(session.scheduledAt).getTime() <= Date.now())
    throw new BadRequestException('This session has already started');
  if (session.tutorId === learnerId)
    throw new BadRequestException('You are already the host/tutor of this session');
  if (session.participants?.some((p) => p.learnerId === learnerId))
    throw new BadRequestException('You have already joined this session');
  if ((session.participants?.length || 0) >= session.maxLearners)
    throw new BadRequestException('This group session is already at full capacity');
}

export function assertCanTransition(
  session: TutoringSession,
  userId: string,
  status: SessionStatus,
) {
  const tutor = session.tutorId === userId;
  if (!tutor && !session.participants?.some((p) => p.learnerId === userId))
    throw new ForbiddenException('You are not a participant in this session');
  if ([SessionStatus.CONFIRMED, SessionStatus.COMPLETED].includes(status) && !tutor)
    throw new ForbiddenException('Only the assigned tutor can confirm or complete a session');
  const allowed = {
    [SessionStatus.SCHEDULED]: [SessionStatus.CONFIRMED, SessionStatus.CANCELLED],
    [SessionStatus.CONFIRMED]: [SessionStatus.COMPLETED, SessionStatus.CANCELLED],
    [SessionStatus.COMPLETED]: [],
    [SessionStatus.CANCELLED]: [],
  };
  if (!allowed[session.status]?.includes(status))
    throw new BadRequestException(
      `Cannot change a ${session.status.toLowerCase()} session to ${status.toLowerCase()}`,
    );
}
