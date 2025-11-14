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

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
   
    const isGraphQL = host.getType() === ('graphql' as any);

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const error =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).error
        : undefined;

   
    if (isGraphQL) {
      try {
        const gqlHost = GqlArgumentsHost.create(host);
        const info = gqlHost.getInfo();
        this.logger.error(
          `GraphQL HttpException: ${info.parentType.name}.${info.fieldName} - Status: ${status} - Message: ${message}`,
        );
      } catch (e) {
        this.logger.error(
          `GraphQL HttpException: Status: ${status} - Message: ${message}`,
        );
      }
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }
}
