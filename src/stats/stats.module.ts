import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CoursesModule } from 'src/courses/courses.module';
import { EnrollmentsModule } from 'src/enrollments/enrollments.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [CoursesModule, EnrollmentsModule, RedisModule],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
