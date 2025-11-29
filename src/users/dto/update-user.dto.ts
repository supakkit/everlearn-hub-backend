import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEnum(Role)
  @IsOptional()
  @ApiProperty({ required: false })
  role?: $Enums.Role;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  avatarUrl?: string;
}
