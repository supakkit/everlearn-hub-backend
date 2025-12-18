import {
  Controller,
  Get,
  Body,
  Patch,
  NotFoundException,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { FullDetailUserResponse } from './responses/full-detail-user.response';
import { GetUsersDto } from './dto/get-users.dto';
import { GetFullDetailUsersResponse } from './responses/get-full-detail-users.response';

@Controller('admin/users')
@ApiTags('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiCookieAuth()
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: GetFullDetailUsersResponse })
  async findAll(@Query() query: GetUsersDto) {
    const { users, total } = await this.usersService.findAll(query);
    return new GetFullDetailUsersResponse(
      users.map((user) => new FullDetailUserResponse(user)),
      total,
    );
  }

  @Get(':id')
  @ApiOkResponse({ type: FullDetailUserResponse })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new FullDetailUserResponse(user);
  }

  @Patch(':id')
  @ApiOkResponse({ type: FullDetailUserResponse })
  async updateByAdmin(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
  ) {
    const user = await this.usersService.adminUpdateUser(
      id,
      adminUpdateUserDto,
    );
    return new FullDetailUserResponse(user);
  }
}
