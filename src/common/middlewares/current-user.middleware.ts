import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/user/user.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (!req.session)
      throw new UnauthorizedException('Please log in to get access');
    const { userId } = req.session || {};

    if (userId) {
      const user: User | null = await this.userService.findUserWithUnique({
        id: userId,
      });
      if (user) {
        req.currentUser = user;
      } else {
        next();
      }
    }
    next();
  }
}
