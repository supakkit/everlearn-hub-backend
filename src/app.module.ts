import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { PdfsModule } from './pdfs/pdfs.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { CategoriesModule } from './categories/categories.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StatsModule } from './stats/stats.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProgressesModule } from './progresses/progresses.module';
import { PaymentsModule } from './payments/payments.module';
import { StripeModule } from './stripe/stripe.module';
import { HealthModule } from './health/health.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60, // seconds
          limit: 100, // requests per TTL
        },
      ],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    CoursesModule,
    LessonsModule,
    PdfsModule,
    RedisModule,
    CategoriesModule,
    EnrollmentsModule,
    StatsModule,
    DashboardModule,
    ProgressesModule,
    PaymentsModule,
    StripeModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
