import { BadRequestException, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';
describe('HTTP error disclosure', () => {
  it('hides internal database error text but preserves validation feedback', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    const json = jest.fn(),
      status = jest.fn(() => ({ json }));
    const host: any = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    };
    const filter = new AllExceptionsFilter();
    filter.catch(new Error('private database details'), host);
    expect(json.mock.calls[0][0].message).toBe('Internal server error');
    filter.catch(new BadRequestException('Choose a future time'), host);
    expect(json.mock.calls[1][0].message).toBe('Choose a future time');
    jest.restoreAllMocks();
  });
});
