import { ApiProperty } from '@nestjs/swagger';
import { Category, Course, Lesson } from '@prisma/client';
import { OverviewLesson } from '../../lessons/responses/overview-lesson.response';
import { CourseResponse } from './course.response';

interface CourseWithLesson extends Course {
  category: Category;
  lessons: Lesson[];
}

export class CourseWithLessonResponse extends CourseResponse {
  constructor(course: CourseWithLesson) {
    super(course);
    this.lessons = course.lessons.map((lesson) => new OverviewLesson(lesson));
  }

  @ApiProperty({ type: OverviewLesson, isArray: true })
  lessons: OverviewLesson[];
}
