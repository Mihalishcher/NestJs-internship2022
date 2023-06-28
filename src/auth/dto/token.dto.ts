import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({ example: 'token', description: 'User Token' })
  accessToken: string;
}
