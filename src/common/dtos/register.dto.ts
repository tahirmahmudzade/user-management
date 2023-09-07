import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { IsJsonObject } from '../utils/isJsonObject';

export class RegisterDto {
  @ApiProperty({
    description: "User's email",
    example: 'johndoe@gmail.com',
    type: String,
    required: true,
    maxLength: 255,
  })
  @IsEmail(
    {},
    {
      message: 'Invalid email',
    },
  )
  @MaxLength(255, {
    message(validationArguments) {
      return `Email is too long. Maximal length is ${validationArguments.constraints[0]} characters`;
    },
  })
  public email: string;

  @ApiProperty({
    description: "User's first name",
    example: 'John',
    type: String,
    required: true,
  })
  @IsString({ message: 'First name must be a string' })
  public firstName: string;

  @ApiProperty({
    description: "User's last name",
    example: 'Doe',
    type: String,
    required: true,
  })
  @IsString({ message: 'Last name must be a string' })
  public lastName: string;

  @ApiProperty({
    description: "User's password",
    example: '12345678',
    type: String,
    required: true,
    minLength: 8,
    maxLength: 20,
  })
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

  @IsJsonObject()
  public passport: Prisma.InputJsonObject;
}
