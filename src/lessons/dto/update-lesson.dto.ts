import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLessonDto } from './create-lesson.dto';
import { IsOptional } from 'class-validator';
import { UpdatePdfDto } from './update-pdf.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsOptional()
  @ApiProperty({ required: false, type: [UpdatePdfDto] })
  pdfs?: string;
}
