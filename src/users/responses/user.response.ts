import { ApiProperty } from '@nestjs/swagger';
import { $Enums, User } from '@prisma/client';
import { FileType } from 'src/common/enums/cloudinary-filetype.enum';
import { getCloudinaryUrl } from 'src/common/utils/getCloudinaryUrl';

export class UserResponse {
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.createdAt = user.createdAt;

    if (user.avatarPublicId) {
      this.avatarUrl = getCloudinaryUrl(FileType.IMAGE, user.avatarPublicId);
    }
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ default: $Enums.Role.STUDENT })
  role: $Enums.Role;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  createdAt: Date;
}
