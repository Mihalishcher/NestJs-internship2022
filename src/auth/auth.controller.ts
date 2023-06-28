import {
  Body,
  Req,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { AuthService } from './auth.service';
import { User, UserDocument } from '../users/users.model';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('Authorization')
@Controller('/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, type: TokenDto })
  @UsePipes(ValidationPipe)
  @Post('/login')
  signIn(@Body() signIn: SignInDto): Promise<TokenDto> {
    return this.authService.signIn(signIn);
  }

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: 200, type: TokenDto })
  @UsePipes(ValidationPipe)
  @Post('/signup')
  signUp(@Body() userDto: User): Promise<TokenDto> {
    return this.authService.signUp(userDto);
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        link: {
          type: 'string',
        },
      },
    },
  })
  @Post('/forgot-password')
  forgotPassword(@Body('email') email: string): Promise<object> {
    return this.authService.forgotPassword(email);
  }

  @ApiOperation({ summary: 'Set new password' })
  @ApiResponse({ status: 200, type: User })
  @Post('/forgot-password/:id')
  resetPassword(
    @Param('id') id: string,
    @Query('token') token: string,
    @Body('password') password: string,
  ): Promise<UserDocument> {
    return this.authService.resetPassword(id, token, password);
  }

  @ApiOperation({ summary: 'Get user(For test JwtAuth)' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        id: {
          type: 'string',
          example: '63bd949ec88d776328ae0737',
        },
        email: {
          type: 'string',
          example: 'user@gmail.com',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Req() req): string {
    return req.user;
  }
}
