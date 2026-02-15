import * as bcrypt from 'bcrypt';
import { bcryptSaltRounds } from 'src/config';

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(password, bcryptSaltRounds);
  return hashedPassword;
};

export const comparePasswords = (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
