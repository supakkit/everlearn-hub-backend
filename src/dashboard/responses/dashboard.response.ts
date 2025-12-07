import { ApiProperty } from '@nestjs/swagger';
import { EnrolledCourseResponse } from 'src/enrollments/responses/enrolled-course.response';
import { UserStatsResponse } from 'src/stats/responses/user-stats.response';

export class DashboardResponse {
  constructor({
    stats,
    enrolledCourses,
  }: {
    stats: UserStatsResponse;
    enrolledCourses: EnrolledCourseResponse[];
  }) {
    this.stats = stats;
    this.enrolledCourses = enrolledCourses;
  }
  @ApiProperty({ type: UserStatsResponse })
  stats: UserStatsResponse;

  @ApiProperty({ type: EnrolledCourseResponse, isArray: true })
  enrolledCourses: EnrolledCourseResponse[];
}
