import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RedisService } from 'src/redis/redis.service';
import { Role } from '@prisma/client';
import { RedisKey } from 'src/common/utils/redis.keys';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly statsService: StatsService,
  ) {}

  private async getTokens(userId: string, role: Role, deviceId: string) {
    const jwtPayload: JwtPayload = { sub: userId, role, deviceId };
    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(jwtPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async signup(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  async login(email: string, password: string, deviceId: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.getTokens(user.id, user.role, deviceId);

    // Store hashed refresh token in Redis with device identifier
    const hashed = await bcrypt.hash(tokens.refreshToken, 10);
    await this.redisService.set(
      RedisKey.hashedRefreshToken(user.id, deviceId, tokens.refreshToken),
      hashed,
      2 * 24 * 60 * 60, // 2 days TTL
    );

    return tokens;
  }

  async refresh(refreshToken: string) {
    const payload: JwtPayload = this.jwtService.verify(refreshToken);

    const userId = payload.sub;
    const deviceId = payload.deviceId;

    const key = RedisKey.hashedRefreshToken(userId, deviceId, refreshToken);
    const storedHash = await this.redisService.get(key);

    if (!storedHash) throw new ForbiddenException('Invalid refresh token');

    const isValid = await bcrypt.compare(refreshToken, storedHash);
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    // Generate new tokens
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');
    const tokens = await this.getTokens(user.id, user.role, deviceId);

    // Rotate refresh token
    await this.redisService.del(key);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.redisService.set(
      RedisKey.hashedRefreshToken(user.id, deviceId, tokens.refreshToken),
      newHash,
      2 * 24 * 60 * 60, // 2 days TTL
    );

    // Record user activity
    await this.statsService.recordUserActiveDay(userId);

    return tokens;
  }

  async logout(refreshToken: string) {
    const payload: JwtPayload = this.jwtService.verify(refreshToken);

    const userId = payload.sub;
    const deviceId = payload.deviceId;

    await this.redisService.del(
      RedisKey.hashedRefreshToken(userId, deviceId, refreshToken),
    );
  }

  async logoutAll(userId: string) {
    const keys = await this.redisService.keys(
      RedisKey.patternOfUserHashedRefreshTokens(userId),
    );
    for (const key of keys) await this.redisService.del(key);
  }
}
