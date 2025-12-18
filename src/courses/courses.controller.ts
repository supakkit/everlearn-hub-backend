import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CourseResponse } from './responses/course.response';
import { AllCoursesResponse } from './responses/all-courses.response';
import { GetCoursesDto } from './dto/get-courses.dto';
import { CourseWithLessonResponse } from './responses/course-with-lessons.response';

@Controller('courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOkResponse({ type: AllCoursesResponse })
  async findAll(@Query() query: GetCoursesDto) {
    const { courses, total } = await this.coursesService.findAll(query);
    const allCourses = courses.map((course) => new CourseResponse(course));
    return new AllCoursesResponse(allCourses, total);
  }

  @Get(':id')
  @ApiOkResponse({ type: CourseWithLessonResponse })
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOneWithLessons(id);
    if (!course) throw new NotFoundException('Course not found');
    return new CourseWithLessonResponse(course);
  }
}
