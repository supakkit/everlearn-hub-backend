import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const options: RedisOptions = {
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),

      reconnectOnError: (err) => {
        this.logger.warn(`Redis reconnect due to error: ${err.message}`);
        return true;
      },
    };

    this.redis = new Redis(options);

    this.redis.on('connect', () => this.logger.log('Redis connected'));
    this.redis.on('error', (err) => this.logger.error('Redis error', err));
    this.redis.on('close', () => this.logger.warn('Redis connection closed'));
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) await this.redis.set(key, value, 'EX', ttlSeconds);
    else await this.redis.set(key, value);
  }

  get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  sadd(key: string, value: string) {
    return this.redis.sadd(key, value);
  }

  scard(key: string) {
    return this.redis.scard(key);
  }
}
