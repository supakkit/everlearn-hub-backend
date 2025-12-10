import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { getSlug } from 'src/common/config/slugify';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { Prisma } from '@prisma/client';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { GetCoursesDto } from './dto/get-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
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

  findOneWithLessons(id: string) {
    return this.prisma.course.findUnique({
      where: { id, isPublished: true },
      include: { category: true, lessons: { orderBy: { position: 'asc' } } },
    });
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    courseThumbnail?: Express.Multer.File,
  ) {
    const data: Prisma.CourseUpdateInput = { ...updateCourseDto };
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

    if (updateCourseDto.categoryId) {
      data.category = {
        connect: { id: updateCourseDto.categoryId },
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

  remove(id: string) {
    return this.prisma.course.delete({
      where: { id },
      include: { category: true },
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
}
