import { ApiProperty } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { LessonWithPdf } from 'src/common/interfaces/lesson-with-pdf.interface';
import { PdfResponse } from './pdf.response';

dotenv.config();

export class LessonResponse {
  constructor(lesson: LessonWithPdf) {
    this.id = lesson.id;
    this.title = lesson.title;
    this.content = lesson.content;
    this.position = lesson.position;
    this.courseId = lesson.courseId;
    this.isPreview = lesson.isPreview;
    this.pdfs = lesson?.pdfs
      ? lesson.pdfs.map((pdf) => ({
          publicId: pdf.publicId,
          name: pdf.name,
          description: pdf?.description || null,
          previewUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${pdf.publicId}`,
          downloadUrl: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${pdf.publicId}`,
        }))
      : null;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  position: number;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  isPreview: boolean;

  @ApiProperty({ required: false, nullable: true, type: [PdfResponse] })
  pdfs: PdfResponse[] | null;
}
