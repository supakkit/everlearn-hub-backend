import { Lesson, Pdf } from '@prisma/client';

export interface LessonWithPdf extends Lesson {
  pdfs?: Pdf[];
}
