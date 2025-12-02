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
  NotFoundException,
  UploadedFiles,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { LessonResponse } from './responses/lesson.response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: LessonResponse })
  @UseInterceptors(FilesInterceptor('pdfFiles', 5))
  async create(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFiles() pdfFiles?: Express.Multer.File[] | Express.Multer.File,
  ) {
    if (pdfFiles && !Array.isArray(pdfFiles)) pdfFiles = [pdfFiles];
    const lesson = await this.lessonsService.create(createLessonDto, pdfFiles);
    return new LessonResponse(lesson);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: LessonResponse, isArray: true })
  async findAll() {
    const lessons = await this.lessonsService.findAll();
    return lessons.map((lesson) => new LessonResponse(lesson));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: LessonResponse })
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return new LessonResponse(lesson);
  }

  @Get('preview/:id')
  @ApiOkResponse({ type: LessonResponse })
  async findLessonPreview(@Param('id') id: string) {
    const lesson = await this.lessonsService.findLessonPreview(id);
    if (!lesson) throw new NotFoundException('Lesson not found');
    return new LessonResponse(lesson);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: LessonResponse })
  @UseInterceptors(FilesInterceptor('pdfFiles', 5))
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFiles() pdfFiles?: Express.Multer.File[] | Express.Multer.File,
  ) {
    if (pdfFiles && !Array.isArray(pdfFiles)) pdfFiles = [pdfFiles];
    const lesson = await this.lessonsService.update(
      id,
      updateLessonDto,
      pdfFiles,
    );
    return new LessonResponse(lesson);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOkResponse({ type: LessonResponse })
  async remove(@Param('id') id: string) {
    const lesson = await this.lessonsService.remove(id);
    return new LessonResponse(lesson);
  }
}
