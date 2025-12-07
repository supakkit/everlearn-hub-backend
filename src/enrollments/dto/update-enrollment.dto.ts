import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsBoolean()
  @ApiProperty()
  paid: boolean;
}
