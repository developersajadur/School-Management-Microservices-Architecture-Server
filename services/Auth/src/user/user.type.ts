import { Role } from '@prisma/client';

export type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isBlocked: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type JwtUserPayload = {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
};
