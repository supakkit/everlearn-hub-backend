import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '@prisma/client';

export class PublicLesson {
  constructor(lesson: Lesson) {
    this.id = lesson.id;
    this.title = lesson.title;
    this.isPreview = lesson.isPreview;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  isPreview: boolean;
}
