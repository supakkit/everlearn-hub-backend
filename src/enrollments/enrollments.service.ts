import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProgressesService } from 'src/progresses/progresses.service';
import { EnrolledCourseResponse } from './responses/enrolled-course.response';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressesService: ProgressesService,
  ) {}

  create(userId: string, courseId: string) {
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }

  findAll() {
    return this.prisma.enrollment.findMany();
  }

  findOne(id: string) {
    return this.prisma.enrollment.findUnique({ where: { id } });
  }

  update(updateEnrollmentDto: UpdateEnrollmentDto) {
    const { id, paid } = updateEnrollmentDto;
    return this.prisma.enrollment.update({ where: { id }, data: { paid } });
  }

  remove(id: string) {
    return this.prisma.enrollment.delete({ where: { id } });
  }

  async getUserEnrollment(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('You are not enrolled in this course.');
    }

    const completedLessons =
      await this.progressesService.getCompletedLessonInCourse(
        userId,
        enrollment.courseId,
      );

    return { ...enrollment, completedLessons };
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    });

    const result: EnrolledCourseResponse[] = [];
    for (const e of enrollments) {
      const completedLessons =
        await this.progressesService.getCompletedLessonInCourse(
          userId,
          e.courseId,
        );

      result.push(new EnrolledCourseResponse({ ...e, completedLessons }));
    }

    return result;
  }

  countUserEnrollments(userId: string) {
    return this.prisma.enrollment.count({ where: { userId } });
  }
}
