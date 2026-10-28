import { registerAs } from '@nestjs/config';

export function synchronizeSchema(environment: NodeJS.ProcessEnv): boolean {
  if (environment.DB_SYNCHRONIZE !== undefined) return environment.DB_SYNCHRONIZE === 'true';
  return environment.NODE_ENV !== 'production';
}

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'study_connect_db',
  synchronize: synchronizeSchema(process.env),
  logging: process.env.DB_LOGGING === 'true',
}));
