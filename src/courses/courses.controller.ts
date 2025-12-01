import {
  Controller,
  Get,
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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CourseResponse } from './responses/course.response';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CourseResponse })
  @UseInterceptors(
    FileInterceptor('courseThumbnail', {
      storage: multer.memoryStorage(),
    }),
  )
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

  @Get()
  @ApiOkResponse({ type: CourseResponse, isArray: true })
  async findAll() {
    const courses = await this.coursesService.findAll();
    return courses.map((course) => new CourseResponse(course));
  }

  @Get(':id')
  @ApiOkResponse({ type: CourseResponse })
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course) throw new NotFoundException('Course not found');
    return new CourseResponse(course);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: CourseResponse })
  @UseInterceptors(
    FileInterceptor('courseThumbnail', {
      storage: multer.memoryStorage(),
    }),
  )
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: CourseResponse })
  async remove(@Param('id') id: string) {
    const course = await this.coursesService.remove(id);
    return new CourseResponse(course);
  }
}
