import {
  Controller,
  Get,
  Param,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LessonResponse } from './responses/lesson.response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: LessonResponse })
  async getLessonWithProgress(@Param('id') id: string) {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return new LessonResponse(lesson);
  }
}
