import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateLessonDto } from './create-lesson.dto';
import { IsOptional } from 'class-validator';
import { UpdatePdfDto } from './update-pdf.dto';
import { CreatePdfDto } from './create-pdf.dto';
import { RemovePdfDto } from './remove-pdf.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {
  @IsOptional()
  @ApiProperty({ required: false, type: CreatePdfDto, isArray: true })
  createPdfs?: string;

  @IsOptional()
  @ApiProperty({ required: false, type: UpdatePdfDto, isArray: true })
  updatePdfs?: string;

  @IsOptional()
  @ApiProperty({ required: false, type: RemovePdfDto, isArray: true })
  removePdfs?: string;
}
