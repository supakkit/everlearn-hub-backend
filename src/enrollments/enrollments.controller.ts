import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from '@prisma/client';
import { EnrollmentResponse } from './responses/enrollment.response';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiCreatedResponse({ type: EnrollmentResponse })
  async create(@Param('id') id: string, @Request() req: AuthRequest) {
    const enrollment = await this.enrollmentsService.create(req.user.sub, id);
    return new EnrollmentResponse(enrollment);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: EnrollmentResponse, isArray: true })
  async findAll() {
    const enrollments = await this.enrollmentsService.findAll();
    return enrollments.map((enrollment) => new EnrollmentResponse(enrollment));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: EnrollmentResponse, isArray: true })
  async findUserEnrollments(@Request() req: AuthRequest) {
    const enrollments = await this.enrollmentsService.findUserEnrollments(
      req.user.sub,
    );
    return enrollments.map((enrollment) => new EnrollmentResponse(enrollment));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: EnrollmentResponse })
  async findOne(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.findOne(id);
    if (!enrollment) throw new NotFoundException('Course enrollment not found');
    return new EnrollmentResponse(enrollment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: EnrollmentResponse })
  async remove(@Param('id') id: string) {
    const enrollment = await this.enrollmentsService.remove(id);
    return new EnrollmentResponse(enrollment);
  }
}
