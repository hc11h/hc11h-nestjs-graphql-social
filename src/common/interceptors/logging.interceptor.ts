import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context);
    const isGraphql = gqlCtx.getType() === 'graphql';

    const now = Date.now();

    if (isGraphql) {
      const info = gqlCtx.getInfo();
      const args = gqlCtx.getArgs();

      this.logger.log(
        `GraphQL Request: ${info.parentType.name}.${info.fieldName} - Args: ${JSON.stringify(args)}`,
      );

      return next.handle().pipe(
        tap({
          next: () => {
            const delay = Date.now() - now;
            this.logger.log(
              `GraphQL Response: ${info.fieldName} - Time: ${delay}ms`,
            );
          },
          error: (error) => {
            const delay = Date.now() - now;
            this.logger.error(
              `GraphQL Error: ${info.fieldName} - Time: ${delay}ms - Error: ${error.message}`,
            );
          },
        }),
      );
    }

    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    this.logger.log(`REST Request: ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(
            `REST Response: ${method} ${url} - Status: ${res.statusCode} - Time: ${delay}ms`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(
            `REST Error: ${method} ${url} - Time: ${delay}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
