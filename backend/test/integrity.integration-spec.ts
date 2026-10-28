import { randomUUID } from 'crypto';
import { Client } from 'pg';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../src/database/data-source';
import { AppModule } from '../src/app.module';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { Course } from '../src/modules/courses/entities/course.entity';
import { SessionParticipant } from '../src/modules/tutoring/entities/session-participant.entity';
import {
  TutoringSession,
  SessionStatus,
  SessionType,
} from '../src/modules/tutoring/entities/tutoring-session.entity';
import { Review } from '../src/modules/reviews/entities/review.entity';
import { TutoringService } from '../src/modules/tutoring/services/tutoring.service';
import { TutoringRepository } from '../src/modules/tutoring/repositories/tutoring.repository';
import { PartnersRepository } from '../src/modules/partners/repositories/partners.repository';
import { ReviewsService } from '../src/modules/reviews/services/reviews.service';
import { SessionIntegrity1793154000000 } from '../src/database/migrations/1793154000000-SessionIntegrity';

jest.setTimeout(30000);

describe('PostgreSQL backend integrity (isolated local database)', () => {
  const database = `qa_integrity_${randomUUID().replace(/-/g, '')}`;
  let admin: Client,
    app: INestApplication,
    source: DataSource,
    tutoring: TutoringService,
    repo: TutoringRepository;
  let tutor: User,
    learner: User,
    peer: User,
    third: User,
    wrongCourse: User,
    inactive: User,
    course: Course;
  const password = 'local-integration-test-password';
  const oldDatabase = process.env.DB_DATABASE,
    oldSync = process.env.DB_SYNCHRONIZE;

  beforeAll(async () => {
    const connection = dataSourceOptions as any;
    if (!['localhost', '127.0.0.1', '::1'].includes(connection.host))
      throw new Error(
        'Integration tests require a local PostgreSQL host. Refusing a remote database.',
      );
    admin = new Client({
      host: connection.host,
      port: connection.port,
      user: connection.username,
      password: connection.password,
      database: connection.database,
    });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${database}"`);
    process.env.DB_DATABASE = database;
    process.env.DB_SYNCHRONIZE = 'true';
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication({ logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    source = module.get(DataSource);
    tutoring = module.get(TutoringService);
    repo = module.get(TutoringRepository);
    const hash = await bcrypt.hash(password, 10);
    const user = (email: string, changes = {}) =>
      source
        .getRepository(User)
        .save({
          email,
          password: hash,
          firstName: 'Integration',
          lastName: 'Student',
          role: UserRole.LEARNER,
          isVerified: true,
          coursesNeedingHelp: ['CSC 201'],
          ...changes,
        });
    tutor = await user('tutor@example.test', { role: UserRole.TUTOR, coursesToTeach: ['csc 201'] });
    learner = await user('learner@example.test');
    peer = await user('peer@example.test');
    third = await user('third@example.test');
    wrongCourse = await user('wrong@example.test', { coursesNeedingHelp: ['CSC2010'] });
    inactive = await user('inactive@example.test', { isActive: false });
    course = await source
      .getRepository(Course)
      .save({ code: 'CSC201', title: 'Integration course', department: 'Computing', level: '200' });
  });

  afterAll(async () => {
    if (app) await app.close();
    if (admin) {
      await admin.query(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);
      await admin.end();
    }
    if (oldDatabase === undefined) delete process.env.DB_DATABASE;
    else process.env.DB_DATABASE = oldDatabase;
    if (oldSync === undefined) delete process.env.DB_SYNCHRONIZE;
    else process.env.DB_SYNCHRONIZE = oldSync;
  });

  const booking = (changes = {}) => ({
    tutorId: tutor.id,
    courseId: course.id,
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    locationType: 'PHYSICAL' as any,
    locationVenue: 'Test library',
    ...changes,
  });
  async function token(user: User) {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: user.email, password })
      .expect(200);
    return response.body.data.accessToken;
  }

  it('rejects admin registration/profile elevation through the actual HTTP validation layer', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'elevation@example.test',
        password,
        firstName: 'Test',
        lastName: 'User',
        role: 'ADMIN',
      })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${await token(learner)}`)
      .send({ role: 'ADMIN' })
      .expect(400);
    expect((await source.getRepository(User).findOneByOrFail({ id: learner.id })).role).toBe(
      UserRole.LEARNER,
    );
  });

  it('rejects password-reset tokens as application access tokens, and rejects unverified accounts', async () => {
    const jwt = app.get(JwtService);
    const reset = jwt.sign({ sub: learner.id, email: learner.email, purpose: 'PASSWORD_RESET' });
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${reset}`)
      .expect(401);
    await source.getRepository(User).update(wrongCourse.id, { isVerified: false });
    const unverified = jwt.sign({
      sub: wrongCourse.id,
      email: wrongCourse.email,
      purpose: 'ACCESS',
    });
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${unverified}`)
      .expect(401);
    await source.getRepository(User).update(wrongCourse.id, { isVerified: true });
  });

  it('rolls back the session when creating its booking participant fails', async () => {
    const count = await source.getRepository(TutoringSession).count();
    await expect(repo.bookSession(randomUUID(), booking())).rejects.toThrow();
    expect(await source.getRepository(TutoringSession).count()).toBe(count);
  });

  it('protects private details and enforces legal role-based transitions over HTTP', async () => {
    const session = await tutoring.bookSession(learner.id, booking());
    await request(app.getHttpServer())
      .get(`/api/v1/tutoring/${session.id}`)
      .set('Authorization', `Bearer ${await token(peer)}`)
      .expect(403);
    const learnerToken = await token(learner),
      tutorToken = await token(tutor);
    await request(app.getHttpServer())
      .get(`/api/v1/tutoring/${session.id}`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v1/tutoring/${session.id}/status`)
      .set('Authorization', `Bearer ${learnerToken}`)
      .send({ status: 'CONFIRMED' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/api/v1/tutoring/${session.id}/status`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ status: 'COMPLETED' })
      .expect(400);
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.CONFIRMED });
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.COMPLETED });
    await expect(
      tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.CANCELLED }),
    ).rejects.toThrow('Cannot change');
  });

  it('serializes competing group joins so only the available place is filled', async () => {
    const session = await tutoring.bookSession(
      learner.id,
      booking({ sessionType: SessionType.GROUP, maxLearners: 2 }),
    );
    const results = await Promise.allSettled([
      tutoring.joinGroupSession(peer.id, session.id),
      tutoring.joinGroupSession(third.id, session.id),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(await source.getRepository(SessionParticipant).countBy({ sessionId: session.id })).toBe(
      2,
    );
  });

  it('rejects concurrent duplicate joins and enforces the database unique index', async () => {
    const session = await tutoring.bookSession(
      learner.id,
      booking({ sessionType: SessionType.GROUP, maxLearners: 5 }),
    );
    const results = await Promise.allSettled([
      tutoring.joinGroupSession(peer.id, session.id),
      tutoring.joinGroupSession(peer.id, session.id),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(
      await source
        .getRepository(SessionParticipant)
        .countBy({ sessionId: session.id, learnerId: peer.id }),
    ).toBe(1);
    await expect(
      source.getRepository(SessionParticipant).save({ sessionId: session.id, learnerId: peer.id }),
    ).rejects.toHaveProperty('code', '23505');
  });

  it('matches exact course codes, excludes inactive users, and does not reshuffle back to the excluded peer', async () => {
    const partners = app.get(PartnersRepository);
    const allowed = [tutor.id, peer.id, third.id];
    const match = await partners.findEligibleCandidate(learner.id, course.id);
    expect(allowed).toContain(match?.id);
    expect([wrongCourse.id, inactive.id]).not.toContain(match?.id);
    const other = await partners.findEligibleCandidate(learner.id, course.id, undefined, [
      match!.id,
    ]);
    expect(other?.id).not.toBe(match?.id);
    expect(
      await partners.findEligibleCandidate(learner.id, course.id, undefined, allowed),
    ).toBeNull();
  });

  it('atomically records reviews and keeps aggregate rating/count correct under concurrency', async () => {
    const session = await tutoring.bookSession(
      learner.id,
      booking({ sessionType: SessionType.GROUP, maxLearners: 5 }),
    );
    await tutoring.joinGroupSession(peer.id, session.id);
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.CONFIRMED });
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.COMPLETED });
    const reviews = app.get(ReviewsService);
    await Promise.all([
      reviews.createReview(learner.id, { sessionId: session.id, rating: 5 }),
      reviews.createReview(peer.id, { sessionId: session.id, rating: 1 }),
    ]);
    const updated = await source.getRepository(User).findOneByOrFail({ id: tutor.id });
    expect(Number(updated.rating)).toBe(3);
    expect(updated.reviewCount).toBe(2);
    await expect(
      reviews.createReview(peer.id, { sessionId: session.id, rating: 5 }),
    ).rejects.toThrow('already reviewed');
    expect(await source.getRepository(Review).countBy({ sessionId: session.id })).toBe(2);
  });

  it('allows only one of two simultaneous reviews by the same learner', async () => {
    const session = await tutoring.bookSession(learner.id, booking());
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.CONFIRMED });
    await tutoring.updateStatus(tutor.id, session.id, { status: SessionStatus.COMPLETED });
    const reviews = app.get(ReviewsService);
    const results = await Promise.allSettled([
      reviews.createReview(learner.id, { sessionId: session.id, rating: 4 }),
      reviews.createReview(learner.id, { sessionId: session.id, rating: 4 }),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
    expect(await source.getRepository(Review).countBy({ sessionId: session.id })).toBe(1);
    const profile = await source.getRepository(User).findOneByOrFail({ id: tutor.id });
    expect(profile.reviewCount).toBe(3);
    expect(Number(profile.rating)).toBe(3.33);
  });

  it('applies/reverts the migration and refuses existing duplicates without deleting them', async () => {
    const migration = new SessionIntegrity1793154000000();
    const runner = source.createQueryRunner();
    try {
      await migration.down(runner);
      const session = await tutoring.bookSession(learner.id, booking());
      const duplicate = await source
        .getRepository(SessionParticipant)
        .save({ sessionId: session.id, learnerId: learner.id });
      await expect(migration.up(runner)).rejects.toThrow('Duplicate records');
      expect(
        await source.getRepository(SessionParticipant).countBy({ sessionId: session.id }),
      ).toBe(2);
      await source.getRepository(SessionParticipant).delete(duplicate.id);
      const migrations = new DataSource({
        ...dataSourceOptions,
        type: 'postgres',
        database,
        synchronize: false,
      });
      try {
        await migrations.initialize();
        expect(await migrations.runMigrations()).toHaveLength(1);
        expect(await migrations.runMigrations()).toHaveLength(0);
      } finally {
        if (migrations.isInitialized) await migrations.destroy();
      }
      const indexes = await source.query(
        `SELECT indexname FROM pg_indexes WHERE indexname IN ('UQ_session_participant', 'UQ_session_review')`,
      );
      expect(indexes).toHaveLength(2);
    } finally {
      await runner.release();
    }
  });
});
