import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({ allow_utf8_local_part: true }, { message: 'Invalid email' })
  @MaxLength(255, {
    message(validationArguments) {
      return `Email is too long. Maximal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  public email: string;

  @IsString({ message: 'First name must be a string' })
  public firstName: string;

  @IsString({ message: 'Last name must be a string' })
  public lastName: string;

  @IsString({ message: 'Invalid password' })
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
  public password: string;

  @IsString({ message: 'Path to the actual image must be a string' })
  @IsUrl({}, { message: 'Invalid image url format' })
  @IsOptional()
  public imageUrl: string;

  @IsString({ message: 'Path to the actual resume must be a string' })
  @IsOptional()
  public resumeUrl: string;
}
