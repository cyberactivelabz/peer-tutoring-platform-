import { jwtSecret } from './jwt.config';
describe('JWT secret configuration', () => {
  it.each([
    undefined,
    'short',
    'development-only-secret-change-me',
    'super_secret_jwt_key_study_connect_2026',
  ])('rejects missing or example production secrets', (secret) => {
    expect(() => jwtSecret({ NODE_ENV: 'production', JWT_SECRET: secret })).toThrow(
      'Set JWT_SECRET',
    );
  });
  it('supports a private production secret and preserves local development startup', () => {
    expect(
      jwtSecret({
        NODE_ENV: 'production',
        JWT_SECRET: 'test-only-private-value-with-at-least-32-characters',
      }),
    ).toBe('test-only-private-value-with-at-least-32-characters');
    expect(jwtSecret({ NODE_ENV: 'development' })).toBeTruthy();
  });
});
