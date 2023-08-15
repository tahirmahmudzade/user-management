import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class RegisterDto {
  @IsEmail({ allow_utf8_local_part: true }, { message: 'Invalid email format' })
  public email: string;

  @IsString({ message: 'First name must be a string' })
  public firstName: string;

  @IsString({ message: 'Last name must be a string' })
  public lastName: string;

  @IsString({ message: 'Password must be a string' })
  public password: string;

  @IsString({ message: 'Path to the actual image must be a string' })
  @IsUrl({}, { message: 'Invalid image url format' })
  @IsOptional()
  public imageUrl: string;

  @IsString({ message: 'Path to the actual resume must be a string' })
  @IsOptional()
  public resumeUrl: string;
}
