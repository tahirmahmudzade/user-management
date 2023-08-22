import { IsString, MaxLength, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: "User's current password",
    example: '12345678',
    type: String,
    required: true,
    minLength: 8,
    maxLength: 20,
  })
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

  @ApiProperty({
    description: "User's new password",
    example: '12345678',
    type: String,
    required: true,
    minLength: 8,
    maxLength: 20,
  })
  @MaxLength(20)
  @MinLength(8, {
    message(validationArguments) {
      return `Password is too short. Minimal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  @IsString({ message: 'Invalid new password' })
  public newPassword: string;

  @ApiProperty({
    description: "User's new password confirmation",
    type: String,
    required: true,
  })
  @Match('newPassword', { message: "Passwords don't match" })
  @IsString({ message: "Passwords don't match" })
  public confirmNewPassword: string;
}
