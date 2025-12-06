import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePdfDto } from './create-pdf.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePdfDto extends PartialType(CreatePdfDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  removedPdfPublicId?: string;
}
