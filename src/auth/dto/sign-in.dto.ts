import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'user@gmail.com', description: 'Email address' })
  @IsNotEmpty()
  @Length(2, 255)
  @IsEmail({}, { message: 'Must be email' })
  email: string;

  @ApiProperty({ example: '12345678', description: 'User password' })
  @IsNotEmpty()
  @Length(8, 30)
  @IsString({ message: 'Must be string' })
  password: string;
}
