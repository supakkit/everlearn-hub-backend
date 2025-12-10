import {
  Controller,
  Get,
  Body,
  Patch,
  NotFoundException,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserResponse } from './responses/user.response';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/users')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UserResponse, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserResponse(user));
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponse })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new UserResponse(user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserResponse })
  async updateByAdmin(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(
      id,
      updateUserDto,
      req.user.role,
    );
    return new UserResponse(user);
  }
}
