import { registerAs } from '@nestjs/config';

type EnsureOptions = {
  defaultValue?: string;
  allowEmpty?: boolean;
};

const ensure = (key: string, options: EnsureOptions = {}): string => {
  const value = process.env[key] ?? options.defaultValue;

  if ((value === undefined || value === null || value === '') && !options.allowEmpty) {
    throw new Error(`Environment variable "${key}" is required but was not provided.`);
  }

  return value as string;
};

export interface AppConfig {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  graphql: {
    path: string;
    playground: boolean;
    introspection: boolean;
  };
}

export default registerAs<AppConfig>('app', () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: ensure('DATABASE_URL'),
  },
  jwt: {
    secret: ensure('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  graphql: {
    path: process.env.GRAPHQL_PATH ?? '/graphql',
    playground: (process.env.GRAPHQL_PLAYGROUND ?? 'true').toLowerCase() === 'true',
    introspection: (process.env.GRAPHQL_INTROSPECTION ?? 'true').toLowerCase() === 'true',
  },
}));
