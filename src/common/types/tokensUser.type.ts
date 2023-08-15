import { User } from '@prisma/client';

export type TokensUser = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
