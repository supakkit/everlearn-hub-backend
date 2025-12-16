import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { getSlug } from 'src/common/config/slugify';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { Prisma } from '@prisma/client';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { GetCoursesDto } from './dto/get-course.dto';
import { LessonsService } from 'src/lessons/lessons.service';
import { ReorderLessonsDto } from 'src/lessons/dto/reorder-lessons.dto';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly lessonsService: LessonsService,
  ) {}

  async create(
    createCourseDto: CreateCourseDto,
    courseThumbnail: Express.Multer.File,
  ) {
    const { categoryId, ...dtoData } = createCourseDto;

    const slug = getSlug(createCourseDto.title);
    const existingSlug = await this.prisma.course.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException('Title is already used');
    }

    const uploaded = await this.cloudinaryService.uploadSingleFile(
      courseThumbnail,
      FileType.IMAGE,
      CloudinaryFolder.COURSE_THUMBNAILS,
    );
    const imagePublicId = String(uploaded.public_id);
    return this.prisma.course.create({
      data: {
        ...dtoData,
        slug,
        imagePublicId,
        category: { connect: { id: categoryId } },
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(query: GetCoursesDto) {
    const { page: rawPage, limit: rawLimit, search, category } = query;
    const page = Number(rawPage?.trim()) || 1;
    const limit = Number(rawLimit?.trim()) || 10;

    const filters: Prisma.CourseWhereInput = {
      AND: [
        { isPublished: true },
        category && category !== 'all' ? { category: { slug: category } } : {},
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: filters,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where: filters }),
    ]);

    return { courses, total };
  }

  async findAllWithLessons(query: GetCoursesDto) {
    const { page: rawPage, limit: rawLimit } = query;
    const page = Number(rawPage?.trim()) || 1;
    const limit = Number(rawLimit?.trim()) || 10;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, lessons: { orderBy: { position: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count(),
    ]);

    return { courses, total };
  }

  findOneWithLessons(id: string) {
    return this.prisma.course.findUnique({
      where: { id, isPublished: true },
      include: { category: true, lessons: { orderBy: { position: 'asc' } } },
    });
  }

  findOneWithLessonsByAdmin(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: { category: true, lessons: { orderBy: { position: 'asc' } } },
    });
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    courseThumbnail?: Express.Multer.File,
  ) {
    const { categoryId, ...dtoData } = updateCourseDto;
    const data: Prisma.CourseUpdateInput = dtoData;
    if (updateCourseDto.title) {
      const slug = getSlug(updateCourseDto.title);
      const existingSlug = await this.prisma.course.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        throw new ConflictException('Title is already used');
      }
      data.slug = slug;
    }

    if (categoryId) {
      data.category = {
        connect: { id: categoryId },
      };
    }

    if (courseThumbnail) {
      const currentCourse = await this.prisma.course.findUnique({
        where: { id },
      });

      if (currentCourse?.imagePublicId) {
        await this.cloudinaryService.deleteSingleFile(
          FileType.IMAGE,
          currentCourse.imagePublicId,
        );
      }

      const uploaded = await this.cloudinaryService.uploadSingleFile(
        courseThumbnail,
        FileType.IMAGE,
        CloudinaryFolder.COURSE_THUMBNAILS,
      );
      data.imagePublicId = String(uploaded.public_id);
    }

    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async removeCourse(courseId: string) {
    const currentCourse = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        imagePublicId: true,
      },
    });

    if (!currentCourse) {
      throw new NotFoundException('Course not found');
    }

    if (currentCourse.imagePublicId) {
      await this.cloudinaryService.deleteSingleFile(
        FileType.IMAGE,
        currentCourse.imagePublicId,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      await this.lessonsService.removeByCourse(courseId, tx);

      return await tx.course.delete({
        where: { id: courseId },
        include: {
          category: true,
        },
      });
    });
  }

  countUserCompletedCourses(userId: string) {
    return this.prisma.course.count({
      where: {
        enrollments: { some: { userId } },
        lessons: {
          every: { progresses: { some: { userId, isCompleted: true } } },
        },
      },
    });
  }

  async reorderLessons(courseId: string, reorderLessonsDto: ReorderLessonsDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { select: { id: true } } },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingLessonIds = course.lessons.map((lesson) => lesson.id);
    const incomingLessonIds = reorderLessonsDto.items.map(
      (item) => item.lessonId,
    );

    if (incomingLessonIds.length !== existingLessonIds.length) {
      throw new BadRequestException('Lesson count mismatch');
    }

    const hasDuplicates =
      new Set(incomingLessonIds).size !== existingLessonIds.length;

    if (hasDuplicates) {
      throw new BadRequestException('Position can not duplicate');
    }

    const isBelonged = incomingLessonIds.every((lessonId) =>
      existingLessonIds.includes(lessonId),
    );

    if (!isBelonged) {
      throw new BadRequestException('Lesson does not belong to course');
    }

    const incomingPositions = reorderLessonsDto.items.map(
      (item) => item.position,
    );
    const sortedPositions = [...incomingPositions].sort((a, b) => a - b);
    for (let i = 0; i < existingLessonIds.length; i++) {
      if (sortedPositions[i] !== i + 1) {
        throw new BadRequestException(
          'Positions must be contiguous starting from 1',
        );
      }
    }

    return await this.lessonsService.reorderLessons(reorderLessonsDto);
  }
}
