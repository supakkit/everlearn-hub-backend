import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ToBoolean } from 'src/common/transformers/boolean.transformer';
import { ToNumber } from 'src/common/transformers/number.transformer';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @ToBoolean()
  @IsBoolean()
  @ApiProperty({ default: false })
  isFree: boolean = false;

  @ToNumber()
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  priceBaht: number;

  @ToBoolean()
  @IsBoolean()
  @ApiProperty({ default: false })
  isPublished: boolean = false;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;
}
