import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponse {
  @ApiProperty()
  completedCourses: number;

  @ApiProperty()
  totalEnrolledCourses: number;

  @ApiProperty()
  activeDaysThisYear: number;
}
