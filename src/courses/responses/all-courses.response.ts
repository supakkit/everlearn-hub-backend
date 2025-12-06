import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from './course.response';

export class AllCoursesResponse {
  constructor(courses: CourseResponse[], total: number) {
    this.courses = courses;
    this.total = total;
  }

  @ApiProperty({ type: CourseResponse, isArray: true })
  courses: CourseResponse[];

  @ApiProperty()
  total: number;
}
