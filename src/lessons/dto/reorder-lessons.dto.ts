import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class LessonPositionDto {
  @IsString()
  @ApiProperty()
  lessonId: string;

  @IsInt()
  @ApiProperty()
  position: number;
}

export class ReorderLessonsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonPositionDto)
  @ApiProperty({ type: LessonPositionDto, isArray: true })
  items: LessonPositionDto[];
}
