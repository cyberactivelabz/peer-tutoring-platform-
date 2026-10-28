import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { synchronizeSchema } from '../config/database.config';
import { User } from '../modules/users/entities/user.entity';
import { Otp } from '../modules/auth/entities/otp.entity';
import { Course } from '../modules/courses/entities/course.entity';
import { Topic } from '../modules/courses/entities/topic.entity';
import { TutoringSession } from '../modules/tutoring/entities/tutoring-session.entity';
import { SessionParticipant } from '../modules/tutoring/entities/session-participant.entity';
import { StudyPartnerMatch } from '../modules/partners/entities/study-partner-match.entity';
import { Material } from '../modules/materials/entities/material.entity';
import { Review } from '../modules/reviews/entities/review.entity';
import { Report } from '../modules/reports/entities/report.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';

dotenv.config({ quiet: true });

export const dataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'study_connect_db',
  entities: [
    User,
    Otp,
    Course,
    Topic,
    TutoringSession,
    SessionParticipant,
    StudyPartnerMatch,
    Material,
    Review,
    Report,
    Notification,
  ],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: synchronizeSchema(process.env),
  logging: process.env.DB_LOGGING === 'true',
} satisfies DataSourceOptions;

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
