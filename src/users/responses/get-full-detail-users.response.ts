import { ApiProperty } from '@nestjs/swagger';
import { FullDetailUserResponse } from './full-detail-user.response';

export class GetFullDetailUsersResponse {
  constructor(users: FullDetailUserResponse[], total: number) {
    this.users = users;
    this.total = total;
  }

  @ApiProperty({ type: FullDetailUserResponse, isArray: true })
  users: FullDetailUserResponse[];

  @ApiProperty()
  total: number;
}
