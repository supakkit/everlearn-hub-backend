import { ApiProperty } from '@nestjs/swagger';
import { CourseWithLessonResponse } from './course-with-lessons.response';

export class AllCoursesWithLessonsResponse {
  constructor(courses: CourseWithLessonResponse[], total: number) {
    this.courses = courses;
    this.total = total;
  }

  @ApiProperty({ type: CourseWithLessonResponse, isArray: true })
  courses: CourseWithLessonResponse[];

  @ApiProperty()
  total: number;
}
