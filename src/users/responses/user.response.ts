import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

export class UserResponse {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.createdAt = user.createdAt;

    this.avatarUrl = user.avatarPublicId
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${user.avatarPublicId}`
      : null;
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ default: $Enums.Role.STUDENT })
  role: $Enums.Role;

  @ApiProperty({ required: false, nullable: true, default: null })
  avatarUrl: string | null;

  @ApiProperty()
  createdAt: Date;
}
