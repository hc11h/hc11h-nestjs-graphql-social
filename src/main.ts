import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['health', ''],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
    }),
  );

  // if (process.env.NODE_ENV === 'production') {
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  // }

  // Global interceptors
  // app.useGlobalInterceptors(
  //   new LoggingInterceptor(),
  //   new TransformInterceptor(),
  // );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 API Documentation available at http://localhost:${port}/api`);
  console.log(`graphql is avaible at http://localhost:${port}/grapql `);
}

bootstrap().catch((err) => {
  console.error('❌ Error during bootstrap:', err);
  process.exit(1);
});
