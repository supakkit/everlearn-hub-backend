import { ApiProperty } from '@nestjs/swagger';
import { CreatePdfDto } from './create-pdf.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/transformers/boolean.transformer';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  courseId: string;

  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isPreview?: boolean = false;

  @IsOptional()
  @ApiProperty({ required: false, type: [CreatePdfDto] })
  pdfs?: string;
}
