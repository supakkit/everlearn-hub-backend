import { ApiProperty } from '@nestjs/swagger';
import { Course } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

export class CourseResponse {
  constructor(course: Course & { category: { name: string } }) {
    this.id = course.id;
    this.title = course.title;
    this.slug = course.slug;
    this.description = course.description;
    this.isFree = course.isFree;
    this.priceBaht = course.priceBaht;

    this.imageUrl = course.imagePublicId
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${course.imagePublicId}`
      : null;

    this.categoryName = course.category.name;
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
  categoryName: string;

  @ApiProperty({ nullable: true, default: null })
  imageUrl: string | null;
}
