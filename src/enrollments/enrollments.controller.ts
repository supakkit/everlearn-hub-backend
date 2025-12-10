import {
  Controller,
  Post,
  Param,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EnrollmentResponse } from './responses/enrollment.response';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { EnrolledCourseResponse } from './responses/enrolled-course.response';

@Controller('enrollments')
@ApiTags('enrollments')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post(':id')
  @ApiCreatedResponse({ type: EnrollmentResponse })
  async create(@Param('id') id: string, @Request() req: AuthRequest) {
    const enrollment = await this.enrollmentsService.create(req.user.sub, id);
    return new EnrollmentResponse(enrollment);
  }

  @Get('courses/:id/me')
  @ApiOkResponse({ type: EnrolledCourseResponse })
  async getUserEnrollment(
    @Param('id') id: string,
    @Request() req: AuthRequest,
  ) {
    const enrollment = await this.enrollmentsService.getUserEnrollment(
      req.user.sub,
      id,
    );
    return new EnrolledCourseResponse(enrollment);
  }
}
