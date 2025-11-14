import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production', 'staging')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  GRAPHQL_PATH: Joi.string().default('/graphql'),
  GRAPHQL_PLAYGROUND: Joi.boolean().truthy('true').falsy('false').default(true),
  GRAPHQL_INTROSPECTION: Joi.boolean().truthy('true').falsy('false').default(true),
});


