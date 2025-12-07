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
import { GetCoursesDto } from './dto/get-course.dto';

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
  @ApiOkResponse({ type: CourseResponse })
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    return new CourseResponse(course);
  }
}
