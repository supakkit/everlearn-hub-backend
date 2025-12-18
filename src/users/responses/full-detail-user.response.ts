import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserResponse } from './user.response';

export class FullDetailUserResponse extends UserResponse {
  constructor(user: User) {
    super(user);
    this.isDeleted = user.isDeleted;
    this.stripeCustomerId = user.stripeCustomerId;
  }

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty({ type: String, nullable: true })
  stripeCustomerId: string | null;
}
