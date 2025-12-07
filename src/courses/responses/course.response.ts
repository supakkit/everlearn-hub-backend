import { ApiProperty } from '@nestjs/swagger';
import { Category, Course, Lesson } from '@prisma/client';
import { PublicLesson } from './public-lesson.response';
import { getCloudinaryUrl } from 'src/common/utils/compute-url-cloudinary';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';

export class CourseResponse {
  constructor(course: Course & { category: Category; lessons?: Lesson[] }) {
    this.id = course.id;
    this.title = course.title;
    this.slug = course.slug;
    this.description = course.description;
    this.isFree = course.isFree;
    this.priceBaht = course.priceBaht;
    this.categoryName = course.category.name;
    this.imageUrl = getCloudinaryUrl(FileType.IMAGE, course.imagePublicId);

    if (course.lessons)
      this.lessons = course.lessons.map((lesson) => new PublicLesson(lesson));
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

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({ required: false, type: PublicLesson, isArray: true })
  lessons?: PublicLesson[];
}
