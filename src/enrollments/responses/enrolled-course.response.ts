import { ApiProperty } from '@nestjs/swagger';

export class EnrolledCourseResponse {
  constructor() {}

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  progressPercentage: number;
}
