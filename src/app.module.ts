import { MiddlewareConsumer, Module, NestModule, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { RequestTimingMiddleware } from './common/middleware/timing.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig, { AppConfig } from './config/app.config';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { envValidationSchema } from './config/env.validation';

@Global()
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
      expandVariables: true,
      cache: true,
      validationSchema: envValidationSchema,
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const graphqlConfig = configService.get<AppConfig['graphql']>(
          'app.graphql',
          {
            infer: true,
          },
        );

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          path: graphqlConfig?.path ?? '/graphql',
          playground: graphqlConfig?.playground ?? true,
          introspection: graphqlConfig?.introspection ?? true,
          context: ({ req, res }) => ({ req, res }),
          formatError: (error) => {
            // Format GraphQL errors in a clean, user-friendly way
            const isDevelopment = process.env.NODE_ENV !== 'production';
            
            const formatted: any = {
              message: error.message,
              code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            };

            // Add debug information in development
            if (isDevelopment) {
              formatted.path = error.path;
              formatted.locations = error.locations;
              if (error.extensions?.stacktrace) {
                formatted.extensions = {
                  ...error.extensions,
                  stacktrace: error.extensions.stacktrace,
                };
              }
            } else {
              // In production, only include essential error information
              formatted.extensions = {
                code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
              };
            }

            return formatted;
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, RequestTimingMiddleware).forRoutes('*'); // Apply to all routes
  }
}
