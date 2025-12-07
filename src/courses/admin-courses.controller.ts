import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CourseResponse } from './responses/course.response';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin/courses')
@ApiTags('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiCreatedResponse({ type: CourseResponse })
  @UseInterceptors(FileInterceptor('courseThumbnail'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() courseThumbnail: Express.Multer.File,
  ) {
    if (!courseThumbnail) {
      throw new NotFoundException('The course thumbnail is required');
    }

    const course = await this.coursesService.create(
      createCourseDto,
      courseThumbnail,
    );
    return new CourseResponse(course);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CourseResponse })
  @UseInterceptors(FileInterceptor('courseThumbnail'))
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() courseThumbnail?: Express.Multer.File,
  ) {
    const course = await this.coursesService.update(
      id,
      updateCourseDto,
      courseThumbnail,
    );
    return new CourseResponse(course);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CourseResponse })
  async remove(@Param('id') id: string) {
    const course = await this.coursesService.remove(id);
    return new CourseResponse(course);
  }
}
