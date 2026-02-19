import { getEnv, getEnvNumber } from './env';

export const port = getEnvNumber('PORT');

export const isProduction = getEnv('NODE_ENV') === 'production';

export const bcryptSaltRounds = getEnvNumber('BYCRYPT_SALT_ROUNDS');

export const database = {
  host: getEnv('DATABASE_HOST'),
  port: getEnvNumber('DATABASE_PORT'),
  user: getEnv('DATABASE_USER'),
  password: getEnv('DATABASE_PASSWORD'),
  name: getEnv('DATABASE_NAME'),
  databaseUrl: getEnv('DATABASE_URL'),
};

export const jwt = {
  accessSecret: getEnv('JWT_ACCESS_SECRET'),
  accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN'),
  refreshSecret: getEnv('JWT_REFRESH_SECRET'),
  refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN'),
};

export const redis = {
  host: getEnv('REDIS_HOST'),
  port: getEnvNumber('REDIS_PORT'),
};

export const admin = {
  email: getEnv('ADMIN_EMAIL'),
  password: getEnv('ADMIN_PASSWORD'),
};
