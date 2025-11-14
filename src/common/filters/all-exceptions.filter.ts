import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const isGraphQL = host.getType() === ('graphql' as any);

    let status: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || (res as any).error || 'Error';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message =
        exception instanceof Error
          ? exception.message
          : 'Internal server error';
    }

    // Logging
    if (isGraphQL) {
      try {
        const gqlHost = GqlArgumentsHost.create(host);
        const info = gqlHost.getInfo();
        const args = gqlHost.getArgs();
        this.logger.error(
          `GraphQL Error: ${info.parentType.name}.${info.fieldName} - Args: ${JSON.stringify(
            args,
          )} - Status: ${status} - Message: ${JSON.stringify(message)}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      } catch (e) {
        this.logger.error(
          `GraphQL Error: Status: ${status} - Message: ${JSON.stringify(message)}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      }
      
      return;
    }

    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    };

    this.logger.error(
      `REST Error: ${req.method} ${req.url} - Status: ${status} - Message: ${JSON.stringify(
        message,
      )}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    res.status(status).json(errorResponse);
  }
}
