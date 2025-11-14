import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
   
    const gqlCtx = GqlExecutionContext.create(context);
    const isGraphql = gqlCtx.getType() === 'graphql';

    let statusCode = 200;

    if (!isGraphql) {
      const res = context.switchToHttp().getResponse();
      statusCode = res?.statusCode ?? 200;
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'Success',
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
