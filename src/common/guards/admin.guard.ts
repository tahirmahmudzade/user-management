import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.currentUser)
      throw new UnauthorizedException(
        'Please log in to get access to this page',
      );
    if (request.currentUser.role === 'ADMIN') {
      return true;
    }
    return false;
  }
}
