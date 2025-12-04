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

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  private readonly isProd: boolean;
  private readonly globalPrefix: string;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
    this.globalPrefix = this.configService.get<string>('BASE_URL') || '';
  }

  @Post('signup')
  @ApiCreatedResponse({ type: UserResponse })
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);
    return new UserResponse(user);
  }

  @Post('login')
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
      sameSite: this.isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
      path: `/${this.globalPrefix}/auth/refresh`,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ success: true });
  }

  @Post('refresh')
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
      sameSite: this.isProd ? 'strict' : 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
      path: `/${this.globalPrefix}/auth/refresh`,
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ success: true });
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Token expired');
    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
    });
  }
}
