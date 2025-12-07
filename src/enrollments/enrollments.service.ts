import { Injectable } from '@nestjs/common';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProgressesService } from 'src/progresses/progresses.service';
import { EnrolledCourseResponse } from './responses/enrolled-course.response';
import { getCloudinaryUrl } from 'src/common/utils/compute-url-cloudinary';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

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

  async findUserEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: { lessons: true, _count: { select: { lessons: true } } },
        },
      },
    });

    const result: EnrolledCourseResponse[] = [];
    for (const e of enrollments) {
      const totalLessons = e.course._count.lessons;

      const lessonIds = e.course.lessons.map((lesson) => lesson.id);
      const completedLessons =
        await this.progressesService.countCompletedLessonInCourse(
          userId,
          lessonIds,
        );

      const progress =
        totalLessons === 0
          ? 0
          : Math.floor((completedLessons / totalLessons) * 100);

      result.push({
        courseId: e.course.id,
        title: e.course.title,
        thumbnail: getCloudinaryUrl(FileType.IMAGE, e.course.imagePublicId),
        totalLessons,
        completedLessons,
        progressPercentage: progress,
      });
    }

    return result;
  }

  countUserEnrollments(userId: string) {
    return this.prisma.enrollment.count({ where: { userId } });
  }
}
