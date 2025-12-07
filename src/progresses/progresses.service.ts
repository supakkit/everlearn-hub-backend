import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProgressesService {
  constructor(private readonly prisma: PrismaService) {}

  countCompletedLessonInCourse(userId: string, lessonIds: string[]) {
    return this.prisma.progress.count({
      where: {
        userId,
        lessonId: { in: lessonIds },
        isCompleted: true,
      },
    });
  }
}
