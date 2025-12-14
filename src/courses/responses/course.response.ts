import { ApiProperty } from '@nestjs/swagger';
import { Category, Course } from '@prisma/client';
import { getCloudinaryUrl } from 'src/common/utils/getCloudinaryUrl';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

export class CourseResponse {
  constructor(course: Course & { category: Category }) {
    this.id = course.id;
    this.title = course.title;
    this.slug = course.slug;
    this.description = course.description;
    this.isFree = course.isFree;
    this.priceBaht = course.priceBaht;
    this.isPublished = course.isPublished;
    this.categoryName = course.category.name;
    this.categoryId = course.categoryId;
    this.imageUrl = getCloudinaryUrl(FileType.IMAGE, course.imagePublicId);
    this.createdAt = course.createdAt;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ default: false })
  isFree: boolean;

  @ApiProperty({ default: 0 })
  priceBaht: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  createdAt: Date;
}
