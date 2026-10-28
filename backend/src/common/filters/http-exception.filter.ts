import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const errorResponse = res as Record<string, any>;
        message = errorResponse.message || message;
        errors =
          errorResponse.errors ||
          (Array.isArray(errorResponse.message) ? errorResponse.message : null);
      }
    }

    const formattedMessage = Array.isArray(message) ? message[0] : message;

    // Structured logging based on severity
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status ${status} - Error: ${formattedMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status ${status} - Client Error: ${formattedMessage}`,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message: formattedMessage,
      errors: errors || undefined,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
