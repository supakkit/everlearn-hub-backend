import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RemovePdfDto {
  @IsString()
  @ApiProperty()
  publicId: string;
}
