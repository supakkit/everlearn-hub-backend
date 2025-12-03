import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { getSlug } from 'src/common/config/slugify';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryFolder } from 'src/common/enums/cloudinary-folder.enum';
import { Prisma } from '@prisma/client';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

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

  findAll() {
    return this.prisma.course.findMany({
      where: { isPublished: true },
      include: { category: true },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id, isPublished: true },
      include: { category: true },
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
}
