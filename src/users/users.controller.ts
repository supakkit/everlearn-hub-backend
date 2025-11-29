import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { AuthRequest } from 'src/common/interfaces/auth-request.interface';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { SwaggerAuth } from 'src/common/enums/swagger-auth.enum';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerAuth.ADMIN)
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserEntity(user));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerAuth.USER)
  @ApiOkResponse({ type: UserEntity })
  async getProfile(@Request() req: AuthRequest) {
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return new UserEntity(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerAuth.ADMIN)
  @ApiOkResponse({ type: UserEntity })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new UserEntity(user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerAuth.USER)
  @ApiOkResponse({ type: UserEntity })
  async update(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { role } = req.user;
    if (role !== Role.ADMIN) {
      delete updateUserDto.role;
    }

    const user = await this.usersService.update(
      req.user.sub,
      updateUserDto,
      role,
    );
    return new UserEntity(user);
  }

  @Patch('id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth(SwaggerAuth.ADMIN)
  @ApiOkResponse({ type: UserEntity })
  async updateByAdmin(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(
      req.user.sub,
      updateUserDto,
      req.user.role,
    );
    return new UserEntity(user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth(SwaggerAuth.USER)
  @ApiOkResponse({ type: UserEntity })
  async delete(@Request() req: AuthRequest) {
    const user = await this.usersService.softDelete(req.user.sub);
    return new UserEntity(user);
  }
}
