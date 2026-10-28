import { synchronizeSchema } from './database.config';
describe('Database schema synchronization configuration', () => {
  it('honors explicit false in development and production', () => {
    expect(synchronizeSchema({ NODE_ENV: 'development', DB_SYNCHRONIZE: 'false' })).toBe(false);
    expect(synchronizeSchema({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'false' })).toBe(false);
  });
  it('keeps production opt-in and preserves the development default', () => {
    expect(synchronizeSchema({ NODE_ENV: 'production' })).toBe(false);
    expect(synchronizeSchema({ NODE_ENV: 'development' })).toBe(true);
    expect(synchronizeSchema({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'true' })).toBe(true);
  });
});
