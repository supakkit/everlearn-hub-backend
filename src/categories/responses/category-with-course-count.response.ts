import { ApiProperty } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { CategoryResponse } from './category.response';

export class CategoryWithCourseCountResponse extends CategoryResponse {
  constructor(category: Category & { _count: { courses: number } }) {
    super(category);
    this.courseCount = category._count.courses;
  }

  @ApiProperty()
  courseCount: number;
}
