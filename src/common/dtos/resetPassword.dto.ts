import { IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ResetPasswordDto {
  @MaxLength(20, {
    message(validationArguments) {
      return `Password is too long. Maximal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  @MinLength(8, {
    message(validationArguments) {
      return `Password is too short. Minimal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  @IsString({ message: 'Invalid password' })
  public currentPassword: string;

  @MaxLength(20)
  @MinLength(8, {
    message(validationArguments) {
      return `Password is too short. Minimal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  @IsString({ message: 'Invalid newPassword' })
  public newPassword: string;

  @Match('newPassword', { message: "Passwords don't match" })
  @IsString({ message: "Passwords don't match" })
  public confirmNewPassword: string;
}
