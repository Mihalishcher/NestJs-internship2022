import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/users.model';
import { SignInDto } from './dto/sign-in.dto';
import { TokenDto } from './dto/token.dto';
import * as bcrypt from 'bcrypt';
import authConstants from './auth-constants';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async generateJwtToken(
    payload: object,
    option: object = null,
  ): Promise<string> {
    return this.jwtService.sign(payload, option);
  }

  private async validateUser(signInDto: SignInDto): Promise<UserDocument> {
    const user = await this.userService.getUserByEmail(signInDto.email);
    const passwordValidation = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (user && passwordValidation) {
      return user;
    }
    throw new UnauthorizedException({ message: 'Wrong email or password' });
  }

  async signIn(signInDto: SignInDto): Promise<TokenDto> {
    const user = await this.validateUser(signInDto);
    const payload = {
      id: user.id,
      email: user.email,
    };

    return {
      accessToken: await this.generateJwtToken(payload),
    };
  }

  async signUp(userDto: User): Promise<TokenDto> {
    const userRecord = await this.userService.getUserByEmail(userDto.email);

    if (userRecord) {
      throw new HttpException(
        'User with this email address already exists',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.createUser(userDto);

    const payload = {
      id: user.id,
      email: user.email,
    };

    return {
      accessToken: await this.generateJwtToken(payload),
    };
  }

  async forgotPassword(email: string): Promise<object> {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new BadRequestException('invalid email');
    }

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    };
    const options = {
      expiresIn: authConstants.expirationTime.passwordReset,
      secret: process.env.SECRET_KEY + user.password,
    };
    const token = await this.generateJwtToken(payload, options);
    const link = `${process.env.APP_URL}/v1/auth/forgot-password/${user.id}?token=${token}`;

    return {
      link,
    };
  }

  async resetPassword(
    id: string,
    token: string,
    password: string,
  ): Promise<UserDocument> {
    const user = await this.userService.getUser(id);

    if (!user) {
      throw new BadRequestException('Invalid link');
    }

    const secret = process.env.SECRET_KEY + user.password;

    try {
      await this.jwtService.verifyAsync(token, { secret });
    } catch (err) {
      throw new BadRequestException('Link expired');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.userService.updateUserPassword(id, hashedPassword);
  }
}
