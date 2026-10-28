import { registerAs } from '@nestjs/config';

export function jwtSecret(environment: NodeJS.ProcessEnv): string {
  const secret = environment.JWT_SECRET;
  const examples = ['development-only-secret-change-me', 'super_secret_jwt_key_study_connect_2026'];
  if (
    environment.NODE_ENV === 'production' &&
    (!secret || secret.length < 32 || examples.includes(secret))
  ) {
    throw new Error(
      'Set JWT_SECRET to a private random value of at least 32 characters before starting the production backend',
    );
  }
  return secret || 'development-only-secret-change-me';
}

export const jwtConfig = registerAs('jwt', () => ({
  secret: jwtSecret(process.env),
  expiresIn: process.env.JWT_EXPIRATION || '7d',
}));
