import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  constructor(login: AuthEntity) {
    this.accessToken = login.accessToken;
  }

  @ApiProperty()
  accessToken: string;
}
