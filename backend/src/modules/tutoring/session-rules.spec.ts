import { assertCanJoin, assertCanTransition } from './session-rules';
import { SessionStatus, SessionType, TutoringSession } from './entities/tutoring-session.entity';
const session = (changes = {}) =>
  ({
    tutorId: 'tutor',
    sessionType: SessionType.GROUP,
    status: SessionStatus.SCHEDULED,
    scheduledAt: new Date(Date.now() + 86400000),
    participants: [{ learnerId: 'learner' }],
    maxLearners: 2,
    ...changes,
  }) as TutoringSession;

describe('Session lifecycle and participation', () => {
  it('allows a future open group with an available place', () =>
    expect(() => assertCanJoin(session(), 'peer')).not.toThrow());
  it.each([
    { sessionType: SessionType.ONE_ON_ONE },
    { status: SessionStatus.CANCELLED },
    { status: SessionStatus.COMPLETED },
    { scheduledAt: new Date(0) },
    { maxLearners: 1 },
  ])('rejects an unavailable group: %j', (changes) =>
    expect(() => assertCanJoin(session(changes), 'peer')).toThrow(),
  );
  it.each(['learner', 'tutor'])('rejects an existing member or host %s', (id) =>
    expect(() => assertCanJoin(session(), id)).toThrow(),
  );
  it('allows the tutor to confirm, and participants to cancel', () => {
    expect(() => assertCanTransition(session(), 'tutor', SessionStatus.CONFIRMED)).not.toThrow();
    expect(() => assertCanTransition(session(), 'learner', SessionStatus.CANCELLED)).not.toThrow();
  });
  it('rejects a stranger, learner confirmation, skipped confirmation, and reopening terminal sessions', () => {
    expect(() => assertCanTransition(session(), 'stranger', SessionStatus.CANCELLED)).toThrow();
    expect(() => assertCanTransition(session(), 'learner', SessionStatus.CONFIRMED)).toThrow();
    expect(() => assertCanTransition(session(), 'tutor', SessionStatus.COMPLETED)).toThrow();
    expect(() =>
      assertCanTransition(
        session({ status: SessionStatus.CANCELLED }),
        'tutor',
        SessionStatus.CONFIRMED,
      ),
    ).toThrow();
    expect(() =>
      assertCanTransition(
        session({ status: SessionStatus.COMPLETED }),
        'tutor',
        SessionStatus.CANCELLED,
      ),
    ).toThrow();
  });
});
