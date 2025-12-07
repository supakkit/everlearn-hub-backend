import { Injectable } from '@nestjs/common';
import { RedisKey } from 'src/common/utils/redis.keys';
import { CoursesService } from 'src/courses/courses.service';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { RedisService } from 'src/redis/redis.service';
import { UserStatsResponse } from './responses/user-stats.response';

@Injectable()
export class StatsService {
  constructor(
    private coursesService: CoursesService,
    private enrollmentsService: EnrollmentsService,
    private redisService: RedisService,
  ) {}

  async recordUserActiveDay(userId: string) {
    const now = new Date();
    const year = now.getFullYear();
    const today = now.toISOString().split('T')[0];

    await this.redisService.sadd(RedisKey.activeDays(userId, year), today);
  }

  async countUserActiveDays(userId: string, year: number) {
    return this.redisService.scard(RedisKey.activeDays(userId, year));
  }

  async getUserStats(userId: string): Promise<UserStatsResponse> {
    const [completedCourses, totalEnrolledCourses, activeDaysThisYear] =
      await Promise.all([
        this.coursesService.countUserCompletedCourses(userId),
        this.enrollmentsService.countUserEnrollments(userId),
        this.countUserActiveDays(userId, new Date().getFullYear()),
      ]);

    return { completedCourses, totalEnrolledCourses, activeDaysThisYear };
  }
}
