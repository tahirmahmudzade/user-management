import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const currentUser = request.user;
    if (!currentUser)
      throw new UnauthorizedException('Please log in to get access');

    return currentUser;
  },
);
