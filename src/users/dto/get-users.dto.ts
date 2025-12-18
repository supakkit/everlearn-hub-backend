import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUsersDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  limit?: string;
}
