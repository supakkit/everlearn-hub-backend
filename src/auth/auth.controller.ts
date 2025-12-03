import { Body, Controller, Post, Req, Res } from '@nestjs/common';
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
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('NODE_ENV') === 'production';
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

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
      path: '/auth/refresh',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ accessToken });
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthEntity })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = String(req.cookies['refreshToken']);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
      path: '/auth/refresh',
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    return new AuthEntity({ accessToken });
  }

  @Post('logout')
  @ApiOkResponse()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = String(req.cookies['refreshToken']);
    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: this.isProd ? 'strict' : 'lax',
    });
  }
}
