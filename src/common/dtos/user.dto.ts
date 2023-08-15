import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  createdAt: Date;
}
