import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LessonResponse } from './responses/lesson.response';

@Controller('lessons')
@ApiTags('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('preview/:id')
  @ApiOkResponse({ type: LessonResponse })
  async findLessonPreview(@Param('id') id: string) {
    const lesson = await this.lessonsService.findLessonPreview(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return new LessonResponse(lesson);
  }
}
