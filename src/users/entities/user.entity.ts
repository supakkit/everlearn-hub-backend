import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import * as dotenv from 'dotenv';

dotenv.config();

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: $Enums.Role;

  @ApiProperty({ required: false, nullable: true })
  avatarPublicId: string | null;

  // Computed URL for frontend display
  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Full URL to the user avatar derived from Cloudinary public ID',
  })
  @Expose()
  get avatarUrl(): string | null {
    if (!this.avatarPublicId) return null;

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${this.avatarPublicId}`;
  }

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ required: false, nullable: true })
  deletedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  password: string;
}
