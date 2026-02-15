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
};

export const databaseUrl = getEnv('DATABASE_URL');
export const jwt = {
  secret: getEnv('JWT_SECRET'),
  expiresIn: getEnv('JWT_EXPIRES_IN'),
};
