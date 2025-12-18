import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Role } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AdminUpdateUserDto {
  @IsEnum(Role)
  @ApiProperty()
  role: $Enums.Role;
}
