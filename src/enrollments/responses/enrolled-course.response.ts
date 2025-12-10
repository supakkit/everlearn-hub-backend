import { ApiProperty } from '@nestjs/swagger';
import { Course, Enrollment } from '@prisma/client';

interface EnrolledCourse extends Enrollment {
  course: Course & {
    _count: {
      lessons: number;
    };
  };
  completedLessons: { lessonId: string }[];
}

export class EnrolledCourseResponse {
  constructor(enrolledCourse: EnrolledCourse) {
    this.courseId = enrolledCourse.courseId;
    this.title = enrolledCourse.course.title;
    this.totalLessons = enrolledCourse.course._count.lessons;
    this.completedLessons = enrolledCourse.completedLessons.map(
      (lesson) => lesson.lessonId,
    );
    this.progressPercentage =
      this.totalLessons === 0
        ? 0
        : Math.floor((this.completedLessons.length / this.totalLessons) * 100);
  }

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  completedLessons: string[];

  @ApiProperty()
  progressPercentage: number;
}
