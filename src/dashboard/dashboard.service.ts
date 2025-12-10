import { Injectable } from '@nestjs/common';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { StatsService } from 'src/stats/stats.service';

@Injectable()
export class DashboardService {
  constructor(
    private enrollmentsService: EnrollmentsService,
    private statsService: StatsService,
  ) {}

  async findOne(id: string) {
    const [enrolledCourses, stats] = await Promise.all([
      this.enrollmentsService.getUserEnrollments(id),
      this.statsService.getUserStats(id),
    ]);

    return { enrolledCourses, stats };
  }
}
