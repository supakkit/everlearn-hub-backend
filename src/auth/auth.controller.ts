import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from 'src/users/responses/user.response';
import { AuthEntity } from './entities/auth.entity';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly isProd: boolean;
  private readonly GLOBAL_PREFIX: string;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
    this.GLOBAL_PREFIX = this.configService.get<string>('GLOBAL_PREFIX') || '';
  }

  @Post('signup')
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @ApiCreatedResponse({ type: UserResponse })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    return new UserResponse(user);
  }

  @Post('login')
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @ApiOkResponse({ type: AuthEntity })
  async login(
    @Body() { email, password, deviceId }: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      email,
      password,
      deviceId,
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: `/${this.GLOBAL_PREFIX}/auth`,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ success: true });
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60, limit: 20 } })
  @ApiOkResponse({ type: AuthEntity })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Token expired');
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: `/${this.GLOBAL_PREFIX}/auth`,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ success: true });
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (refreshToken) await this.authService.logout(refreshToken);

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'none' : 'lax',
      path: `/${this.GLOBAL_PREFIX}/auth`,
    });
  }
}
