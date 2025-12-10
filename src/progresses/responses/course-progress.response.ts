import { ApiProperty } from '@nestjs/swagger';

interface CourseProgress {
  courseId: string;
  completedLessons: { lessonId: string }[];
}

export class CourseProgressResponse {
  constructor(courseProgress: CourseProgress) {
    this.courseId = courseProgress.courseId;
    this.completedLessons = courseProgress.completedLessons.map(
      (lesson) => lesson.lessonId,
    );
  }

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  completedLessons: string[];
}
