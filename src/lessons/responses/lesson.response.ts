import { ApiProperty } from '@nestjs/swagger';
import { PdfResponse } from './pdf.response';
import { getCloudinaryUrl } from 'src/common/utils/getCloudinaryUrl';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { Lesson, Pdf } from '@prisma/client';

export interface LessonWithPdf extends Lesson {
  pdfs?: Pdf[];
}

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
          downloadUrl: getCloudinaryUrl(FileType.PDF, pdf.publicId),
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

  @ApiProperty({ nullable: true, type: [PdfResponse] })
  pdfs: PdfResponse[] | null;
}
