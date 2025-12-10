import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '@prisma/client';

export class OverviewLesson {
  constructor(lesson: Lesson) {
    this.id = lesson.id;
    this.title = lesson.title;
    this.position = lesson.position;
    this.isPreview = lesson.isPreview;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  isPreview: boolean;
}
