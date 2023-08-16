import { User } from '@prisma/client';

export type TokensUser = {
  accessToken: string;
  user: User;
};
