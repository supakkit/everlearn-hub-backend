import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRequest } from 'src/common/interfaces/auth-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) return true; // No roles specified, access granted

    // Previous AuthGuard has attached the 'user' object to the request
    const request: AuthRequest = context.switchToHttp().getRequest();

    // Check if the user has the required role
    return requiredRoles.includes(request.user.role);
  }
}
