import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { getSlug } from 'src/common/config/slugify';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  getCategoryNames() {
    return this.prisma.category.findMany();
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    const slug = getSlug(createCategoryDto.name);
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      throw new ConflictException('Category name is already used');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        icon: createCategoryDto.icon,
      },
      include: { _count: { select: { courses: true } } },
    });
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    const data: Prisma.CategoryUpdateInput = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      const slug = getSlug(updateCategoryDto.name);
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        throw new ConflictException('Category name is already used');
      }
      data.slug = slug;
    }

    return this.prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { courses: true } } },
    });
  }

  getCategoriesWithCourseCount() {
    return this.prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
    });
  }

  async removeCategory(categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.courses > 0) {
      throw new BadRequestException('Cannot delete category that has courses');
    }

    return this.prisma.category.delete({
      where: { id: categoryId },
      include: { _count: { select: { courses: true } } },
    });
  }
}
