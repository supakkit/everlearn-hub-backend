import { ApiProperty } from '@nestjs/swagger';

interface Progress {
  lessonId: string;
  isCompleted: boolean;
  completedAt: Date | null;
}

export class ProgressResponse {
  constructor(progress: Progress) {
    this.lessonId = progress.lessonId;
    this.isCompleted = progress.isCompleted;
    this.completedAt = progress.completedAt;
  }

  @ApiProperty()
  lessonId: string;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  completedAt: Date | null;
}
