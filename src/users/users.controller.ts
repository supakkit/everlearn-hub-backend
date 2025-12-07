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
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse, isArray: true })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => new UserResponse(user));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse })
  async getProfile(@Request() req: AuthRequest) {
    const user = await this.usersService.findOne(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    return new UserResponse(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    return new UserResponse(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const { role } = req.user;
    if (role !== Role.ADMIN) {
      delete updateUserDto.role;
    }

    const user = await this.usersService.update(
      req.user.sub,
      updateUserDto,
      role,
      avatar,
    );
    return new UserResponse(user);
  }

  @Patch('id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse })
  async updateByAdmin(
    @Request() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(
      req.user.sub,
      updateUserDto,
      req.user.role,
    );
    return new UserResponse(user);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiOkResponse({ type: UserResponse })
  async delete(@Request() req: AuthRequest) {
    const user = await this.usersService.softDelete(req.user.sub);
    return new UserResponse(user);
  }
}
