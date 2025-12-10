import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { ProgressResponse } from './responses/progress.response';
import { CourseProgressResponse } from './responses/course-progress.response';

@Controller('progress')
@ApiTags('progress')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class ProgressesController {
  constructor(private readonly progressesService: ProgressesService) {}

  @Get('lessons/:id/me')
  @ApiOkResponse({ type: ProgressResponse })
  async getLessonProgress(
    @Request() req: AuthRequest,
    @Param('id') id: string,
  ) {
    const progress = await this.progressesService.getLessonProgress(
      req.user.sub,
      id,
    );
    return new ProgressResponse(progress);
  }

  @Get('courses/:id/me')
  @ApiOkResponse({ type: CourseProgressResponse })
  async getCourseProgress(
    @Request() req: AuthRequest,
    @Param('id') id: string,
  ) {
    const progress = await this.progressesService.getCompletedLessonInCourse(
      req.user.sub,
      id,
    );
    return new CourseProgressResponse({
      courseId: id,
      completedLessons: progress,
    });
  }

  @Post('lessons/:id/me')
  @ApiOkResponse({ type: ProgressResponse })
  async completeLesson(@Request() req: AuthRequest, @Param('id') id: string) {
    const progress = await this.progressesService.markLessonCompleted(
      req.user.sub,
      id,
    );
    return new ProgressResponse(progress);
  }

  @Delete('lessons/:id/me')
  @ApiOkResponse({ type: ProgressResponse })
  async deleteUserProgress(
    @Request() req: AuthRequest,
    @Param('id') id: string,
  ) {
    const progress = await this.progressesService.markLessonIncomplete(
      req.user.sub,
      id,
    );
    return new ProgressResponse(progress);
  }
}
