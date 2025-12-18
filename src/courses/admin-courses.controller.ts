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
  Query,
  Get,
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
import { CourseWithLessonResponse } from './responses/course-with-lessons.response';
import { GetCoursesDto } from './dto/get-courses.dto';
import { AllCoursesWithLessonsResponse } from './responses/all-courses-with-lessons.response';
import { ReorderLessonsDto } from 'src/lessons/dto/reorder-lessons.dto';
import { OverviewLesson } from 'src/lessons/responses/overview-lesson.response';

@Controller('admin/courses')
@ApiTags('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiCreatedResponse({ type: CourseResponse })
  @UseInterceptors(FileInterceptor('imageFile'))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    if (!imageFile) {
      throw new NotFoundException('The course thumbnail is required');
    }

    const course = await this.coursesService.create(createCourseDto, imageFile);
    return new CourseResponse(course);
  }

  @Get()
  @ApiOkResponse({ type: AllCoursesWithLessonsResponse })
  async findAllWithLessons(@Query() query: GetCoursesDto) {
    const { courses, total } =
      await this.coursesService.findAllWithLessons(query);
    const allCourses = courses.map(
      (course) => new CourseWithLessonResponse(course),
    );
    return new AllCoursesWithLessonsResponse(allCourses, total);
  }

  @Get(':id')
  @ApiOkResponse({ type: CourseWithLessonResponse })
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOneWithLessonsByAdmin(id);
    if (!course) throw new NotFoundException('Course not found');
    return new CourseWithLessonResponse(course);
  }

  @Patch(':id/lessons/reorder')
  @ApiOkResponse({ type: OverviewLesson, isArray: true })
  async reorderLessons(
    @Param('id') id: string,
    @Body() reorderLessonsDto: ReorderLessonsDto,
  ) {
    const lessons = await this.coursesService.reorderLessons(
      id,
      reorderLessonsDto,
    );
    return lessons.map((lesson) => new OverviewLesson(lesson));
  }

  @Patch(':id')
  @ApiOkResponse({ type: CourseResponse })
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const course = await this.coursesService.update(
      id,
      updateCourseDto,
      imageFile,
    );
    return new CourseResponse(course);
  }

  @Delete(':id')
  @ApiOkResponse({ type: CourseResponse })
  async remove(@Param('id') id: string) {
    const course = await this.coursesService.removeCourse(id);
    return new CourseResponse(course);
  }
}
