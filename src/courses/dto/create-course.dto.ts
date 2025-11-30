import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsBoolean()
  @ApiProperty({ default: false })
  isFree: boolean = false;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  priceBaht: number;

  @IsBoolean()
  @ApiProperty({ default: false })
  isPublished: boolean = false;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  categoryId: string;
}
