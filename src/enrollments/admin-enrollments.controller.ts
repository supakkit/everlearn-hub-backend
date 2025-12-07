import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { EnrollmentResponse } from './responses/enrollment.response';

@Controller('admin/enrollments')
@ApiTags('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminEnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOkResponse({ type: EnrollmentResponse, isArray: true })
  async findAll() {
    const enrollments = await this.enrollmentsService.findAll();
    return enrollments.map((enrollment) => new EnrollmentResponse(enrollment));
  }

  @Get(':id')
  @ApiOkResponse({ type: EnrollmentResponse })
  async findOne(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.findOne(id);
    if (!enrollment) throw new NotFoundException('Course enrollment not found');
    return new EnrollmentResponse(enrollment);
  }

  @Delete(':id')
  @ApiOkResponse({ type: EnrollmentResponse })
  async remove(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.remove(id);
    return new EnrollmentResponse(enrollment);
  }
}
