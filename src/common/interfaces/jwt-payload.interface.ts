import { $Enums } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  role: $Enums.Role;
}
