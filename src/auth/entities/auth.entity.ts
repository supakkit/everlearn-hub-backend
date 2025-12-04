import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  constructor(login: AuthEntity) {
    this.success = login.success;
  }

  @ApiProperty()
  success: boolean;
}
