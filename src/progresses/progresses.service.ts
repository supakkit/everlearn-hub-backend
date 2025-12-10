import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonsService } from 'src/lessons/lessons.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProgressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lessonsService: LessonsService,
  ) {}

  async countCompletedLessonInCourse(userId: string, courseId: string) {
    const lessons = await this.lessonsService.findByCourseId(courseId);
    const lessonIds = lessons.map((lesson) => lesson.id);
    return this.prisma.progress.count({
      where: {
        userId,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
    });
  }

  async getCompletedLessonInCourse(userId: string, courseId: string) {
    const lessons = await this.lessonsService.findByCourseId(courseId);
    const lessonIds = lessons.map((lesson) => lesson.id);

    return this.prisma.progress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
      select: { lessonId: true },
    });
  }

  async getLessonProgress(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId },
    });

    if (!lesson) throw new NotFoundException('Lesson not found in this course');

    const progress = await this.prisma.progress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    return {
      lessonId,
      isCompleted: progress ? true : false,
      completedAt: progress?.completedAt ?? null,
    };
  }

  async markLessonCompleted(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found in this course');

    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {}, // already completed -> no update
      create: {
        userId,
        lessonId,
        completedAt: new Date(),
      },
    });

    return {
      lessonId,
      isCompleted: true,
      completedAt: progress.completedAt,
    };
  }

  async markLessonIncomplete(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found in this course');

    await this.prisma.progress.deleteMany({
      where: {
        userId,
        lessonId,
      },
    });

    return {
      lessonId,
      isCompleted: false,
      completedAt: null,
    };
  }
}
